export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface EvaluationResult {
  score: number;
  feedbacks: string[];
}

// --------------------------------------------------------
// MATH AND DISTANCE UTILITIES
// --------------------------------------------------------

export function distance(p1: Landmark, p2: Landmark): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
}

// Calculates angles between three landmarks (P1-P2-P3 with P2 as vertex)
export function angleBetweenPoints(p1: Landmark, p2: Landmark, p3: Landmark): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const len1 = Math.hypot(v1.x, v1.y, v1.z);
  const len2 = Math.hypot(v2.x, v2.y, v2.z);

  if (len1 === 0 || len2 === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / (len1 * len2)))) * (180 / Math.PI);
}

// --------------------------------------------------------
// CORE GEOMETRIC CLASSIFICATION ENGINE
// --------------------------------------------------------

export function evaluateMudra(mudraId: string, landmarks: Landmark[] | null | undefined): EvaluationResult {
  if (!landmarks || landmarks.length < 21) {
    return { score: 0, feedbacks: ["No hand detected in camera frame. Adjust position."] };
  }

  const feedbacks: string[] = [];
  
  // Hand reference scale (Wrist to Middle Finger MCP joint)
  // This ensures the classifier is fully scale-invariant
  const handSize = distance(landmarks[0], landmarks[9]);
  if (handSize === 0) {
    return { score: 0, feedbacks: ["System calibrating... Hold hand steady."] };
  }

  // 1. Calculate relative finger extension ratios (TIP to corresponding MCP)
  const indexMCP_Tip = distance(landmarks[8], landmarks[5]) / handSize;
  const middleMCP_Tip = distance(landmarks[12], landmarks[9]) / handSize;
  const ringMCP_Tip = distance(landmarks[16], landmarks[13]) / handSize;
  const pinkyMCP_Tip = distance(landmarks[20], landmarks[17]) / handSize;
  const thumbMCP_Tip = distance(landmarks[4], landmarks[2]) / handSize;

  // 2. Transversal distances (Tip-to-tip closeness testing)
  const index_middle_dist = distance(landmarks[8], landmarks[12]) / handSize;
  const middle_ring_dist = distance(landmarks[12], landmarks[16]) / handSize;
  const ring_pinky_dist = distance(landmarks[16], landmarks[20]) / handSize;
  
  const thumb_ring_dist = distance(landmarks[4], landmarks[16]) / handSize;
  const thumb_index_dist = distance(landmarks[4], landmarks[8]) / handSize;
  const thumb_middle_dist = distance(landmarks[4], landmarks[12]) / handSize;

  let totalScore = 0;
  let checksCount = 0;

  const checkExtension = (value: number, min: number, max: number, name: string, weight = 1) => {
    checksCount += weight;
    if (value >= min && value <= max) {
      totalScore += 100 * weight;
    } else {
      const deficiency = value < min ? "straighten" : "bend";
      if (value < min) {
        feedbacks.push(`Erect and straighten your ${name} finger.`);
        totalScore += (value / min) * 100 * weight;
      } else {
        feedbacks.push(`Breathe and relax your ${name} finger slightly.`);
        totalScore += (max / value) * 100 * weight;
      }
    }
  };

  const checkFoldStatus = (value: number, threshold: number, name: string, weight = 1) => {
    checksCount += weight;
    if (value <= threshold) {
      totalScore += 100 * weight;
    } else {
      feedbacks.push(`Fold your ${name} finger securely into the palm.`);
      const penalty = Math.max(0, 1 - (value - threshold) / 0.8);
      totalScore += penalty * 100 * weight;
    }
  };

  const checkTipPinch = (actualDist: number, maxThreshold: number, pairName: string, weight = 1.5) => {
    checksCount += weight;
    if (actualDist <= maxThreshold) {
      totalScore += 100 * weight;
    } else {
      feedbacks.push(`Ensure tips of ${pairName} touch precisely.`);
      const penalty = Math.max(0, 1 - (actualDist - maxThreshold) / 1.0);
      totalScore += penalty * 100 * weight;
    }
  };

  const checkFanning = (actualDist: number, minThreshold: number, gapName: string, weight = 1) => {
    checksCount += weight;
    if (actualDist >= minThreshold) {
      totalScore += 100 * weight;
    } else {
      feedbacks.push(`Spread the gap between ${gapName} wider.`);
      totalScore += (actualDist / minThreshold) * 100 * weight;
    }
  };

  // Perform classification logic per mudra ID
  switch (mudraId.toLowerCase()) {
    case "pataka": {
      // Requirements: All 4 fingers straight (> 1.25) & pressed close together (< 0.28)
      // Thumb flat/pressed on index side (< 0.5)
      checkExtension(indexMCP_Tip, 1.2, 2.0, "index");
      checkExtension(middleMCP_Tip, 1.2, 2.0, "middle");
      checkExtension(ringMCP_Tip, 1.2, 2.0, "ring");
      checkExtension(pinkyMCP_Tip, 1.1, 2.0, "pinky");
      
      // Thumb adducted close to palm/index
      checksCount += 1;
      const thumbAdducted = distance(landmarks[4], landmarks[5]) / handSize;
      if (thumbAdducted < 0.6) {
        totalScore += 100;
      } else {
        feedbacks.push("Press your thumb neatly flat against the side of the palm.");
        totalScore += Math.max(0, (1 - (thumbAdducted - 0.6) / 0.8)) * 100;
      }

      // Check closeness of fingers (fingers joined)
      checksCount += 1;
      const gaps = index_middle_dist + middle_ring_dist + ring_pinky_dist;
      if (gaps < 0.95) {
        totalScore += 100;
      } else {
        feedbacks.push("Squeeze your fingers together to close any open gaps.");
        totalScore += Math.max(20, (1 - (gaps - 0.95) / 1.0)) * 100;
      }
      break;
    }

    case "tripataka": {
      // Requirements: Index, Middle, Pinky straight. Ring finger bent (< 0.6)
      checkExtension(indexMCP_Tip, 1.2, 2.0, "index");
      checkExtension(middleMCP_Tip, 1.2, 2.0, "middle");
      checkFoldStatus(ringMCP_Tip, 0.7, "ring", 1.5);
      checkExtension(pinkyMCP_Tip, 1.1, 2.0, "pinky");
      
      // Thumb close 
      checksCount += 0.5;
      const thumbClose = distance(landmarks[4], landmarks[5]) / handSize;
      if (thumbClose < 0.65) totalScore += 50;
      else totalScore += Math.max(0, 1 - (thumbClose - 0.65)) * 50;
      break;
    }

    case "kartarimukha": {
      // Requirements: Index and Middle straight and apart, Ring and Pinky folded.
      checkExtension(indexMCP_Tip, 1.1, 2.0, "index");
      checkExtension(middleMCP_Tip, 1.1, 2.0, "middle");
      checkFoldStatus(ringMCP_Tip, 0.55, "ring");
      checkFoldStatus(pinkyMCP_Tip, 0.55, "pinky");
      
      // Scissors spread (width between index and middle tips)
      checksCount += 1.5;
      if (index_middle_dist > 0.65) {
        totalScore += 150;
      } else {
        feedbacks.push("Separate your index and middle fingers wider into a dynamic V.");
        totalScore += (index_middle_dist / 0.65) * 150;
      }
      break;
    }

    case "mayura": {
      // Requirements: Thumb TIP touching Ring TIP, other three straight.
      checkExtension(indexMCP_Tip, 1.1, 2.0, "index");
      checkExtension(middleMCP_Tip, 1.1, 2.0, "middle");
      checkExtension(pinkyMCP_Tip, 1.0, 2.0, "pinky");
      
      // Pinch verification
      checkTipPinch(thumb_ring_dist, 0.35, "Thumb and Ring Finger", 2.0);
      
      // Ensure middle doesn't sag
      checksCount += 0.5;
      if (middleMCP_Tip > 1.0) totalScore += 50;
      break;
    }

    case "alapadma": {
      // Requirements: All fingers extended (> 1.0) and spread wide apart (fanned).
      checkExtension(indexMCP_Tip, 1.0, 2.0, "index");
      checkExtension(middleMCP_Tip, 1.0, 2.0, "middle");
      checkExtension(ringMCP_Tip, 1.0, 2.0, "ring");
      checkExtension(pinkyMCP_Tip, 0.95, 2.0, "pinky");
      
      // Spread gaps should be substantial
      checkFanning(index_middle_dist, 0.45, "Index and Middle");
      checkFanning(middle_ring_dist, 0.45, "Middle and Ring");
      checkFanning(ring_pinky_dist, 0.45, "Ring and Pinky");
      break;
    }

    case "suchi": {
      // Requirements: Index straight, all others folded.
      checkExtension(indexMCP_Tip, 1.25, 2.1, "index", 2.0);
      
      // Folded fingers
      checkFoldStatus(middleMCP_Tip, 0.5, "middle");
      checkFoldStatus(ringMCP_Tip, 0.5, "ring");
      checkFoldStatus(pinkyMCP_Tip, 0.5, "pinky");
      
      // Thumb tucked over middle/ring knuckles
      checksCount += 0.5;
      const thumbTucked = distance(landmarks[4], landmarks[10]) / handSize;
      if (thumbTucked < 0.55) totalScore += 50;
      break;
    }

    case "shikhara": {
      // Requirements: Fist shape, Thumb upright and fully extended
      checkFoldStatus(indexMCP_Tip, 0.5, "index");
      checkFoldStatus(middleMCP_Tip, 0.5, "middle");
      checkFoldStatus(ringMCP_Tip, 0.5, "ring");
      checkFoldStatus(pinkyMCP_Tip, 0.5, "pinky");
      
      // Thumb extension
      checkExtension(thumbMCP_Tip, 0.85, 1.6, "thumb", 2.0);
      break;
    }

    case "kapittha": {
      // Requirements: Fist shape, Thumb upright, Index bent over thumb tip
      checkFoldStatus(middleMCP_Tip, 0.5, "middle");
      checkFoldStatus(ringMCP_Tip, 0.5, "ring");
      checkFoldStatus(pinkyMCP_Tip, 0.5, "pinky");
      
      // Thumb held up
      checkExtension(thumbMCP_Tip, 0.75, 1.6, "thumb", 1.0);
      
      // Index folder/draped over thumb tip
      checkTipPinch(thumb_index_dist, 0.4, "Index and Thumb loop", 1.5);
      checkFoldStatus(indexMCP_Tip, 0.75, "index");
      break;
    }

    default:
      return { score: 0, feedbacks: ["Unknown mudra comparison state."] };
  }

  // Deduplicate and filter feedBack strings
  const finalScore = Math.max(0, Math.min(100, Math.round(totalScore / checksCount)));
  const uniqueFeedbacks = Array.from(new Set(feedbacks)).slice(0, 3);
  
  return {
    score: finalScore,
    feedbacks: uniqueFeedbacks.length > 0 ? uniqueFeedbacks : ["Perfect form! Hold the pose gracefully."]
  };
}

// --------------------------------------------------------
// AUTO-CLASSIFY RAW FRAME INPUTS
// --------------------------------------------------------

export function classifyCurrentGesture(landmarks: Landmark[]): { id: string; score: number } {
  const mudras = ["pataka", "tripataka", "kartarimukha", "mayura", "alapadma", "suchi", "shikhara", "kapittha"];
  let bestMudra = "unknown";
  let bestScore = 0;

  for (const mId of mudras) {
    const res = evaluateMudra(mId, landmarks);
    if (res.score > bestScore) {
      bestScore = res.score;
      bestMudra = mId;
    }
  }

  return {
    id: bestScore > 62 ? bestMudra : "unknown",
    score: bestScore
  };
}

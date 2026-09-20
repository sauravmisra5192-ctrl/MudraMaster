export interface MudraDetails {
  id: string;
  name: string;
  translation: string;
  shastraTerm: string;
  danceForms: string[];
  description: string;
  meaning: string;
  steps: string[];
  tips: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  iconSvg: string; // Beautiful simplified representation of the mudra pose
}

export const MUDRAS_DATASET: MudraDetails[] = [
  {
    id: "pataka",
    name: "Pataka",
    translation: "The Flag",
    shastraTerm: "पाताक हैस्त (Pataka Hastha)",
    danceForms: ["Bharatnatyam", "Kuchipudi", "Kathakali", "Odissi"],
    description: "All five fingers are extended straight, fully aligned, and tightly pressed together with the thumb closely adducted to the side of the index finger.",
    meaning: "Commonly used to represent natural forces, including water currents, sweeping clouds, thick forests, majestic rivers, or to indicate a royal greeting, beginnings, or the canvas of space.",
    difficulty: "Beginner",
    steps: [
      "Open your primary hand fully, extending all fingers upward.",
      "Bring your index, middle, ring, and pinky fingers close together so they touch.",
      "Press your thumb flat against the side of your index palm with no gap.",
      "Keep your wrist straight and firm, pointing your palm outward or to the side."
    ],
    tips: [
      "Ensure there are absolutely no gaps between any of your fingers.",
      "Do not hyper-extend your joints; keep the hand active but flowing."
    ],
    iconSvg: "M10 8V18 M12 7V18 M14 7V18 M16 8V18 M8 11V18"
  },
  {
    id: "tripataka",
    name: "Tripataka",
    translation: "Three-Part Flag",
    shastraTerm: "त्रिपताक हैस्त (Tripataka Hastha)",
    danceForms: ["Bharatnatyam", "Kuchipudi", "Kathakali", "Odissi"],
    description: "Similar to the Pataka mudra, but the ring finger is bent downwards at the knuckle, keeping all other fingers strictly erect.",
    meaning: "Depicts an ornate crown, tree branches, dynamic lightning bolts, calling someone, writing a letter, or applying the sacred Tilak/bindi to the forehead.",
    difficulty: "Beginner",
    steps: [
      "Begin in the Pataka position with all fingers joined and straight.",
      "Keep your index, middle, and little fingers fully extended.",
      "Gently bend your ring finger down at the knuckle so its tip hovers over your palm.",
      "Ensure the little finger does not bend; keep it straight alongside the middle finger."
    ],
    tips: [
      "If your pinky wants to bend with the ring finger, try holding your pinky straight with your other hand first to stretch the tendons.",
      "Only bend the ring finger; keep the knuckle plane level."
    ],
    iconSvg: "M10 8V18 M12 7V18 M14 13V18 M16 8V18 M8 11V18"
  },
  {
    id: "kartarimukha",
    name: "Kartarimukha",
    translation: "Scissors Face",
    shastraTerm: "कर्तरीमुख हैस्त (Kartarimukha)",
    danceForms: ["Bharatnatyam", "Kuchipudi", "Kathakali"],
    description: "The index and middle fingers are spread wide apart like scissors, while the ring and pinky fingers are folded down and locked by the thumb.",
    meaning: "Represents separation, lightning, disagreement, a corner of the eyes, applying vermilion, or cutting away bindings.",
    difficulty: "Advanced",
    steps: [
      "Form a fist with your hand, folding your ring and pinky fingers flat to your palm.",
      "Bring your thumb to rest comfortably over the folded ring and pinky fingers.",
      "Extend your index and middle fingers straight up.",
      "Spread your index and middle fingers apart horizontally to form a sharp 'V' shape."
    ],
    tips: [
      "Aim for a 45-degree angle of separation between your index and middle fingers.",
      "Keep the thumb firmly pinning down the ring and pinky fingers."
    ],
    iconSvg: "M8 6L11 18 M14 6L11 18 M11 18V24"
  },
  {
    id: "mayura",
    name: "Mayura",
    translation: "The Peacock",
    shastraTerm: "मयूर हैस्त (Mayura Hastha)",
    danceForms: ["Bharatnatyam", "Kuchipudi", "Odissi"],
    description: "The tip of the ring finger touches the tip of the thumb, while the index, middle, and little fingers are held straight and pointing up.",
    meaning: "Depicts the royal peacock, a sacred bird, creepers, feathers, the flowing of river currents, or sacred drops of liquid.",
    difficulty: "Intermediate",
    steps: [
      "Raise your index, middle, and little fingers straight up, bringing them close.",
      "Bring your ring finger down across your palm.",
      "Bring your thumb in to meet the tip of your ring finger, touching precisely.",
      "Maintain a tall, straight posture in the remaining three fingers."
    ],
    tips: [
      "Only the thumb and ring finger should touch; do not let the middle finger bend.",
      "Adjust the pinch so dry finger pads meet snugly."
    ],
    iconSvg: "M10 8V18 M12 7V18 M14 12C14 10 8 10 8 12 M16 8V18"
  },
  {
    id: "alapadma",
    name: "Alapadma",
    translation: "The Lotus in Bloom",
    shastraTerm: "अलापद्म हैस्त (Alapadma Hastha)",
    danceForms: ["Bharatnatyam", "Kuchipudi", "Kathakali", "Odissi"],
    description: "All five fingers are fanned out and spread wide apart in a circular blossom pattern, with each finger slightly curved backward.",
    meaning: "Portrays a fully blossomed lotus flower, breasts, mirrors, full moon, hair knots, circular motion, or extreme beauty.",
    difficulty: "Intermediate",
    steps: [
      "Hold your hand up and separate all five fingers as far away from each other as possible.",
      "Curl each finger slightly backward, pushing the palm forward.",
      "Rotate your wrist slightly to emphasize the circular, cup-like shape of a blooming flower.",
      "Keep the little finger pulled furthest outward to enlarge the outline."
    ],
    tips: [
      "Stretch the muscles in the center of your palm to help keep fingers separated.",
      "The little finger should initiate the visual bend, followed in tiered heights."
    ],
    iconSvg: "M10 11C8 9 6 12 10 18 M12 10C11 8 9 12 12 18 M14 10C15 8 17 12 14 18 M16 11C18 9 20 12 16 18 M8 13C6 11 4 14 8 18"
  },
  {
    id: "suchi",
    name: "Suchi",
    translation: "The Needle",
    shastraTerm: "सूची हैस्त (Suchi Hastha)",
    danceForms: ["Bharatnatyam", "Kuchipudi", "Kathakali", "Odissi"],
    description: "The index finger is held straight, pointing upwards, while the middle, ring, and pinky fingers are folded flat into the palm and gripped by the thumb.",
    meaning: "Depicts the number 'One', pointing toward a route, the supreme truth, a needle, a lightning bolt, or search.",
    difficulty: "Beginner",
    steps: [
      "Make a tight fist, drawing middle, ring, and little fingers in.",
      "Fold your thumb flat over the middle and ring fingers to lock them.",
      "Now, extend your index finger straight up, keeping it vertical and rigid.",
      "Align the hand posture so it forms a crisp, clean pointer."
    ],
    tips: [
      "Do not let the middle finger loosen up from the fist.",
      "Keep the index finger completely straight without any slouching."
    ],
    iconSvg: "M12 5V18 M10 13V18 M14 13V18 M16 13V18"
  },
  {
    id: "shikhara",
    name: "Shikhara",
    translation: "The Peak",
    shastraTerm: "शिखर हैस्त (Shikhara Hastha)",
    danceForms: ["Bharatnatyam", "Kuchipudi", "Kathakali", "Odissi"],
    description: "All five fingers are folded into a closed fist, but the thumb is held erect, pointing straight up, like a 'thumbs up' gesture.",
    meaning: "Stands for a mighty mountain peak, a temple pillar, silence, lips, Sri Rama's bow, or dynamic masculine power.",
    difficulty: "Beginner",
    steps: [
      "Form a solid, secure fist with all four fingers resting against your palm.",
      "Keep your thumb outside the fist.",
      "Point your thumb straight up, keeping it vertical and fully elongated.",
      "Keep the wrist and arm steady to preserve the weight of the mountain."
    ],
    tips: [
      "Make the fist compact; it represents strength.",
      "Push your thumb back slightly to display maximum extension."
    ],
    iconSvg: "M8 8V18 M10 13V18 M12 13V18 M14 13V18 M16 10C16 8 14 8 14 10"
  },
  {
    id: "kapittha",
    name: "Kapittha",
    translation: "Elephant Apple",
    shastraTerm: "कपित्थ हैस्त (Kapittha Hastha)",
    danceForms: ["Bharatnatyam", "Kuchipudi", "Kathakali"],
    description: "Similar to the Shikhara mudra, but the index finger is bent down to wrap around and rest on the top tip of the upright thumb.",
    meaning: "Represents Goddess Lakshmi, holding a churner, standard household keys, holding a veil, or plucking fragrant flowers.",
    difficulty: "Advanced",
    steps: [
      "Start with the Shikhara (fist with thumb extended up).",
      "Gently bend your index finger forward at the joints.",
      "Drape the index finger over the tip of your thumb, wrapping it like a hook.",
      "Keep the other three fingers (middle, ring, pinky) tightly clenched in the fist."
    ],
    tips: [
      "Keep middle finger pressed tight to prevent it from sliding out.",
      "The index and thumb should form a neat circular loop at the top."
    ],
    iconSvg: "M8 8C8 5 12 5 12 8 M10 13V18 M12 13V18 M14 13V18 M16 13V18"
  }
];

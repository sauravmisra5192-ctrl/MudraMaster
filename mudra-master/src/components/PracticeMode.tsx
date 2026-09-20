import React, { useState, useEffect, useRef } from "react";
import { Camera, Sliders, Info, MessageSquare, AlertCircle, CheckCircle, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
import { MudraDetails, Difficulty, Landmark } from "../types";
import { MUDRAS_DATASET } from "../data/mudras";
import { evaluateMudra, classifyCurrentGesture } from "../utils/pose-comparison";

// Types and states for Guru responses
interface GuruOpinion {
  coachComment: string;
  correctionTips: string[];
  mythologicalFact: string;
}

interface PracticeModeProps {
  stats: any;
  onAwardPoints: (points: number, badgeId?: string) => void;
  selectedMudraId: string;
  setSelectedMudraId: (id: string) => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  stats,
  onAwardPoints,
  selectedMudraId,
  setSelectedMudraId
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Stages: "cam" (Webcam tracking) or "sim" (Virtual Hands Studio)
  const [stageMode, setStageMode] = useState<"cam" | "sim">("sim");
  
  // MediaPipe Load States
  const [mpLoaded, setMpLoaded] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const cameraInstanceRef = useRef<any>(null);
  const handsInstanceRef = useRef<any>(null);

  // Active gesture under test
  const activeMudra = MUDRAS_DATASET.find((m) => m.id === selectedMudraId) || MUDRAS_DATASET[0];

  // Current detected landmarks (Webcam frame or simulated values)
  const [currentLandmarks, setCurrentLandmarks] = useState<Landmark[] | null>(null);

  // Math Evaluation Outputs
  const [realTimeScore, setRealTimeScore] = useState(0);
  const [corrections, setCorrections] = useState<string[]>([]);

  // Open-practice Free Flow Auto-Recognition state
  const [openClassification, setOpenClassification] = useState<string>("unknown");

  // AI Guru consultation board
  const [guruResponse, setGuruResponse] = useState<GuruOpinion | null>(null);
  const [guruLoading, setGuruLoading] = useState(false);

  // --------------------------------------------------------
  // SANDBOX SIMULATOR CONTROLS
  // --------------------------------------------------------
  const [thumbStraight, setThumbStraight] = useState(50); // 0 (bent) to 100 (straight)
  const [indexStraight, setIndexStraight] = useState(100);
  const [middleStraight, setMiddleStraight] = useState(100);
  const [ringStraight, setRingStraight] = useState(100);
  const [pinkyStraight, setPinkyStraight] = useState(100);
  
  // Special sandbox triggers for complex mudra loops
  const [pinchThumbRing, setPinchThumbRing] = useState(false);
  const [wideSpread, setWideSpread] = useState(false);

  // --------------------------------------------------------
  // MEDIAPIPE CDN INJECTION & CAMERA LOOPS
  // --------------------------------------------------------
  const startCamera = async () => {
    if (stageMode !== "cam") return;
    setCameraError(null);
    setMpLoading(true);

    try {
      // 1. Inject MediaPipe CDN script links if they aren't loaded in window yet
      if (!(window as any).Hands || !(window as any).Camera) {
        await new Promise<void>((resolve, reject) => {
          const s1 = document.createElement("script");
          s1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
          s1.async = true;
          s1.onload = () => {
            const s2 = document.createElement("script");
            s2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
            s2.async = true;
            s2.onload = () => resolve();
            s2.onerror = () => reject(new Error("Failed to load MediaPipe Hands."));
            document.head.appendChild(s2);
          };
          s1.onerror = () => reject(new Error("Failed to load MediaPipe Camera utils."));
          document.head.appendChild(s1);
        });
      }

      setMpLoaded(true);
      setMpLoading(false);

      // Verify DOM mounts
      if (!videoRef.current) return;
      const videoEl = videoRef.current;

      // 2. Initialize MediaPipe Hands
      if (!handsInstanceRef.current && (window as any).Hands) {
        const hands = new (window as any).Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const feed = results.multiHandLandmarks[0];
            const mapped: Landmark[] = feed.map((pt: any) => ({
              x: pt.x,
              y: pt.y,
              z: pt.z || 0
            }));
            setCurrentLandmarks(mapped);
          } else {
            setCurrentLandmarks(null);
          }
        });

        handsInstanceRef.current = hands;
      }

      // 3. Sprout Camera tracker
      if (!cameraInstanceRef.current && (window as any).Camera) {
        const camera = new (window as any).Camera(videoEl, {
          onFrame: async () => {
            if (handsInstanceRef.current && videoEl.readyState === 4) {
              await handsInstanceRef.current.send({ image: videoEl });
            }
          },
          width: 640,
          height: 480
        });

        cameraInstanceRef.current = camera;
      }

      // Turn camera track on
      await cameraInstanceRef.current.start();
      setCameraActive(true);

    } catch (err: any) {
      console.error("Camera Setup Error:", err);
      setCameraError(
        "Could not access video input. Make sure camera isn't occupied, browser permissions are approved, or switch to the Virtual Hand Sandbox."
      );
      setStageMode("sim");
    } finally {
      setMpLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraInstanceRef.current) {
      try {
        cameraInstanceRef.current.stop();
      } catch (e) {
        console.warn("Error turning off camera tracks:", e);
      }
    }
    setCameraActive(false);
    setCurrentLandmarks(null);
  };

  // Re-run camera start rules when user switches tabs
  useEffect(() => {
    if (stageMode === "cam") {
      startCamera();
    } else {
      stopCamera();
    }
    setGuruResponse(null);
    return () => {
      stopCamera();
    };
  }, [stageMode]);

  // --------------------------------------------------------
  // LIVES DRAW SKELETON RECOGNIZED CANVAS OVERLAYS
  // --------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 640, 480);

    // If sandbox mode is operating, draw a solid background representation space
    if (stageMode === "sim") {
      ctx.fillStyle = "#111114";
      ctx.fillRect(0, 0, 640, 480);
      
      // Draw gridlines in sandbox representation space
      ctx.strokeStyle = "rgba(212, 175, 55, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < 640; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 480);
        ctx.stroke();
      }
      for (let y = 0; y < 480; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }
    }

    if (!currentLandmarks || currentLandmarks.length < 21) {
      // Draw neutral helper notice on simulator canvas
      if (stageMode === "sim") {
        ctx.fillStyle = "rgba(245, 239, 235, 0.1)";
        ctx.font = "italic 13px serif";
        ctx.textAlign = "center";
        ctx.fillText("Sandbox Hand skeleton loading...", 320, 240);
      }
      return;
    }

    // Connect joints lines
    const drawJointLine = (ptA: Landmark, ptB: Landmark) => {
      // Coordinates normalized [0, 1] represent camera plane, map to canvas px
      const ax = ptA.x * 640;
      const ay = ptA.y * 480;
      const bx = ptB.x * 640;
      const by = ptB.y * 480;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    };

    // Style bone connection lines: emerald for high accuracy, terracotta for low alignments
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    if (realTimeScore >= 80) {
      ctx.strokeStyle = "rgba(16, 185, 129, 0.8)"; // emerald
      ctx.shadowColor = "rgba(16, 185, 129, 0.4)";
      ctx.shadowBlur = 8;
    } else if (realTimeScore >= 60) {
      ctx.strokeStyle = "rgba(245, 158, 11, 0.8)"; // gold/amber
      ctx.shadowColor = "rgba(245, 158, 11, 0.4)";
      ctx.shadowBlur = 8;
    } else {
      ctx.strokeStyle = "rgba(217, 79, 54, 0.75)"; // terracotta
      ctx.shadowColor = "rgba(217, 79, 54, 0.3)";
      ctx.shadowBlur = 6;
    }

    // Connect bones (Palm loops, fingers)
    const pts = currentLandmarks;
    // Wrist (0) to bases
    drawJointLine(pts[0], pts[1]);
    drawJointLine(pts[1], pts[2]);
    drawJointLine(pts[2], pts[3]);
    drawJointLine(pts[3], pts[4]); // thumb

    const drawFingerJoints = (mcp: number, pip: number, dip: number, tip: number) => {
      drawJointLine(pts[0], pts[mcp]);
      drawJointLine(pts[mcp], pts[pip]);
      drawJointLine(pts[pip], pts[dip]);
      drawJointLine(pts[dip], pts[tip]);
    };

    drawFingerJoints(5, 6, 7, 8);     // index
    drawFingerJoints(9, 10, 11, 12);  // middle
    drawFingerJoints(13, 14, 15, 16); // ring
    drawFingerJoints(17, 18, 19, 20); // pinky

    // Connect knuckles plane
    drawJointLine(pts[5], pts[9]);
    drawJointLine(pts[9], pts[13]);
    drawJointLine(pts[13], pts[17]);

    // Draw node dots
    ctx.shadowBlur = 0;
    pts.forEach((pt, idx) => {
      ctx.fillStyle = [4, 8, 12, 16, 20].includes(idx) ? "#D94F36" : "#F5EFEB";
      ctx.beginPath();
      ctx.arc(pt.x * 640, pt.y * 480, [4, 8, 12, 16, 20].includes(idx) ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pt.x * 640, pt.y * 480, [4, 8, 12, 16, 20].includes(idx) ? 9 : 7, 0, Math.PI * 2);
      ctx.stroke();
    });

  }, [currentLandmarks, realTimeScore, stageMode]);

  // --------------------------------------------------------
  // SIMULATOR PARAMETRIC HAND LANDMARK BLUEPRINT GENERATOR
  // --------------------------------------------------------
  // Generates 21 standard Landmarks based on the sliders
  useEffect(() => {
    if (stageMode !== "sim") return;

    // Center coordinate of palm
    const cx = 320 / 640;
    const cy = 240 / 480;

    const basePts: Landmark[] = [];

    // 0: Wrist
    basePts.push({ x: cx, y: cy + 0.28, z: 0 });

    // Thumb joints (CMC, MCP, IP, Tip)
    // Adjust Thumb y depending on straight slider (Thumb folds left)
    const txRatio = 0.5 - (thumbStraight / 100) * 0.17;
    const tyRatio = cy + 0.18 - (thumbStraight / 100) * 0.1;
    basePts.push({ x: cx - 0.08, y: cy + 0.22, z: 0 }); // 1
    basePts.push({ x: cx - 0.15, y: cy + 0.14, z: 0 }); // 2
    basePts.push({ x: cx - 0.20, y: cy + 0.06, z: 0 }); // 3
    basePts.push({ x: txRatio, y: tyRatio, z: 0 });    // 4: Thumb TIP
    
    // Knuckles MCP bases (Finger starts)
    const mcpX = (idx: number) => cx + (idx - 1.5) * 0.08;
    const mcpY = (idx: number) => cy + 0.04 + Math.abs(idx - 1.5) * 0.015;

    // Draw 4 fingers (Index: 5-8, Middle: 9-12, Ring: 13-16, Pinky: 17-20)
    const addFingerTemplate = (fNo: number, straightPercent: number) => {
      const mx = mcpX(fNo);
      const my = mcpY(fNo);
      basePts.push({ x: mx, y: my, z: 0 }); // MCP (5,9,13,17)

      // Extension offsets (Finger moves up as straightPercent increases)
      const isStraight = straightPercent / 100;
      const verticalSpan = 0.08 + isStraight * 0.13;

      // Finger joints PIP, DIP, TIP
      basePts.push({ x: mx, y: my - verticalSpan * 0.4, z: 0 }); // PIP
      basePts.push({ x: mx, y: my - verticalSpan * 0.75, z: 0 }); // DIP
      basePts.push({ x: mx, y: my - verticalSpan, z: 0 }); // TIP
    };

    addFingerTemplate(0, indexStraight);  // Index
    addFingerTemplate(1, middleStraight); // Middle
    addFingerTemplate(2, ringStraight);   // Ring
    addFingerTemplate(3, pinkyStraight);  // Pinky

    // Inject complex mudra special features to make training seamless
    // 1. Pinch Thumb (4) and Ring (16)
    if (pinchThumbRing) {
      basePts[4] = { x: cx + 0.05, y: cy + 0.02, z: 0 }; // push thumb to center right
      basePts[16] = { x: cx + 0.05, y: cy + 0.02, z: 0 }; // pull ring tip to meet thumb
      basePts[15] = { x: cx + 0.06, y: cy + 0.06, z: 0 };
    }

    // 2. Spread wide fingers (Alapadma bloom)
    if (wideSpread) {
      // Flare outer fingers sideways
      basePts[8].x -= 0.12; // index wide left
      basePts[8].y += 0.04;
      basePts[12].x -= 0.04; // middle slightly left
      basePts[16].x += 0.05; // ring right
      basePts[20].x += 0.14; // pinky wide right
      basePts[20].y += 0.03;
      basePts[4].x -= 0.13;  // thumb wide left
      basePts[4].y += 0.02;
    }

    setCurrentLandmarks(basePts);

  }, [stageMode, thumbStraight, indexStraight, middleStraight, ringStraight, pinkyStraight, pinchThumbRing, wideSpread]);

  // --------------------------------------------------------
  // REAL-TIME POSTURE CLASSIFIER CALL TRICK
  // --------------------------------------------------------
  useEffect(() => {
    if (!currentLandmarks) {
      setRealTimeScore(0);
      setCorrections(["Awaiting hand landmarks... Align hand with tracking skeleton."]);
      return;
    }

    // 1. Evaluate target mudra match score and corrections checklist
    const evaluation = evaluateMudra(activeMudra.id, currentLandmarks);
    setRealTimeScore(evaluation.score);
    setCorrections(evaluation.feedbacks);

    // 2. Continuously run open Recognition in backup to identify whatever gesture they form
    const autodetect = classifyCurrentGesture(currentLandmarks);
    setOpenClassification(autodetect.id);

  }, [currentLandmarks, activeMudra.id]);

  // Handle auto preset sandbox buttons to help user learn instantly
  const applySandboxPreset = (mId: string) => {
    setGuruResponse(null);
    setPinchThumbRing(false);
    setWideSpread(false);

    switch (mId) {
      case "pataka":
        setThumbStraight(5);
        setIndexStraight(100);
        setMiddleStraight(100);
        setRingStraight(100);
        setPinkyStraight(100);
        break;
      case "tripataka":
        setThumbStraight(8);
        setIndexStraight(100);
        setMiddleStraight(100);
        setRingStraight(15);
        setPinkyStraight(100);
        break;
      case "kartarimukha":
        setThumbStraight(15);
        setIndexStraight(100);
        setMiddleStraight(100);
        setRingStraight(10);
        setPinkyStraight(10);
        break;
      case "mayura":
        setThumbStraight(45);
        setIndexStraight(100);
        setMiddleStraight(100);
        setRingStraight(40);
        setPinkyStraight(100);
        setPinchThumbRing(true);
        break;
      case "alapadma":
        setThumbStraight(85);
        setIndexStraight(95);
        setMiddleStraight(95);
        setRingStraight(95);
        setPinkyStraight(95);
        setWideSpread(true);
        break;
      case "suchi":
        setThumbStraight(10);
        setIndexStraight(100);
        setMiddleStraight(15);
        setRingStraight(15);
        setPinkyStraight(15);
        break;
      case "shikhara":
        setThumbStraight(100);
        setIndexStraight(15);
        setMiddleStraight(15);
        setRingStraight(15);
        setPinkyStraight(15);
        break;
      case "kapittha":
        setThumbStraight(70);
        setIndexStraight(40); // bent
        setMiddleStraight(15);
        setRingStraight(15);
        setPinkyStraight(15);
        break;
    }
  };

  // Instantly apply preset based on matching selected mudra targets!
  useEffect(() => {
    if (stageMode === "sim") {
      applySandboxPreset(selectedMudraId);
    }
  }, [selectedMudraId, stageMode]);

  // --------------------------------------------------------
  // CONSULT GURU API CONTROLLER (Server connection + Gemini consult)
  // --------------------------------------------------------
  const handleConsultGuru = async () => {
    setGuruLoading(true);
    setGuruResponse(null);

    try {
      const resp = await fetch("/api/guru", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mudraId: activeMudra.id,
          mudraName: activeMudra.name,
          danceForm: stats.preferredDanceForm,
          score: realTimeScore,
          feedbacks: corrections
        })
      });

      if (!resp.ok) {
        throw new Error("Coach consultation request failed.");
      }

      const rawJSON = await resp.json();
      setGuruResponse(rawJSON);

      // Award matching bonus if score is outstanding (>85%)!
      if (realTimeScore >= 85) {
        onAwardPoints(25); // +25 bonus mastery points
      }

    } catch (err) {
      console.error("Consultation fetch error:", err);
      // Construct fallback state natively to guarantee no UI breaks
      setGuruResponse({
        coachComment: `Your attempt of ${activeMudra.name} is beautiful. The joints represent spiritual flow. Let us work together to strengthen finger extensions.`,
        correctionTips: corrections.slice(0, 2),
        mythologicalFact: `Historically, ${activeMudra.name} connects to early temple murals, serving to translate the stories of Gods within ${stats.preferredDanceForm}.`
      });
    } finally {
      setGuruLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
      
      {/* 1. WEBCAM / SIMULATOR DISPLAY FEED SECTION */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        
        {/* Toggle selector: Live Camera vs. Sandbox Simulator */}
        <div className="bg-[#16161A] border border-[#D4AF37]/10 p-2.5 rounded-lg flex items-center justify-between shadow-md">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-gray-400 mr-2 uppercase tracking-wider">
              Input Port:
            </span>
            <button
              onClick={() => setStageMode("sim")}
              className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 border rounded cursor-pointer transition-all ${
                stageMode === "sim"
                  ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]"
                  : "bg-[#1F1F24] border-gray-700 text-gray-400 hover:text-gray-300"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Virtual Sandbox
            </button>
            <button
              onClick={() => setStageMode("cam")}
              className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 border rounded cursor-pointer transition-all ${
                stageMode === "cam"
                  ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]"
                  : "bg-[#1F1F24] border-gray-700 text-gray-400 hover:text-gray-300"
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Live Camera
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#D4AF37] flex items-center gap-1">
            {stageMode === "cam" && cameraActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1" />
            )}
            {stageMode === "cam" ? "MediaPipe Active" : "Parametric Hands Engine"}
          </div>
        </div>

        {/* The Webcam / Graphics Frame Stage */}
        <div className="relative aspect-video w-full rounded-lg bg-[#111114] border border-[#D4AF37]/15 overflow-hidden shadow-2xl">
          {stageMode === "cam" && (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
              autoPlay
            />
          )}

          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full z-10 ${
              stageMode === "cam" ? "scale-x-[-1]" : ""
            }`}
          />

          {/* Loader or Error states overlay */}
          {mpLoading && (
            <div className="absolute inset-0 z-20 bg-[#111114]/90 flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin mb-3" />
              <p className="text-sm font-serif text-[#F5EFEB]">Initializing MediaPipe ML Trackers...</p>
              <p className="text-xs text-gray-400 mt-1">Downloading 0.2s light-joint model models from jsDelivr...</p>
            </div>
          )}

          {cameraError && stageMode === "cam" && (
            <div className="absolute inset-0 z-20 bg-[#2D1512]/95 border border-[#8C2D19]/40 flex flex-col items-center justify-center p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-[#D94F36] mb-3" />
              <h3 className="text-sm font-serif font-bold text-[#F5EFEB] uppercase tracking-wide">Webcam Port Blocked</h3>
              <p className="text-xs text-gray-300 max-w-sm mt-1">{cameraError}</p>
              <button
                onClick={() => setStageMode("sim")}
                className="mt-4 px-4 py-1.5 bg-[#8C2D19] hover:bg-[#A83720] text-xs font-mono text-[#F5EFEB] rounded border-none cursor-pointer"
              >
                Launch Virtual Hands Sandbox fallback
              </button>
            </div>
          )}
        </div>

        {/* Free flow Auto Recognition subtitle */}
        {currentLandmarks && (
          <div className="bg-[#1C1C22]/80 border border-gray-800 p-2.5 rounded-lg flex items-center justify-between font-mono text-xs text-gray-300">
            <span>Dynamic Pose Classifier:</span>
            <span className="font-bold text-[#D4AF37] uppercase">
              {openClassification === "unknown"
                ? "Searching Shāstra index..."
                : MUDRAS_DATASET.find((m) => m.id === openClassification)?.name + " detected!"}
            </span>
          </div>
        )}

        {/* Sandbox interactive sliders only show in "sim" mode */}
        {stageMode === "sim" && (
          <div className="bg-[#16161A] border border-[#D4AF37]/10 p-4 rounded-lg shadow-md">
            <h4 className="text-xs uppercase tracking-widest font-mono text-[#D4AF37] mb-3 flex items-center justify-between">
              <span>Parametric Joint Sliders (Kinematics)</span>
              <button
                onClick={() => applySandboxPreset(activeMudra.id)}
                className="text-[10px] bg-[#1F1F24] border border-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded hover:bg-[#D4AF37]/10 transition-colors cursor-pointer"
                title="Force sliders to align perfectly with target mudra"
              >
                Reset to Target Template
              </button>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Slider 1: Thumb */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Thumb (Adduction)</span>
                  <span className="text-[#D4AF37]">{thumbStraight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={thumbStraight}
                  onChange={(e) => setThumbStraight(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] bg-gray-800 rounded h-1.5 appearance-none cursor-pointer"
                />
              </div>

              {/* Slider 2: Index */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Index Finger (Flexion)</span>
                  <span className="text-[#D4AF37]">{indexStraight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={indexStraight}
                  onChange={(e) => setIndexStraight(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] bg-gray-800 rounded h-1.5 appearance-none cursor-pointer"
                />
              </div>

              {/* Slider 3: Middle */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Middle Finger (Flexion)</span>
                  <span className="text-[#D4AF37]">{middleStraight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={middleStraight}
                  onChange={(e) => setMiddleStraight(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] bg-gray-800 rounded h-1.5 appearance-none cursor-pointer"
                />
              </div>

              {/* Slider 4: Ring */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Ring Finger (Flexion)</span>
                  <span className="text-[#D4AF37]">{ringStraight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ringStraight}
                  onChange={(e) => setRingStraight(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] bg-gray-800 rounded h-1.5 appearance-none cursor-pointer"
                />
              </div>

              {/* Slider 5: Pinky */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Pinky Finger (Flexion)</span>
                  <span className="text-[#D4AF37]">{pinkyStraight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pinkyStraight}
                  onChange={(e) => setPinkyStraight(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] bg-gray-800 rounded h-1.5 appearance-none cursor-pointer"
                />
              </div>

              {/* Special toggles */}
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-xs font-mono text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pinchThumbRing}
                    onChange={(e) => {
                      setPinchThumbRing(e.target.checked);
                      if (e.target.checked) setWideSpread(false);
                    }}
                    className="accent-[#D4AF37] rounded"
                  />
                  <span>Force Tip Pinch (Mayura)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-mono text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wideSpread}
                    onChange={(e) => {
                      setWideSpread(e.target.checked);
                      if (e.target.checked) setPinchThumbRing(false);
                    }}
                    className="accent-[#D4AF37] rounded"
                  />
                  <span>Lotus Flare Spread</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. REAL-TIME ACCURACY METERS AND AI GURU COMMENTS PANEL */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Alignment Gauge display */}
        <div className="bg-[#16161A] border border-[#D4AF37]/10 p-5 rounded-lg shadow-lg">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-3.5 mb-4">
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Active Sadhana Target</span>
              <h2 className="text-xl font-serif font-bold text-[#F5EFEB]">{activeMudra.name}</h2>
            </div>
            
            {/* Quick target switches */}
            <select
              value={selectedMudraId}
              onChange={(e) => setSelectedMudraId(e.target.value)}
              className="bg-[#1F1F24] border border-gray-700 text-[#F5EFEB] text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-[#D4AF37] font-serif cursor-pointer"
            >
              {MUDRAS_DATASET.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} Hastha
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6">
            {/* Circular score dial gauge (using standard Tailwind conic-gradient) */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center rounded-full bg-[#1F1F24] border-4 border-gray-800">
              <div
                className="absolute inset-0 rounded-full transition-all duration-300"
                style={{
                  background: `conic-gradient(${
                    realTimeScore >= 80 ? "#10B981" : realTimeScore >= 60 ? "#D4AF37" : "#D94F36"
                  } ${realTimeScore * 3.6}deg, transparent 0deg)`
                }}
              />
              <div className="absolute inset-1 rounded-full bg-[#16161A] flex flex-col items-center justify-center select-none">
                <span className="text-2xl font-mono font-bold text-[#F5EFEB]">{realTimeScore}%</span>
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#D4AF37]">Accuracy</span>
              </div>
            </div>

            {/* Match status feedback */}
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-xs uppercase font-mono tracking-wider text-gray-400 mb-1.5">
                Physical Alignments Status
              </h3>
              
              {realTimeScore >= 85 ? (
                <div className="flex items-start gap-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-serif leading-relaxed">
                    Splendid alignment! Your finger vectors perfectly conform to the text-shastra blueprint.
                  </p>
                </div>
              ) : realTimeScore >= 60 ? (
                <div className="flex items-start gap-2 text-amber-400">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-serif leading-relaxed">
                    Moderate posture precision. Refer to the corrective discrepancies listed underneath to refine the joints.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-[#D94F36]">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-serif leading-relaxed">
                    Discrepancy detected. The classifier cannot index this alignment to {activeMudra.name}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Corrective checks details */}
          <div className="bg-[#111114] rounded-lg p-3.5 mt-5 border border-gray-800/60 font-serif">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-amber-500/50 mb-2">
              Discrepancy Flags (Real-Time Sensor Feed)
            </h4>
            <ul className="space-y-1.5">
              {corrections.map((tip, index) => (
                <li key={index} className="flex gap-2 text-xs leading-normal">
                  <span className="text-[#D94F36] font-sans">▪</span>
                  <span className="text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CONSULT CLASSICAL AI GURU BOARD PANEL */}
        <div className="bg-[#16161A] border border-[#D4AF37]/10 p-5 rounded-lg shadow-lg relative overflow-hidden">
          {/* Subtle gold mandala background motif */}
          <div className="absolute -right-12 -bottom-12 w-32 h-32 border border-[#D4AF37]/5 rounded-full select-none pointer-events-none" />

          <h3 className="text-xs uppercase tracking-widest font-mono text-[#D4AF37] mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" /> Natya Shāstra Consultation Hub
          </h3>
          <p className="text-xs text-gray-400 font-serif leading-relaxed mb-4">
            Consult the Virtual Guru, Natyarupa. She reviews your current skeletal landmarks, provides poetic corrections, and explains the mythological lore.
          </p>

          <button
            onClick={handleConsultGuru}
            disabled={guruLoading || !currentLandmarks}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded text-xs font-mono tracking-widest uppercase transition-all shadow-md cursor-pointer ${
              !currentLandmarks
                ? "bg-[#1E1E24] border border-gray-800 text-gray-600 grayscale"
                : "bg-[#8C2D19] hover:bg-[#A83720] text-[#F5EFEB] border border-[#8C2D19]"
            }`}
          >
            {guruLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Gathering Guruvani Quotes...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Summon AI Dance Guru Review
              </>
            )}
          </button>

          {/* Loader explanation help text */}
          {!currentLandmarks && (
            <p className="text-[10px] text-gray-500 font-mono text-center mt-2.5">
              * Turn on camera or adjust sandbox sliders to generate hand data first.
            </p>
          )}

          {/* Consultation Board response pop output */}
          {guruResponse && (
            <div className="mt-5 p-4 bg-[#231715] border border-[#8C2D19]/40 rounded-lg animate-fade-in font-serif">
              <span className="text-[10px] bg-[#8C2D19]/30 border border-[#8C2D19]/60 uppercase text-[#D4AF37] px-1.5 py-0.5 rounded tracking-widest font-mono select-none">
                🕉️ Guruvāni (The Guru&apos;s Whispers)
              </span>

              {/* Coach text */}
              <p className="text-xs text-[#F5EFEB] mt-3 leading-relaxed italic pr-2 border-l border-[#D4AF37] pl-3">
                &ldquo;{guruResponse.coachComment}&rdquo;
              </p>

              {/* Technical tips */}
              <div className="mt-4">
                <h4 className="text-[10.5px] font-mono text-[#D4AF37]/80 uppercase tracking-wider mb-2">
                  Postural Alignment Mudras
                </h4>
                <ul className="space-y-1.5">
                  {guruResponse.correctionTips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-xs text-gray-300">
                      <span className="text-[#D4AF37] font-semibold font-mono text-[10px] mt-0.5">
                        {idx + 1}.
                      </span>
                      <span className="leading-normal">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Myth snippet */}
              <div className="mt-4 pt-3.5 border-t border-amber-950/40">
                <h4 className="text-[10.5px] font-mono text-amber-500/60 uppercase tracking-widest mb-1">
                  Holy Shāstra Chronicles
                </h4>
                <p className="text-[11.5px] italic text-[#F5EFEB]/80 leading-relaxed font-serif">
                  {guruResponse.mythologicalFact}
                </p>
              </div>

              {/* Points rewards notice */}
              {realTimeScore >= 85 && (
                <div className="mt-4 bg-emerald-950/30 border border-emerald-500/20 rounded p-2 text-center text-[10.5px] font-mono text-emerald-400">
                  🎉 Consultation Bonus: Earned <strong className="font-bold underline">+25 XP</strong> Mastery points!
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

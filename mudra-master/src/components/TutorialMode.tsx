import React, { useState, useEffect, useRef } from "react";
import { BookOpen, MapPin, Volume2, Sparkles, Check, ChevronRight, HelpCircle } from "lucide-react";
import { MudraDetails, Difficulty } from "../types";
import { MUDRAS_DATASET } from "../data/mudras";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  langTag: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", langTag: "en-IN" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", langTag: "hi-IN" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", langTag: "bn-IN" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", langTag: "ta-IN" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", langTag: "te-IN" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളம்", langTag: "ml-IN" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", langTag: "kn-IN" }
];

// --------------------------------------------------------
// HARDCODED BLUEPRINT LANDMARK TEMPLATES FOR TUTORIAL BLUEPRINT DRAWING
// --------------------------------------------------------

interface TemplateLandmark {
  x: number; // 0 to 300 scale
  y: number; // 0 to 300 scale
}

// Generate stylized blueprint hand skeleton points (21 node landmarks)
function getMudraTemplateLandmarks(mudraId: string): TemplateLandmark[] {
  const landmarks: TemplateLandmark[] = [];
  
  // Generic base setup (Wrist 0, Palm indices 1-17)
  const wrist = { x: 150, y: 260 };
  landmarks.push(wrist); // 0
  
  // Thumb joints
  landmarks.push({ x: 120, y: 235 }); // 1 (CMC)
  landmarks.push({ x: 95, y: 200 }); // 2 (MCP)
  landmarks.push({ x: 80, y: 165 }); // 3 (IP)
  
  // Pinky MCP (17)
  const pinkyMCP = { x: 210, y: 195 };

  // Adjust TIP heights depending on geometry of the mudra
  switch (mudraId) {
    case "pataka":
      landmarks.push({ x: 70, y: 135 }); // 4: Thumb TIP (pressed to side)
      // MCP joints
      landmarks.push({ x: 120, y: 180 }); // 5 (Index MCP)
      landmarks.push({ x: 120, y: 135 }); // 6
      landmarks.push({ x: 120, y: 90 });  // 7
      landmarks.push({ x: 120, y: 45 });  // 8: Index TIP (straight)
      
      landmarks.push({ x: 150, y: 175 }); // 9 (Middle MCP)
      landmarks.push({ x: 150, y: 125 }); // 10
      landmarks.push({ x: 150, y: 80 });  // 11
      landmarks.push({ x: 150, y: 35 });  // 12: Middle TIP (straight)
      
      landmarks.push({ x: 180, y: 180 }); // 13 (Ring MCP)
      landmarks.push({ x: 180, y: 135 }); // 14
      landmarks.push({ x: 180, y: 90 });  // 15
      landmarks.push({ x: 180, y: 45 });  // 16: Ring TIP (straight)

      landmarks.push(pinkyMCP);            // 17 (Pinky MCP)
      landmarks.push({ x: 210, y: 150 }); // 18
      landmarks.push({ x: 210, y: 110 }); // 19
      landmarks.push({ x: 210, y: 65 });  // 20: Pinky TIP (straight)
      break;

    case "tripataka":
      landmarks.push({ x: 74, y: 138 }); // 4: Thumb TIP (pressed to side)
      // MCP joints
      landmarks.push({ x: 120, y: 180 }); // 5
      landmarks.push({ x: 120, y: 135 }); // 6
      landmarks.push({ x: 120, y: 90 });  // 7
      landmarks.push({ x: 120, y: 45 });  // 8: Index TIP (straight)
      
      landmarks.push({ x: 150, y: 175 }); // 9
      landmarks.push({ x: 150, y: 125 }); // 10
      landmarks.push({ x: 150, y: 80 });  // 11
      landmarks.push({ x: 150, y: 35 });  // 12: Middle TIP (straight)
      
      landmarks.push({ x: 180, y: 180 }); // 13
      landmarks.push({ x: 180, y: 200 }); // 14 (Ring finger bending down)
      landmarks.push({ x: 178, y: 218 }); // 15
      landmarks.push({ x: 175, y: 228 }); // 16: Ring TIP (folded down)

      landmarks.push(pinkyMCP);            // 17
      landmarks.push({ x: 210, y: 150 }); // 18
      landmarks.push({ x: 210, y: 110 }); // 19
      landmarks.push({ x: 210, y: 65 });  // 20: Pinky TIP (straight)
      break;

    case "kartarimukha":
      landmarks.push({ x: 145, y: 190 }); // 4: Thumb TIP (gripping ring/pinky)
      // MCP joints
      landmarks.push({ x: 120, y: 180 }); // 5
      landmarks.push({ x: 105, y: 130 }); // 6 (index angling left)
      landmarks.push({ x: 90, y: 85 });   // 7
      landmarks.push({ x: 75, y: 40 });   // 8: Index TIP (pointing left)
      
      landmarks.push({ x: 150, y: 175 }); // 9
      landmarks.push({ x: 165, y: 125 }); // 10 (middle angling right)
      landmarks.push({ x: 180, y: 80 });  // 11
      landmarks.push({ x: 195, y: 35 });  // 12: Middle TIP (pointing right)
      
      landmarks.push({ x: 180, y: 180 }); // 13
      landmarks.push({ x: 175, y: 210 }); // 14
      landmarks.push({ x: 170, y: 220 }); // 15
      landmarks.push({ x: 165, y: 225 }); // 16: Ring TIP (folded)

      landmarks.push(pinkyMCP);            // 17
      landmarks.push({ x: 205, y: 215 }); // 18
      landmarks.push({ x: 200, y: 225 }); // 19
      landmarks.push({ x: 195, y: 230 }); // 20: Pinky TIP (folded)
      break;

    case "mayura":
      landmarks.push({ x: 155, y: 155 }); // 4: Thumb TIP (meeting ring tip)
      // MCP joints
      landmarks.push({ x: 120, y: 180 }); // 5
      landmarks.push({ x: 120, y: 135 }); // 6
      landmarks.push({ x: 120, y: 90 });  // 7
      landmarks.push({ x: 120, y: 45 });  // 8: Index TIP (straight)
      
      landmarks.push({ x: 150, y: 175 }); // 9
      landmarks.push({ x: 150, y: 125 }); // 10
      landmarks.push({ x: 150, y: 80 });  // 11
      landmarks.push({ x: 150, y: 35 });  // 12: Middle TIP (straight)
      
      landmarks.push({ x: 180, y: 180 }); // 13
      landmarks.push({ x: 175, y: 155 }); // 14 (bending ring)
      landmarks.push({ x: 168, y: 150 }); // 15
      landmarks.push({ x: 155, y: 155 }); // 16: Ring TIP (pinched with 4)

      landmarks.push(pinkyMCP);            // 17
      landmarks.push({ x: 210, y: 150 }); // 18
      landmarks.push({ x: 210, y: 110 }); // 19
      landmarks.push({ x: 210, y: 65 });  // 20: Pinky TIP (straight)
      break;

    case "alapadma":
      landmarks.push({ x: 60, y: 165 });  // 4: Thumb TIP (extended wide left)
      // MCP joints (all curving wide)
      landmarks.push({ x: 120, y: 180 }); // 5
      landmarks.push({ x: 90, y: 140 });  // 6
      landmarks.push({ x: 65, y: 105 });  // 7
      landmarks.push({ x: 45, y: 70 });   // 8: Index TIP (angled wide left)
      
      landmarks.push({ x: 150, y: 175 }); // 9
      landmarks.push({ x: 135, y: 120 }); // 10
      landmarks.push({ x: 120, y: 70 });  // 11
      landmarks.push({ x: 110, y: 25 });  // 12: Middle TIP (curved center-left)
      
      landmarks.push({ x: 180, y: 180 }); // 13
      landmarks.push({ x: 195, y: 130 }); // 14
      landmarks.push({ x: 210, y: 80 });  // 15
      landmarks.push({ x: 225, y: 40 });  // 16: Ring TIP (angled wide right)

      landmarks.push(pinkyMCP);            // 17
      landmarks.push({ x: 235, y: 160 }); // 18
      landmarks.push({ x: 255, y: 130 }); // 19
      landmarks.push({ x: 275, y: 100 }); // 20: Pinky TIP (angled wide right)
      break;

    case "suchi":
      landmarks.push({ x: 140, y: 185 }); // 4: Thumb TIP (folded over middle fist)
      // MCP joints
      landmarks.push({ x: 120, y: 180 }); // 5
      landmarks.push({ x: 120, y: 135 }); // 6
      landmarks.push({ x: 120, y: 90 });  // 7
      landmarks.push({ x: 120, y: 40 });  // 8: Index TIP (pointing erect)
      
      landmarks.push({ x: 150, y: 175 }); // 9
      landmarks.push({ x: 155, y: 210 }); // 10
      landmarks.push({ x: 150, y: 220 }); // 11
      landmarks.push({ x: 145, y: 225 }); // 12: Middle TIP (folded inside)
      
      landmarks.push({ x: 180, y: 180 }); // 13
      landmarks.push({ x: 178, y: 210 }); // 14
      landmarks.push({ x: 172, y: 220 }); // 15
      landmarks.push({ x: 168, y: 225 }); // 16: Ring TIP (folded inside)

      landmarks.push(pinkyMCP);            // 17
      landmarks.push({ x: 200, y: 215 }); // 18
      landmarks.push({ x: 195, y: 225 }); // 19
      landmarks.push({ x: 190, y: 230 }); // 20: Pinky TIP (folded inside)
      break;

    case "shikhara":
      landmarks.push({ x: 105, y: 100 }); // 4: Thumb TIP (extended up-left)
      landmarks.push({ x: 120, y: 180 }); // 5
      landmarks.push({ x: 125, y: 210 }); // 6
      landmarks.push({ x: 120, y: 220 }); // 7
      landmarks.push({ x: 115, y: 225 }); // 8: Index TIP (folded)
      
      landmarks.push({ x: 150, y: 175 }); // 9
      landmarks.push({ x: 155, y: 210 }); // 10
      landmarks.push({ x: 150, y: 220 }); // 11
      landmarks.push({ x: 145, y: 225 }); // 12: Middle TIP (folded)
      
      landmarks.push({ x: 180, y: 180 }); // 13
      landmarks.push({ x: 178, y: 210 }); // 14
      landmarks.push({ x: 172, y: 220 }); // 15
      landmarks.push({ x: 168, y: 225 }); // 16: Ring TIP (folded)

      landmarks.push(pinkyMCP);            // 17
      landmarks.push({ x: 200, y: 215 }); // 18
      landmarks.push({ x: 195, y: 225 }); // 19
      landmarks.push({ x: 190, y: 230 }); // 20: Pinky TIP (folded)
      break;

    case "kapittha":
      landmarks.push({ x: 140, y: 150 }); // 4: Thumb TIP (point of hook)
      // Index curving as hook over thumb tip
      landmarks.push({ x: 120, y: 180 }); // 5
      landmarks.push({ x: 110, y: 140 }); // 6
      landmarks.push({ x: 125, y: 125 }); // 7
      landmarks.push({ x: 140, y: 148 }); // 8: Index TIP (wrapped touching 4)
      
      landmarks.push({ x: 150, y: 175 }); // 9
      landmarks.push({ x: 155, y: 210 }); // 10
      landmarks.push({ x: 150, y: 220 }); // 11
      landmarks.push({ x: 145, y: 225 }); // 12: Middle TIP (folded)
      
      landmarks.push({ x: 180, y: 180 }); // 13
      landmarks.push({ x: 178, y: 210 }); // 14
      landmarks.push({ x: 172, y: 220 }); // 15
      landmarks.push({ x: 168, y: 225 }); // 16: Ring TIP (folded)

      landmarks.push(pinkyMCP);            // 17
      landmarks.push({ x: 200, y: 215 }); // 18
      landmarks.push({ x: 195, y: 225 }); // 19
      landmarks.push({ x: 190, y: 230 }); // 20: Pinky TIP (folded)
      break;

    default:
      // Generic flat hand
      for (let i = 1; i <= 20; i++) landmarks.push({ x: 150, y: 150 });
  }

  return landmarks;
}

interface TutorialModeProps {
  completedTutorials: string[];
  onCompleteTutorial: (mudraId: string) => void;
  selectedMudraId: string;
  setSelectedMudraId: (id: string) => void;
  userDanceStyle: string;
}

export const TutorialMode: React.FC<TutorialModeProps> = ({
  completedTutorials,
  onCompleteTutorial,
  selectedMudraId,
  setSelectedMudraId,
  userDanceStyle
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [narrating, setNarrating] = useState(false);
  const selectedMudra = MUDRAS_DATASET.find((m) => m.id === selectedMudraId) || MUDRAS_DATASET[0];

  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [translatedContent, setTranslatedContent] = useState<{
    translationLabel?: string;
    meaning?: string;
    anatomy?: string;
    steps?: string[];
  } | null>(null);
  const [translating, setTranslating] = useState(false);

  // Trigger Translation on Language / Mudra change
  useEffect(() => {
    if (selectedLang === "en") {
      setTranslatedContent(null);
      return;
    }

    const abortController = new AbortController();

    const fetchTranslation = async () => {
      setTranslating(true);
      try {
        const langOption = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang);
        const targetLangName = langOption ? langOption.name : "Hindi";

        const packageToTranslate = {
          translationLabel: selectedMudra.translation,
          meaning: selectedMudra.meaning,
          anatomy: selectedMudra.description,
          steps: selectedMudra.steps
        };

        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortController.signal,
          body: JSON.stringify({
            text: JSON.stringify(packageToTranslate),
            targetLanguage: targetLangName,
            isStructured: true
          })
        });

        if (!response.ok) throw new Error("Translation request failed");
        
        const data = await response.json();
        
        try {
          const parsed = JSON.parse(data.translatedText);
          setTranslatedContent(parsed);
        } catch {
          // If fallback response has parsing issue or unstructured
          setTranslatedContent({
            translationLabel: selectedMudra.translation,
            meaning: data.translatedText,
            anatomy: selectedMudra.description,
            steps: selectedMudra.steps
          });
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Translation error:", err);
        }
      } finally {
        setTranslating(false);
      }
    };

    fetchTranslation();

    return () => {
      abortController.abort();
    };
  }, [selectedMudraId, selectedLang]);

  // Draw the Blueprint wireframe hand representation onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and draw grid background
    ctx.clearRect(0, 0, 300, 300);
    ctx.fillStyle = "#121215";
    ctx.fillRect(0, 0, 300, 300);

    // Draw blueprint graph grids
    ctx.strokeStyle = "rgba(212, 175, 55, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 300; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 300);
      ctx.stroke();
    }
    for (let y = 0; y < 300; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(300, y);
      ctx.stroke();
    }

    // Get landmarks path
    const pts = getMudraTemplateLandmarks(selectedMudra.id);
    if (!pts || pts.length < 21) return;

    // Draw joint connection lines (Skeletal paths)
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(212, 175, 55, 0.8)";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 1. Draw Palm outline links
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y); // wrist
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.lineTo(pts[4].x, pts[4].y); // thumb hook
    ctx.stroke();

    // 2. Draw fingers (MCP -> PIP -> DIP -> Tip)
    const drawFinger = (mcp: number, pip: number, dip: number, tip: number) => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y); // wrist
      ctx.lineTo(pts[mcp].x, pts[mcp].y);
      ctx.lineTo(pts[pip].x, pts[pip].y);
      ctx.lineTo(pts[dip].x, pts[dip].y);
      ctx.lineTo(pts[tip].x, pts[tip].y);
      ctx.stroke();
    };

    drawFinger(5, 6, 7, 8);     // Index
    drawFinger(9, 10, 11, 12);  // Middle
    drawFinger(13, 14, 15, 16); // Ring
    drawFinger(17, 18, 19, 20); // Pinky

    // Connect MCP bases
    ctx.beginPath();
    ctx.moveTo(pts[5].x, pts[5].y);
    ctx.lineTo(pts[9].x, pts[9].y);
    ctx.lineTo(pts[13].x, pts[13].y);
    ctx.lineTo(pts[17].x, pts[17].y);
    ctx.stroke();

    // Draw Joint Nodes
    ctx.shadowBlur = 0;
    pts.forEach((pt, index) => {
      ctx.beginPath();
      // Tips are highlighted in red-gold, MCP in pure gold
      if ([4, 8, 12, 16, 20].includes(index)) {
        ctx.fillStyle = "#D94F36";
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
      } else {
        ctx.fillStyle = "#F5EFEB";
        ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      }
      ctx.fill();

      // Outer rings
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, [4, 8, 12, 16, 20].includes(index) ? 8 : 6, 0, Math.PI * 2);
      ctx.stroke();
    });

  }, [selectedMudra.id]);

  // Audio guide voice synthesizer (Guru voice loop)
  const handleNarrate = () => {
    if (narrating) {
      window.speechSynthesis.cancel();
      setNarrating(false);
      return;
    }

    let textToSpeak = "";
    const activeLangOption = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

    if (selectedLang === "en") {
      const introText = `Seeker of dance, let us study the gesture of ${selectedMudra.name}, also known as ${selectedMudra.translation}. `;
      const shastraMeaning = `In our classical treatises, it represents ${selectedMudra.meaning}. `;
      const stepsText = `To form it properly, follow these instructions: ${selectedMudra.steps.join(". ")}`;
      textToSpeak = introText + shastraMeaning + stepsText;
    } else if (translatedContent) {
      const lbl = translatedContent.translationLabel || selectedMudra.translation;
      const mng = translatedContent.meaning || selectedMudra.meaning;
      const stps = (translatedContent.steps && translatedContent.steps.length > 0)
        ? translatedContent.steps.join(". ")
        : selectedMudra.steps.join(". ");

      if (selectedLang === "hi") {
        textToSpeak = `प्रिय नृत्य साधक, आइए ${selectedMudra.name} मुद्रा का अध्ययन करें, जिसे ${lbl} भी कहा जाता है। हमारे शास्त्रों के अनुसार, यह दर्शाता है: ${mng}। इसे बनाने के निर्देश इस प्रकार हैं: ${stps}`;
      } else if (selectedLang === "bn") {
         textToSpeak = `নৃত্যের সাধক, আসুন আমরা ${selectedMudra.name} মুদ্রাটি অধ্যয়ন করি, যা ${lbl} নামেও পরিচিত। শাস্ত্রীয় গ্রন্থ অনুসারে, এটি প্রতিনিধিত্ব করে: ${mng}। এটি সঠিকভাবে তৈরি করার নির্দেশাবলী নিম্নরূপ: ${stps}`;
      } else if (selectedLang === "ta") {
         textToSpeak = `நடன சாதகரே, நாம் இப்போது ${selectedMudra.name} முத்திரையைப் பற்றி படிப்போம். இது ${lbl} என்றும் அழைக்கப்படுகிறது. பாரம்பரிய சாஸ்திரங்களின்படி, இது குறிப்பது: ${mng}. இதை முறையாக செய்ய வேண்டிய முறைகள்: ${stps}`;
      } else if (selectedLang === "te") {
         textToSpeak = `నాట్య సాధకుడా, మనం ఇప్పుడు ${selectedMudra.name} ముద్రను అభ్యసిద్దాం. దీనిని ${lbl} అని కూడా అంటారు. సాంప్రదాయ గ్రంథాల ప్రకారం, ఇది సూచించేది: ${mng}. దీనిని సరిగ్గా చేయడానికి సూచనలు: ${stps}`;
      } else {
        textToSpeak = `${selectedMudra.name} (${lbl}). ${mng}. ${stps}`;
      }
    } else {
      textToSpeak = `Translation is styling, please tap play again in a moment.`;
    }

    const u = new SpeechSynthesisUtterance(textToSpeak);
    u.lang = activeLangOption.langTag;

    const voices = window.speechSynthesis.getVoices();
    const matchVoice = voices.find(v =>
      v.lang.toLowerCase() === activeLangOption.langTag.toLowerCase() ||
      v.lang.toLowerCase().replace("_", "-").startsWith(activeLangOption.langTag.split("-")[0])
    );

    if (matchVoice) {
      u.voice = matchVoice;
    } else {
      const indVoice = voices.find(v => v.name.includes("India") || v.lang.includes("IN"));
      if (indVoice) u.voice = indVoice;
    }

    u.rate = selectedLang === "en" ? 0.9 : 0.82; // Guru's rhythmic slower tempo
    u.onend = () => setNarrating(false);
    u.onerror = () => setNarrating(false);

    setNarrating(true);
    window.speechSynthesis.speak(u);
  };

  // Halt audio when switching mudras or languages
  useEffect(() => {
    window.speechSynthesis.cancel();
    setNarrating(false);
  }, [selectedMudraId, selectedLang]);

  // Clean-up synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const isCompleted = completedTutorials.includes(selectedMudra.id);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start h-full">
      {/* LEFT SIDEBAR: LIST OF THE 8 FOUNDATIONAL MUDRAS */}
      <div className="xl:col-span-4 bg-[#16161A] border border-[#D4AF37]/10 rounded-lg p-4 max-h-[750px] overflow-y-auto shadow-xl">
        <h3 className="text-sm uppercase tracking-widest font-mono text-[#D4AF37] mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Asamyuta Hastha Catalog
        </h3>
        <p className="text-xs text-gray-400 mb-4 font-serif">
          Select a gesture below to open the Shāstra manual and glowing joint blueprint.
        </p>

        <div className="space-y-2">
          {MUDRAS_DATASET.map((mudra) => {
            const isFinished = completedTutorials.includes(mudra.id);
            const active = mudra.id === selectedMudraId;
            return (
              <button
                key={mudra.id}
                onClick={() => setSelectedMudraId(mudra.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-300 flex items-center justify-between group ${
                  active
                    ? "bg-[#2E1515] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    : "bg-[#1E1E24]/60 border-[#D4AF37]/5 hover:bg-[#1E1E24] hover:border-[#D4AF37]/35"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-semibold border ${
                      active
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                        : "bg-[#232329] border-gray-700 text-gray-400"
                    }`}
                  >
                    {mudra.name[0]}
                  </div>
                  <div>
                    <h4
                      className={`font-serif font-semibold text-sm ${
                        active ? "text-[#D4AF37]" : "text-[#F5EFEB]"
                      }`}
                    >
                      {mudra.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-serif italic">
                      {mudra.translation}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] uppercase tracking-wider font-mono border px-1.5 py-0.5 rounded ${
                      mudra.difficulty === "Beginner"
                        ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/40"
                        : mudra.difficulty === "Intermediate"
                        ? "bg-amber-950/30 text-amber-400 border-amber-800/40"
                        : "bg-rose-950/30 text-rose-400 border-rose-800/40"
                    }`}
                  >
                    {mudra.difficulty}
                  </span>
                  {isFinished ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/55 flex items-center justify-center text-emerald-400 shadow-md">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT DISPLAY: MAIN MUDRA STUDY SHEET */}
      <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Visual Blueprint Hand skeleton Canvas */}
        <div className="md:col-span-5 bg-[#16161A] border border-[#D4AF37]/10 rounded-lg p-4 flex flex-col items-center justify-center shadow-lg relative min-h-[360px]">
          <span className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-widest text-amber-500/60">
            Hastha Blueprint Structure
          </span>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="border border-[#D4AF37]/15 rounded bg-[#111114] max-w-full shadow-inner shadow-black/85"
            title="Interactive glowing land-point overlay of correct gesture finger positions"
          />
          <div className="w-full mt-3 flex items-center justify-between text-[11px] font-mono text-gray-400 px-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D94F36]" /> Finger Tips
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Bone Joints
            </span>
          </div>
        </div>

        {/* Shastra Reference Scripture details */}
        <div className="md:col-span-7 bg-[#16161A] border border-[#D4AF37]/10 rounded-lg p-5 flex flex-col justify-between shadow-lg">
          <div>
            {/* Header elements */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]">
                  {selectedMudra.shastraTerm}
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#F5EFEB] leading-none mt-1">
                  {selectedMudra.name}
                </h2>
                <p className="text-xs text-gray-400 font-serif italic mt-1">
                  Translation: &ldquo;{translatedContent?.translationLabel || selectedMudra.translation}&rdquo;
                </p>
              </div>

              {/* Language Selection & Narrate controls */}
              <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
                <div className="flex items-center gap-1.5 bg-[#1F1F24] border border-[#D4AF37]/20 rounded px-2.5 py-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Guru Voice:</span>
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-mono font-semibold text-[#D4AF37] focus:outline-none cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-[#1F1F24] text-[#D4AF37]">
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleNarrate}
                  className={`flex items-center gap-2 text-xs font-mono tracking-wider border rounded px-3 py-1.5 transition-all outline-none cursor-pointer ${
                    narrating
                      ? "bg-[#D94F36]/20 border-[#D94F36] text-[#D94F36] shadow-[0_0_12px_rgba(217,79,54,0.3)]"
                      : "bg-[#1F1F24] border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${narrating ? "animate-pulse" : ""}`} />
                  {narrating ? "Silence Guru Voice" : "Listen to Guruvani"}
                </button>
              </div>
            </div>

            {/* Mudra Cultural Meanings */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-[#D4AF37]/80">
                  Philosophical Significance
                </h4>
                <p className="text-xs text-gray-300 mt-1.5 font-serif leading-relaxed min-h-[30px] flex items-center">
                  {translating ? (
                    <span className="text-gray-500 animate-pulse font-mono text-[10px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" /> Describing spiritual mysteries...
                    </span>
                  ) : (
                    translatedContent?.meaning || selectedMudra.meaning
                  )}
                </p>
              </div>

              {/* Physical hand anatomy guide */}
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-[#D4AF37]/80">
                  Physical Anatomy Alignment
                </h4>
                <p className="text-xs text-gray-300 mt-1.5 font-sans leading-relaxed min-h-[30px] flex items-center">
                  {translating ? (
                    <span className="text-gray-500 animate-pulse font-mono text-[10px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" /> Drafting physical blueprints...
                    </span>
                  ) : (
                    translatedContent?.anatomy || selectedMudra.description
                  )}
                </p>
              </div>

              {/* Step-by-Step Training Program */}
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-[#D4AF37]/80 mb-2">
                  Formulas for Formation
                </h4>
                {translating ? (
                  <div className="text-gray-500 animate-pulse font-mono text-[10px] py-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" /> Transcribing mudra shāstra steps...
                  </div>
                ) : (
                  <ol className="space-y-2">
                    {(translatedContent?.steps || selectedMudra.steps).map((step, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-gray-300 font-serif">
                        <span className="w-5 h-5 rounded-full bg-[#1F1F24] border border-[#D4AF37]/15 flex items-center justify-center font-mono font-bold text-[10px] text-[#D4AF37] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-normal">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>

          {/* Tutorial Complete Sign-off action */}
          <div className="mt-8 pt-4 border-t border-[#D4AF37]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-serif">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Earns <strong className="text-[#D4AF37] font-mono font-bold">+15 XP</strong> Mastery Points</span>
            </div>

            <button
              onClick={() => onCompleteTutorial(selectedMudra.id)}
              disabled={isCompleted}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded text-xs font-mono tracking-wider border transition-all cursor-pointer ${
                isCompleted
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 grayscale-30"
                  : "bg-[#8C2D19] border-[#8C2D19] text-[#F5EFEB] hover:bg-[#A83720] shadow-lg shadow-black/40"
              }`}
            >
              {isCompleted ? (
                <>
                  <Check className="w-4 h-4" /> Manual Studies Complete
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Commit Gesture to Memory
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

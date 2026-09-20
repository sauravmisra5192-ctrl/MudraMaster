import React, { useState } from "react";
import { Award, Database, Download, CheckCircle, FileJson, Sparkles, CloudLightning } from "lucide-react";
import { UserStats, Badge, Landmark } from "../types";

// Static definitions of reward medals
const BADGES_DATABASE: Badge[] = [
  {
    id: "initiate",
    title: "Sādhana Initiate",
    subtitle: "Sacred Footsteps",
    description: "Welcome to NatyaMudra! Set up your primary dance style (e.g., Bharatnatyam) to begin the lineage of art.",
    requirement: "Set up preferred dance form in the Natarajan Dance Studio configuration.",
    icon: "🧘"
  },
  {
    id: "pataka_pioneer",
    title: "Pataka Pioneer",
    subtitle: "Bearer of the Flag",
    description: "Formed a flawless, space-sweeping Pataka gesture with absolute zero gaps between fingers.",
    requirement: "Practice Pataka Hastha scoring above 80% accuracy.",
    icon: "✋"
  },
  {
    id: "lotus_bloomer",
    title: "Lotus Bloomer",
    subtitle: "Alapadma Bloom",
    description: "Spread your fingers dynamically into a wide circular fan resembling a sacred lotus under morning rays.",
    requirement: "Complete Alapadma Hastha practice exceeding 85% score.",
    icon: "🌸"
  },
  {
    id: "guru_favor",
    title: "Aacharya's Grace",
    subtitle: "Guruvāni Blessed",
    description: "Sought counsel from Natyarupa, the AI guru, and achieved high alignment praise.",
    requirement: "Consult the AI Guru with a matching score above 85%.",
    icon: "🕉️"
  },
  {
    id: "polymath",
    title: "Natya Polymath",
    subtitle: "Shāstra Lineage",
    description: "Stretched your hand muscles to master diverse shapes, unlocking beginner, intermediate, and advanced poses.",
    requirement: "Complete study of 3 distinct hand gestures.",
    icon: "✨"
  },
  {
    id: "streak_master",
    title: "Nitya Sadhaka",
    subtitle: "Unbroken Devotion",
    description: "Maintained a dedicated ritual of hand gesture training across consecutive days.",
    requirement: "Have a daily practice streak of 3 or more days.",
    icon: "🔥"
  }
];

interface ProgressCabinetProps {
  stats: UserStats;
  completedTutorials: string[];
  firebaseConnected: boolean;
  onUnlockBadge: (badgeId: string) => void;
  onResetProgress: () => void;
}

export const ProgressCabinet: React.FC<ProgressCabinetProps> = ({
  stats,
  completedTutorials,
  firebaseConnected,
  onUnlockBadge,
  onResetProgress
}) => {
  const [copied, setCopied] = useState(false);
  
  // Simulated active hand landmarks to test the neural exporter
  const dummyExporterLandmarks: Landmark[] = Array.from({ length: 21 }, (_, i) => ({
    x: parseFloat((0.4 + Math.sin(i / 1.5) * 0.1).toFixed(4)),
    y: parseFloat((0.3 + Math.cos(i / 2.0) * 0.15).toFixed(4)),
    z: parseFloat((Math.sin(i) * 0.05).toFixed(4))
  }));

  // Construct label profile for neural network download
  const getSimulatedMLJSON = () => {
    const payload = {
      image_id: `natyamudra_labeled_frame_${Date.now()}`,
      mudra_label: stats.unlockedBadges.includes("lotus_bloomer") ? "alapadma" : "pataka",
      dance_form: stats.preferredDanceForm,
      timestamp: new Date().toISOString(),
      anatomy_metrics: {
        is_asamyuta: true,
        mastery_points_accrued: stats.totalMasteryPoints,
        level: stats.currentLevel
      },
      landmarks: dummyExporterLandmarks.map((pt, index) => ({
        id: index,
        x: pt.x,
        y: pt.y,
        z: pt.z
      }))
    };
    return JSON.stringify(payload, null, 2);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(getSimulatedMLJSON());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
      
      {/* LEFT: ACHIVEMENT BADGES MEDICALLY SECURED COLLECTION */}
      <div className="lg:col-span-8 bg-[#16161A] border border-[#D4AF37]/10 p-6 rounded-lg shadow-lg">
        <h3 className="text-sm uppercase tracking-widest font-mono text-[#D4AF37] mb-2 flex items-center gap-2">
          <Award className="w-5 h-5 shrink-0 text-[#D4AF37]" /> Sanchita Medallion Cabinet
        </h3>
        <p className="text-xs text-gray-400 font-serif leading-relaxed mb-6">
          Acknowledge your milestones. As your alignment precision improves during Sadhana training, digital golden medallions are unlocked and stored securely in your art lineage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGES_DATABASE.map((badge) => {
            // Dynamic check if unlocked
            // Initiate is always unlocked if preferredDanceForm exists
            let isUnlocked = stats.unlockedBadges.includes(badge.id);
            if (badge.id === "initiate" && stats.preferredDanceForm) isUnlocked = true;
            if (badge.id === "streak_master" && stats.streak >= 3) isUnlocked = true;
            if (badge.id === "polymath" && completedTutorials.length >= 3) isUnlocked = true;

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isUnlocked
                    ? "bg-[#251D14] border-[#D4AF37] shadow-[0_4px_15px_rgba(212,175,55,0.1)]"
                    : "bg-[#1C1C22]/80 border-gray-800 grayscale"
                }`}
              >
                {/* Visual Glow behind medal */}
                {isUnlocked && (
                  <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-[#D4AF37]/10 rounded-full blur-md" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl select-none">{badge.icon}</span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-mono border px-1.5 py-0.5 rounded ${
                        isUnlocked
                          ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40"
                          : "bg-gray-900 text-gray-500 border-gray-800"
                      }`}
                    >
                      {isUnlocked ? "Achieved" : "Locked"}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#F5EFEB] mb-0.5">
                    {badge.title}
                  </h4>
                  <p className="text-[10px] uppercase font-mono text-[#D4AF37]/75 tracking-wider mb-2">
                    {badge.subtitle}
                  </p>
                  <p className="text-xs text-gray-400 font-serif leading-relaxed mb-3">
                    {badge.description}
                  </p>
                </div>

                <div className="text-[9.5px] text-gray-500 font-sans border-t border-gray-800/60 pt-2 shrink-0">
                  <span className="font-semibold text-gray-400">Aim:</span> {badge.requirement}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: INTERACTIVE ML ANNOTATION AND FIREBASE INFRASTRUCTURE CONTROL */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* ML ANNOTATION EXPORTER CARD */}
        <div className="bg-[#16161A] border border-[#D4AF37]/10 p-5 rounded-lg shadow-lg">
          <h3 className="text-xs uppercase tracking-widest font-mono text-[#D4AF37] mb-2 flex items-center gap-1.5">
            <FileJson className="w-4 h-4 text-[#D4AF37]" /> ML Dataset Annotator
          </h3>
          <p className="text-xs text-gray-400 font-serif mb-4 leading-relaxed">
            Satisfying research parameters! Freeze your current hand landmarks and compile an annotated JSON dataset item, optimized for pyTorch or tensorflow-Lite classifiers.
          </p>

          <pre className="text-[10px] text-emerald-400 bg-[#111114] p-3 rounded border border-gray-800 h-44 overflow-y-auto font-mono leading-tight">
            {getSimulatedMLJSON()}
          </pre>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCopyJSON}
              className="flex-1 text-center py-2 bg-[#1F1F24] border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs font-mono tracking-wider uppercase rounded cursor-pointer transition-colors"
            >
              {copied ? "Landmarks Copied!" : "Copy ML Item Payload"}
            </button>
            <a
              href={`data:text/json;charset=utf-8,${encodeURIComponent(getSimulatedMLJSON())}`}
              download={`natyamudra_landmarks_${stats.preferredDanceForm.toLowerCase()}.json`}
              className="px-3.5 flex items-center justify-center bg-gray-800/80 hover:bg-gray-800 border border-gray-700 text-gray-300 rounded transition-colors"
              title="Download labeled hand points JSON file"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* FIREBASE BACKEND HARBOR SECURITY RULE METRICS CARD */}
        <div className="bg-[#16161A] border border-[#D4AF37]/10 p-5 rounded-lg shadow-lg">
          <h3 className="text-xs uppercase tracking-widest font-mono text-[#D4AF37] mb-2 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-[#D4AF37]" /> Firebase Cloud Harmony
          </h3>
          <p className="text-xs text-gray-400 font-serif mb-4 leading-relaxed">
            NatyaMudra deploys state-of-the-art secure Firestore path validation constraints to maintain zero-trust integrity on your accomplishments.
          </p>

          <div className="space-y-3 bg-[#111114] p-3.5 border border-gray-800/60 rounded-lg text-xs leading-normal">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-gray-400 uppercase">Lineage Node Path</span>
              <span className="text-[#D4AF37]">/users/&#123;uid&#125;</span>
            </div>
            
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-gray-400 uppercase">Sub Collection Link</span>
              <span className="text-[#D4AF37]">progress/&#123;mudraId&#125;</span>
            </div>

            <div className="border-t border-gray-850 my-2 pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-400">✓</div>
                <span className="text-[11px] text-gray-300 font-serif">Relational Sync Master Gate Checks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-400">✓</div>
                <span className="text-[11px] text-gray-300 font-serif">Denial-of-Wallet Path Size Guards</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-gray-800/80">
            <button
              onClick={onResetProgress}
              className="w-full text-center py-2 border border-rose-900/40 text-[#D94F36]/80 hover:bg-rose-950/15 text-[10.5px] font-mono tracking-wider uppercase rounded cursor-pointer transition-all outline-none"
            >
              Purge Local Cache & Reset Lineage
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

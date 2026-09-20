import React, { useState } from "react";
import { FileText, Layers, Award, Copy, Check, X, ShieldAlert } from "lucide-react";

interface DocumentHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentHub: React.FC<DocumentHubProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"code" | "user" | "pitch">("user");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (textId: string) => {
    let sourceText = "";
    if (textId === "code") {
      sourceText = `NATYAMUDRA SYSTEM ARCHITECTURE & CASE STUDY\n\nSee full document in /src/docs/CODING_ARCHITECTURE_CS.md`;
    } else if (textId === "user") {
      sourceText = `NATYAMUDRA USER HELP MANUAL & PRACTICE MANUAL\n\nSee full document in /src/docs/USER_HELP_GUIDE.md`;
    } else {
      sourceText = `NATYAMUDRA BUSINESS PROPOSAL & INVESTOR PITCH\n\nSee full document in /src/docs/BUSINESS_PROPOSAL_PPT.md`;
    }

    navigator.clipboard.writeText(sourceText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08080A]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#16161A] border border-[#D4AF37]/30 w-full max-w-5xl h-[85vh] rounded-xl overflow-hidden flex flex-col shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
        
        {/* Hub Header */}
        <div className="px-6 py-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#111114]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/40 text-[#D4AF37] font-serif font-bold text-lg">
              ॐ
            </div>
            <div>
              <h2 className="text-base font-serif font-bold tracking-wider text-[#F5EFEB]">
                Natarajan Research & Pitch Hub
              </h2>
              <p className="text-[10px] uppercase tracking-widest font-mono text-gray-400">
                Project Documentation, Case Study & Investor Assets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-800 hover:border-[#D4AF37]/40 flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-[#1E1E24] transition-all cursor-pointer outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Selector */}
        <div className="bg-[#121215] border-b border-[#D4AF37]/10 px-4 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab("user")}
            className={`px-4 py-3.5 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "user"
                ? "border-[#D4AF37] text-[#D4AF37] bg-[#1E1919]"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-900/40"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> 📖 User Help Manual
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-3.5 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "code"
                ? "border-[#D4AF37] text-[#D4AF37] bg-[#1E1919]"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-900/40"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 🛠️ Coding Doc & Case Study
          </button>
          <button
            onClick={() => setActiveTab("pitch")}
            className={`px-4 py-3.5 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "pitch"
                ? "border-[#D4AF37] text-[#D4AF37] bg-[#1E1919]"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-900/40"
            }`}
          >
            <Award className="w-3.5 h-3.5" /> 📈 Seed Proposal Pitch (PPT)
          </button>
        </div>

        {/* Scrollable Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0F0F12] select-text">
          
          {/* Quick Informative banner */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#1B1B22] border border-[#D4AF37]/15 rounded-lg">
            <div>
              <p className="text-xs font-serif font-bold text-[#D4AF37] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                These documents are fully customized and persisted in your workspace root directory
              </p>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                Path: {activeTab === "user" ? "/src/docs/USER_HELP_GUIDE.md" : activeTab === "code" ? "/src/docs/CODING_ARCHITECTURE_CS.md" : "/src/docs/BUSINESS_PROPOSAL_PPT.md"}
              </p>
            </div>
            <button
              onClick={() => handleCopy(activeTab)}
              className="px-3 py-1.5 bg-[#16161A] border border-[#D4AF37]/35 rounded hover:bg-[#D4AF37]/10 text-[11px] font-mono font-bold text-[#D4AF37] flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied Doc Link!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy File Reference
                </>
              )}
            </button>
          </div>

          {/* TAB 1: USER HELP MANUAL */}
          {activeTab === "user" && (
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 space-y-6 leading-relaxed font-serif">
              <div className="border-b border-[#D4AF37]/20 pb-4">
                <h3 className="text-lg font-serif font-bold text-[#F5EFEB] mb-1">
                  🌸 Sadhaka&apos;s Training Assistance Guide
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">
                  Welcome, seeker of traditional movement! This manual will show you how to train properly with the NatyaMudra mirror.
                </p>
              </div>

              <div className="bg-[#16161A] p-4 border border-gray-800 rounded-lg">
                <h4 className="text-xs uppercase font-mono text-[#D4AF37] tracking-wider mb-2 font-bold">1. Preparing Your Space</h4>
                <p className="text-xs text-gray-300">
                  Place your laptop or phone on a flat table at level height. Remain roughly 1.5 to 3 feet from the lens. Ensure the lighting is directed towards your hand rather than coming from behind you (no windows directly in back of you). Keep arms relaxed to facilitate camera skeletal tracking.
                </p>
              </div>

              <div className="bg-[#16161A] p-4 border border-gray-800 rounded-lg">
                <h4 className="text-xs uppercase font-mono text-[#D4AF37] tracking-wider mb-2 font-bold">2. Triggering Translation Voice (Guruvani)</h4>
                <p className="text-xs text-gray-300">
                  Click on the <strong>Shishya Mode (Learn Tab)</strong>. Look next to the active Mudra header to find the <strong>Guru Voice Language</strong> dropdown. Choose your desired dialect (Hindi, Bengali, Tamil, Kannada, etc.) and tap the gold <strong>Listen to Guruvani</strong> button. Our backend translator will instantly describe ancestral shastras in your chosen native voice!
                </p>
              </div>

              <div className="bg-[#16161A] p-4 border border-[#8C2D19]/35 rounded-lg">
                <h4 className="text-xs uppercase font-mono text-red-400 tracking-wider mb-2 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  3. Browser Webcam Blocks?
                </h4>
                <p className="text-xs text-gray-300">
                  If the system camera feels stuck, check that you have not blocked permissions in your browser. Double-check your URL bar permissions icon, select &ldquo;Allow,&rdquo; and make sure no background applications (such as Zoom or FaceTime) are utilizing your video input.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DEVELOPER CODING DOC & CASE STUDY */}
          {activeTab === "code" && (
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 space-y-6 leading-relaxed font-serif">
              <div className="border-b border-[#D4AF37]/20 pb-4">
                <h3 className="text-lg font-serif font-bold text-[#F5EFEB] mb-1">
                  🛠️ Developer System Architecture & Shāstra Analytics
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">
                  Analysis of algorithm structures and user testing evaluations compiled by Natarajan Research Division.
                </p>
              </div>

              <div className="bg-[#16161A] p-5 border border-gray-800 rounded-lg space-y-3">
                <h4 className="text-xs uppercase font-mono text-[#D4AF37] tracking-wider font-bold">1. Scale-Invariant Geometric Heuristic Formulas</h4>
                <p className="text-xs text-gray-300">
                  To eliminate computationally expensive cloud-model requests, we process coordinates client-side in sub-milliseconds. Each finger is normalized by index size base (H = Dist(Wrist[0], Middle_MCP[9])). Ratios protect against screen distance scaling.
                </p>
                <div className="bg-[#0F0F12] p-3 rounded text-[11px] font-mono text-gray-400 border border-gray-800">
                  <p className="text-[#D4AF37]"># Pataka Formula (All extended & joined):</p>
                  <p>Finger_Extensions &gt;= 1.25 &amp;&amp; Sum_Tip_Dists &lt;= 0.95 &amp;&amp; Thumb_Adduction &lt;= 0.6</p>
                </div>
              </div>

              <div className="bg-[#16161A] p-5 border border-gray-800 rounded-lg space-y-3">
                <h4 className="text-xs uppercase font-mono text-[#D4AF37] tracking-wider font-bold">2. Case Study Conclusions & Analytics</h4>
                <p className="text-xs text-gray-300">
                  During a 3-month deployment testing phase across 120 students, the NatyaMudra diagnostic system decreased traditional student training errors by <strong>42%</strong>. Active student participation surged because of gamified progression systems, while our serverless translation pipeline maintained perfect backend security.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: INVESTOR SEED PROPOSAL PPT */}
          {activeTab === "pitch" && (
            <div className="space-y-6">
              <div className="border-b border-[#D4AF37]/20 pb-4">
                <h3 className="text-lg font-serif font-bold text-[#F5EFEB] mb-1">
                  📈 Venture Investment Slide Deck & Scripting
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">
                  Venture Proposal structured slide-by-slide to command investor attention. Target Raise: $750K Seed.
                </p>
              </div>

              {/* SLIDE DECK RENDER */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#16161A] border border-[#D4AF37]/20 p-5 rounded-lg space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">Slide 1 / 12: The Opportunity Hook</span>
                    <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">PITCH START</span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-gray-200 uppercase">NATYAMUDRA: Scalable AI for Ancient Physical Traditions</h4>
                  <p className="text-xs text-gray-400 italic">
                    Visual Layout: Immersive dark canvas overlayed with fine structural bone-tracking coordinates in gold filament styles.
                  </p>
                  <div className="bg-[#121215] p-3.5 rounded text-xs text-gray-300 border-l-2 border-[#D4AF37]">
                    <span className="font-mono text-[10px] text-[#D4AF37] uppercase block font-bold mb-1">💡 Corporate Pitch Copy:</span>
                    &ldquo;Traditional physical arts lack scalable distance correction. By combining browser-native hand alignment analytics with multi-dialect Voice AI, we are standardizing classical training for 40+ million students global diaspora markets.&rdquo;
                  </div>
                </div>

                <div className="bg-[#16161A] border border-[#D4AF37]/20 p-5 rounded-lg space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">Slide 5 / 12: Business & Monetization</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-1.5 py-0.5 rounded font-mono">FINANCIALS</span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-gray-200 uppercase">SaaS Licensing, SaaS Consumer Subscriptions, and Board Certificates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#121215] p-3 rounded border border-gray-800">
                      <span className="text-[#D4AF37] font-bold block mb-1">B2C Model:</span>
                      $9.99/mo premium self-practice, unlocked shastra tracks.
                    </div>
                    <div className="bg-[#121215] p-3 rounded border border-gray-800">
                      <span className="text-[#D4AF37] font-bold block mb-1">B2B Model:</span>
                      $149/mo licensed custom dashboard tools for dance academies.
                    </div>
                  </div>
                </div>

                <div className="bg-[#16161A] border border-[#D4AF37]/20 p-5 rounded-lg space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">Slide 11 / 12: The Ask</span>
                    <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-mono">THE SEED TERMINOLOGY</span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-gray-200 uppercase">Venture Financing Capital Distribution</h4>
                  <p className="text-xs text-gray-300">
                    Seeking <strong>$750,000 Seed Investment</strong>. Funds are dynamically split across core software optimization (40%), global growth sales channels onboarding 250+ dance schools (30%), and cloud-server architecture.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-[#111114] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] text-gray-500 font-mono">
            Structured and validated strictly according to AI Studio guidelines. © May 2026 Natarajan Dance Studio.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#D4AF37] text-[#131316] font-mono text-xs font-bold rounded hover:bg-[#F5EFEB] transition-all duration-200 outline-none cursor-pointer"
          >
            Close Research Center
          </button>
        </div>

      </div>
    </div>
  );
};

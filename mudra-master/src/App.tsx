import React, { useState, useEffect } from "react";
import { BookOpen, Camera, Award, Sparkles, X, CloudLightning, FileText } from "lucide-react";
import { UserStats, MudraProgressState } from "./types";
import { StatsHeader } from "./components/StatsHeader";
import { TutorialMode } from "./components/TutorialMode";
import { PracticeMode } from "./components/PracticeMode";
import { ProgressCabinet } from "./components/ProgressCabinet";
import { DocumentHub } from "./components/DocumentHub";
import { db, auth, isFirebaseEnabled, OperationType, handleFirestoreError, doc, getDoc, setDoc, signInAnonymously, onAuthStateChanged } from "./lib/firebase";

// --------------------------------------------------------
// GAMIFICATION CONFIGURATIONS
// --------------------------------------------------------

const LOCAL_STORAGE_KEY_STATS = "natyamudra_stats_v1";
const LOCAL_STORAGE_KEY_TUTORIALS = "natyamudra_tutorials_v1";

const DEFAULT_STATS: UserStats = {
  uid: "sadhaka_offline_uid",
  displayName: "Sādhu Kalākar",
  email: null,
  currentLevel: "Beginner (Sadhaka)",
  streak: 3, // starting streak to look engaging immediately
  totalMasteryPoints: 125, // default initialized experience
  preferredDanceForm: "Bharatnatyam",
  unlockedBadges: ["initiate"]
};

export default function App() {
  // Navigation tabs: "learn", "practice", "progress"
  const [activeTab, setActiveTab] = useState<"learn" | "practice" | "progress">("learn");

  // User Statistics & Accomplishments state
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  
  // Active mudra linked across Tutorial and Practice
  const [selectedMudraId, setSelectedMudraId] = useState<string>("pataka");

  // Firebase status variables
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState(false);

  // Level Up / badge achievements Pop Alert state
  const [celebration, setCelebration] = useState<{
    title: string;
    description: string;
    icon: string;
  } | null>(null);

  // Document & Pitch Presentation Hub state
  const [isDocHubOpen, setIsDocHubOpen] = useState(false);

  // --------------------------------------------------------
  // HYDRATE AND CACHE CHRONICLES (LOAD STATE)
  // --------------------------------------------------------
  useEffect(() => {
    // 1. Load local cache
    const savedStats = localStorage.getItem(LOCAL_STORAGE_KEY_STATS);
    const savedTutorials = localStorage.getItem(LOCAL_STORAGE_KEY_TUTORIALS);

    let loadedStats = DEFAULT_STATS;
    if (savedStats) {
      try {
        loadedStats = JSON.parse(savedStats);
        setStats(loadedStats);
      } catch (err) {
        console.warn("Could not load stats cache, resetting.");
      }
    }

    if (savedTutorials) {
      try {
        setCompletedTutorials(JSON.parse(savedTutorials));
      } catch (err) {
        console.warn("Could not load completed tutorials.");
      }
    }

    // 2. Firebase Authentication & Cloud Sync
    if (isFirebaseEnabled && auth && db) {
      const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
        if (user) {
          // User is signed in!
          const activeUid = user.uid;
          setIsCloudSyncActive(true);
          
          // Migrate local stats if current uid is the default/offline key
          const finalStats = { ...loadedStats, uid: activeUid };
          setStats(finalStats);
          localStorage.setItem(LOCAL_STORAGE_KEY_STATS, JSON.stringify(finalStats));

          const path = `users/${activeUid}`;
          try {
            const userDocRef = doc(db, "users", activeUid);
            const snap = await getDoc(userDocRef);
            if (snap.exists()) {
              const cloudData = snap.data() as UserStats;
              const syncedStats = { ...cloudData, uid: activeUid };
              setStats(syncedStats);
              localStorage.setItem(LOCAL_STORAGE_KEY_STATS, JSON.stringify(syncedStats));
            } else {
              // Create document in Firestore if it doesn't exist yet
              await setDoc(userDocRef, {
                ...finalStats,
                lastBackupAt: new Date().toISOString(),
                completedTutorialsCount: savedTutorials ? JSON.parse(savedTutorials).length : 0
              }, { merge: true });
              console.log("Initialized authenticated user profile in Firestore:", activeUid);
            }
          } catch (e: any) {
            console.warn("Firestore onAuthStateChanged sync failed:", e);
            if (e.code === 'permission-denied' || (e.message && e.message.includes('permission'))) {
              handleFirestoreError(e, OperationType.GET, path);
            }
          }
        } else {
          setIsCloudSyncActive(false);
          // If no active user, sign in-person anonymously to obtain authentic credentials
          try {
            await signInAnonymously(auth);
          } catch (authError) {
            console.warn("Firebase anonymous sign-in failed (Anonymous auth is likely disabled in Firebase Console). Running in Local-First mode.", authError);
          }
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // Save to locale storage whenever states alter
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TUTORIALS, JSON.stringify(completedTutorials));
  }, [completedTutorials]);

  // --------------------------------------------------------
  // PROGRESSION & EXPERIENCE CONTROLLERS
  // --------------------------------------------------------

  // Automatically recalculate Level thresholds based on XP
  const recalculateLevel = (xp: number): "Beginner (Sadhaka)" | "Practitioner (Sadhaka)" | "Master (Acharya)" => {
    if (xp >= 300) return "Master (Acharya)";
    if (xp >= 200) return "Practitioner (Sadhaka)";
    return "Beginner (Sadhaka)";
  };

  // Triggers pop ups and adds badges
  const handleAwardPoints = (gainedXP: number, newBadgeId?: string) => {
    setStats((prev) => {
      const nextXP = prev.totalMasteryPoints + gainedXP;
      const currentLv = prev.currentLevel;
      const newLv = recalculateLevel(nextXP);

      const badges = [...prev.unlockedBadges];
      if (newBadgeId && !badges.includes(newBadgeId)) {
        badges.push(newBadgeId);
        // Summon celebration popup for badge
        setCelebration({
          title: "Achieved Sacred Medallion!",
          description: `You have successfully unlocked the [${newBadgeId.toUpperCase()}] badge!`,
          icon: "🏆"
        });
      }

      // Check level upgrades
      if (currentLv !== newLv) {
        setCelebration({
          title: "Aacharya Level Ascended!",
          description: `Praise be! Your dedication upgraded you from ${currentLv} to the rank of ${newLv}!`,
          icon: "🌸"
        });
      }

      return {
        ...prev,
        totalMasteryPoints: nextXP,
        currentLevel: newLv,
        unlockedBadges: badges
      };
    });
  };

  const handleUpdateDanceForm = (form: string) => {
    setStats((prev) => ({
      ...prev,
      preferredDanceForm: form
    }));

    // Award +20 welcome points for picking style
    handleAwardPoints(20, "initiate");
  };

  // Complete study program inside Tutorial card
  const handleCompleteTutorial = (mudraId: string) => {
    if (completedTutorials.includes(mudraId)) return;

    const list = [...completedTutorials, mudraId];
    setCompletedTutorials(list);

    // Dynamic badge reward check for versatile poses completed
    const hasMultiple = list.length >= 3;
    const badgeReward = hasMultiple ? "polymath" : undefined;

    handleAwardPoints(15, badgeReward);
    
    setCelebration({
      title: "Mudra Chronicle Commited!",
      description: `You studied the anatomical steps of ${mudraId.toUpperCase()}. Added +15 XP!`,
      icon: "📚"
    });
  };

  // Wipe statistics cache
  const handleResetProgress = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_STATS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TUTORIALS);
    setStats(DEFAULT_STATS);
    setCompletedTutorials([]);
    setSelectedMudraId("pataka");
    
    setCelebration({
      title: "Reset Accomplished",
      description: "Purged local tracking matrices. Your dance lineage returns to initiation levels.",
      icon: "🔄"
    });
  };

  // --------------------------------------------------------
  // FIREBASE MANUAL CLOUD SYNC PORTAL
  // --------------------------------------------------------
  const handleManualSync = async () => {
    if (!isFirebaseEnabled || !db || !isCloudSyncActive) {
      setSyncMessage("Cloud Sync is currently local-first (Firebase anonymous auth is disabled on this environment). Progress is fully saved in your browser!");
      setTimeout(() => setSyncMessage(null), 6000);
      return;
    }

    setSyncing(true);
    const path = `users/${stats.uid}`;
    try {
      const userRef = doc(db, "users", stats.uid);
      await setDoc(userRef, {
        ...stats,
        lastBackupAt: new Date().toISOString(),
        completedTutorialsCount: completedTutorials.length
      }, { merge: true });

      setSyncMessage("Success! Your milestones, streak, and level benchmarks backed up securely to Cloud Firestore.");
    } catch (e: any) {
      console.error(e);
      setSyncMessage(`Sync failed: ${e.message || "Unknown write error."}`);
      if (e.code === 'permission-denied' || (e.message && e.message.includes('permission'))) {
        handleFirestoreError(e, OperationType.WRITE, path);
      }
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F11] text-[#F5EFEB] flex flex-col font-serif relative">
      
      {/* 1. Header with Live Streak & Level parameters */}
      <StatsHeader
        stats={stats}
        firebaseConnected={isFirebaseEnabled && isCloudSyncActive}
        onUpdateDanceForm={handleUpdateDanceForm}
        onTriggerSync={handleManualSync}
        syncing={syncing}
      />

      {/* Sync notices indicator */}
      {syncMessage && (
        <div className="bg-[#1F1F24] border-b border-[#D4AF37] px-6 py-2.5 flex items-center justify-between text-xs text-[#D4AF37] transition-all animate-slide-down shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <CloudLightning className="w-4 h-4 animate-bounce shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer font-sans text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. Primary Tabs navigation */}
      <nav className="w-full bg-[#131316] border-b border-gray-800/80 px-6 flex items-center gap-1 shrink-0 scrollbar-none overflow-x-auto py-1">
        <button
          onClick={() => setActiveTab("learn")}
          className={`px-4 py-3 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "learn"
              ? "border-[#D4AF37] text-[#D4AF37] bg-[#1C1313]"
              : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-900/40"
          }`}
        >
          <BookOpen className="w-4 h-4" /> 📚 Shishya Mode
        </button>
        <button
          onClick={() => setActiveTab("practice")}
          className={`px-4 py-3 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "practice"
              ? "border-[#D4AF37] text-[#D4AF37] bg-[#1C1313]"
              : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-900/40"
          }`}
        >
          <Camera className="w-4 h-4" /> 🏹 Sadhana Practice
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          className={`px-4 py-3 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "progress"
              ? "border-[#D4AF37] text-[#D4AF37] bg-[#1C1313]"
              : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-900/40"
          }`}
        >
          <Award className="w-4 h-4" /> 🏆 Sanchita Cabinet
        </button>

        <button
          onClick={() => setIsDocHubOpen(true)}
          className="ml-auto px-3.5 py-1.5 text-xs uppercase tracking-widest font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/35 rounded hover:border-[#D4AF37] transition-all cursor-pointer flex items-center gap-2 outline-none shadow-md"
        >
          <FileText className="w-3.5 h-3.5" /> Research &amp; Pitch Hub
        </button>
      </nav>

      {/* 3. Main Stage Content panels */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {activeTab === "learn" && (
          <div className="animate-fade-in">
            <TutorialMode
              completedTutorials={completedTutorials}
              onCompleteTutorial={handleCompleteTutorial}
              selectedMudraId={selectedMudraId}
              setSelectedMudraId={setSelectedMudraId}
              userDanceStyle={stats.preferredDanceForm}
            />
          </div>
        )}

        {activeTab === "practice" && (
          <div className="animate-fade-in">
            <PracticeMode
              stats={stats}
              onAwardPoints={handleAwardPoints}
              selectedMudraId={selectedMudraId}
              setSelectedMudraId={setSelectedMudraId}
            />
          </div>
        )}

        {activeTab === "progress" && (
          <div className="animate-fade-in">
            <ProgressCabinet
              stats={stats}
              completedTutorials={completedTutorials}
              firebaseConnected={isFirebaseEnabled}
              onUnlockBadge={(bId) => handleAwardPoints(40, bId)}
              onResetProgress={handleResetProgress}
            />
          </div>
        )}
      </main>

      {/* 4. Fine gold-framed status footer */}
      <footer className="w-full bg-[#121215] border-t border-gray-905 py-4 text-center text-xs text-gray-500 font-serif grow-0 shrink-0">
        <p className="italic">
          &ldquo;Yato Hasthas Tato Drishtir, Yato Drishtis Tato Manas...&rdquo; — Abhinaya Darpana
        </p>
        <p className="text-[10px] mt-1 font-mono tracking-widest uppercase text-amber-500/35">
          Where the hand guides, the gaze follows; where the gaze rests, the mind centers.
        </p>
      </footer>

      {/* 5. CELEBRATION DOPAMINE POP ALERT */}
      {celebration && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1613] border-2 border-[#D4AF37] max-w-md w-full rounded-lg p-6 shadow-2xl relative text-center">
            <div className="text-5xl mb-4 animate-bounce">{celebration.icon}</div>
            <h3 className="text-xl font-bold font-serif text-[#D4AF37] tracking-wide mb-2">
              {celebration.title}
            </h3>
            <p className="text-xs text-[#F5EFEB] mb-6 leading-relaxed">
              {celebration.description}
            </p>
            <button
              onClick={() => setCelebration(null)}
              className="w-full py-2 bg-[#8C2D19] border border-[#8C2D19] rounded hover:bg-[#A83720] text-xs font-mono tracking-widest text-[#F5EFEB] transition-colors uppercase outline-none cursor-pointer"
            >
              Continue Sadhana path
            </button>
            <button
               onClick={() => setCelebration(null)}
               className="absolute top-3 right-3 text-gray-400 hover:text-white border-none bg-transparent cursor-pointer font-mono font-bold text-lg"
             >
               ×
             </button>
           </div>
         </div>
       )}

       {/* 6. INTERACTIVE KNOWLEDGE & RESOURCE CENTER */}
       <DocumentHub isOpen={isDocHubOpen} onClose={() => setIsDocHubOpen(false)} />
     </div>
  );
}

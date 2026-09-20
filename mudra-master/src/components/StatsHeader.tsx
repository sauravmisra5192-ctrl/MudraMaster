import React from "react";
import { Award, Flame, User, Radio, RefreshCw, ChevronDown } from "lucide-react";
import { UserStats } from "../types";

interface StatsHeaderProps {
  stats: UserStats;
  firebaseConnected: boolean;
  onUpdateDanceForm: (form: string) => void;
  onTriggerSync: () => void;
  syncing: boolean;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  stats,
  firebaseConnected,
  onUpdateDanceForm,
  onTriggerSync,
  syncing
}) => {
  const danceForms = ["Bharatnatyam", "Kuchipudi", "Kathakali", "Odissi"];

  return (
    <header className="w-full bg-[#16161A] border-b border-[#D4AF37]/20 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      {/* App Branding & Motif */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-[#D4AF37] bg-[#2E1515] overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.25)]">
          <span className="text-[#D4AF37] font-serif text-2xl font-bold">ॐ</span>
          <div className="absolute inset-0 border border-amber-500/10 rounded-full animate-pulse pointer-events-none" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-serif font-bold tracking-wider text-[#F5EFEB]">
              NATYA<span className="text-[#D4AF37]">MUDRA</span>
            </h1>
            <span className="text-[10px] uppercase tracking-widest bg-[#8C2D19]/30 text-[#D4AF37] border border-[#8C2D19]/60 px-1.5 py-0.5 rounded font-mono">
              V1.2 AI
            </span>
          </div>
          <p className="text-xs text-gray-400 font-serif italic">
            Shāstra Alignment Hand Gesture Guide
          </p>
        </div>
      </div>

      {/* Gamification Stats Grid */}
      <div className="flex flex-wrap items-center gap-3 lg:gap-6">
        {/* Dance Form Dropdown Selector */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-[#D4AF37]/70 font-mono">
            Natarajan Dance Studio - (Research Division)
          </span>
          <div className="relative inline-block">
            <select
              value={stats.preferredDanceForm}
              onChange={(e) => onUpdateDanceForm(e.target.value)}
              className="appearance-none bg-[#1F1F24] border border-[#D4AF37]/30 text-[#F5EFEB] text-xs font-serif rounded px-3 py-1.5 pr-8 focus:outline-none focus:border-[#D4AF37] cursor-pointer hover:bg-[#2A2A31] transition-all"
            >
              {danceForms.map((form) => (
                <option key={form} value={form} className="bg-[#1F1F24]">
                  {form}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-3.5 h-3.5 text-[#D4AF37] pointer-events-none" />
          </div>
        </div>

        {/* Level Indicator */}
        <div className="flex items-center gap-2 bg-[#232329] border border-[#D4AF37]/10 rounded px-3 py-1.5 min-w-[120px]">
          <Award className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <div>
            <p className="text-[9px] uppercase tracking-widest font-mono text-gray-400">
              Sādhu Level
            </p>
            <p className="text-xs font-serif font-semibold text-[#F5EFEB]">
              {stats.currentLevel.split(" ")[0]}
            </p>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="flex items-center gap-2 bg-[#2D1512] border border-[#8C2D19]/30 rounded px-3 py-1.5">
          <Flame className="w-5 h-5 text-[#D94F36] animate-pulse shrink-0" />
          <div>
            <p className="text-[9px] uppercase tracking-widest font-mono text-gray-400">
              Nitya Streak
            </p>
            <p className="text-xs font-mono font-bold text-[#F5EFEB]">
              {stats.streak} Days
            </p>
          </div>
        </div>

        {/* Mastery Points */}
        <div className="flex items-center gap-2 bg-[#24211A] border border-[#D4AF37]/20 rounded px-3 py-1.5">
          <div className="w-5 h-5 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[10px] font-bold text-[#D4AF37] border border-[#D4AF37]/30">
            XP
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest font-mono text-gray-400">
              Mudra Sādhana
            </p>
            <p className="text-xs font-mono font-bold text-[#D4AF37]">
              {stats.totalMasteryPoints}
            </p>
          </div>
        </div>

        {/* Database Connectivity Sync indicator */}
        <div className="flex flex-col items-end justify-center min-w-[110px]">
          <div className="flex items-center gap-1.5 text-xs text-[#F5EFEB] mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                firebaseConnected ? "bg-emerald-500 animate-pulse" : "bg-cyan-500"
              }`}
            />
            <span className="text-[11px] font-mono whitespace-nowrap">
              {firebaseConnected ? "Cloud Synced" : "Local-First"}
            </span>
          </div>
          <button
            onClick={onTriggerSync}
            disabled={syncing}
            className={`flex items-center gap-1 text-[9.5px] uppercase font-mono tracking-wider ${
              syncing ? "text-amber-500" : "text-gray-400 hover:text-[#D4AF37]"
            } transition-colors border-none bg-none outline-none cursor-pointer`}
          >
            <RefreshCw className={`w-2.5 h-2.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Manual Backup"}
          </button>
        </div>
      </div>
    </header>
  );
};

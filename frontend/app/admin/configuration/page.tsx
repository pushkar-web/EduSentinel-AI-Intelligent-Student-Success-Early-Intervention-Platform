"use client";

import React, { useMemo, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useDemoDataStore } from "@/store/useDemoDataStore";
import ModalShell from "@/components/ui/ModalShell";

const CONFIG_TABS = [
  { key: "thresholds", label: "Risk Thresholds", icon: "rule" },
  { key: "alerts", label: "Alert Rules", icon: "notifications_active" },
  { key: "interventions", label: "Intervention Catalogue", icon: "menu_book" },
  { key: "calendar", label: "Academic Calendar", icon: "calendar_today" },
] as const;

interface HardRule {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
}

interface Playbook {
  id: string;
  name: string;
  desc: string;
  active: boolean;
}

interface CalendarWindow {
  id: string;
  title: string;
  range: string;
  status: "Current Term" | "Upcoming" | "Scheduled";
}

export default function ConfigurationPage() {
  const { user, activeRole } = useAuthStore();
  const { addToast } = useUIStore();
  const { thresholds, saveThresholds } = useDemoDataStore();
  const isReadOnly = user?.role === "management" || activeRole === "management";

  const [activeTab, setActiveTab] = useState<"thresholds" | "alerts" | "interventions" | "calendar">("thresholds");

  // Non-overlapping Low / Moderate / High boundaries persisted across session reloads:
  const [highMax, setHighMax] = useState(thresholds.highMax);
  const [safeMin, setSafeMin] = useState(thresholds.safeMin);
  const [attendanceCutoff, setAttendanceCutoff] = useState(thresholds.attendanceCutoff);
  const [hardRules, setHardRules] = useState<HardRule[]>([
    { id: "hr-1", label: "Mandatory Attendance Debarment Guard", desc: "Force High Risk if cumulative attendance falls below attendance cutoff", enabled: true },
    { id: "hr-2", label: "Consecutive Assessment Failure", desc: "Escalate tier immediately when 2 core unit tests score < 40%", enabled: true },
    { id: "hr-3", label: "Extended LMS Dark Period", desc: "Flag Moderate Risk after 7 active instructional days with zero logins", enabled: false },
  ]);

  // Alert cooldown / caps / digest
  const [cooldownHours, setCooldownHours] = useState(thresholds.cooldownHours);
  const [dailyCapPerTeacher, setDailyCapPerTeacher] = useState(thresholds.dailyCapPerTeacher);
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState(thresholds.dailyDigestEnabled);
  const [alertRuleToggles, setAlertRuleToggles] = useState<Record<string, boolean>>({
    "Attendance Drop Rule": true,
    "Consecutive Homework Missing": true,
    "Sudden Exam Score Disparity": true,
    "Extended LMS Inactivity": true,
  });

  // Catalogue
  const [playbooks, setPlaybooks] = useState<Playbook[]>([
    { id: "pb-1", name: "1-on-1 Academic Tutoring", desc: "Bi-weekly 30-min remedial coaching with subject faculty", active: true },
    { id: "pb-2", name: "Peer Study Pairing", desc: "Matches at-risk student with high-achieving senior peer tutor", active: true },
    { id: "pb-3", name: "Attendance Accountability Contract", desc: "Daily check-in and automated SMS guardian notification", active: true },
    { id: "pb-4", name: "Counselor Wellbeing Consult", desc: "Explores non-academic personal or wellness challenges", active: true },
  ]);
  const [addPlaybookOpen, setAddPlaybookOpen] = useState(false);
  const [pbName, setPbName] = useState("");
  const [pbDesc, setPbDesc] = useState("");

  // Academic Calendar
  const [calendarWindows, setCalendarWindows] = useState<CalendarWindow[]>([
    { id: "cal-1", title: "Term 2 Instruction Window", range: "Nov 1, 2026 – Dec 31, 2026", status: "Current Term" },
    { id: "cal-2", title: "Mid-Term Assessment Cycle", range: "Nov 25, 2026 – Nov 30, 2026", status: "Upcoming" },
  ]);
  const [addCalOpen, setAddCalOpen] = useState(false);
  const [calTitle, setCalTitle] = useState("");
  const [calRange, setCalRange] = useState("");

  const [showPreviewDrawer, setShowPreviewDrawer] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Enforce non-overlapping range invariant (minimum 5% gap between highMax and safeMin)
  const updateHighMax = (val: number) => {
    setHighMax(val);
    if (safeMin < val + 5) setSafeMin(Math.min(90, val + 5));
  };
  const updateSafeMin = (val: number) => {
    setSafeMin(val);
    if (highMax > val - 5) setHighMax(Math.max(40, val - 5));
  };

  // Computed What-If cohort shift directly driven by sliders + enabled hard rules
  const whatIfMetrics = useMemo(() => {
    const baselineHigh = 412;
    const baselineMod = 976;
    const enabledRulesCount = hardRules.filter((r) => r.enabled).length;
    const highDelta = Math.round((highMax - 60) * 9 + (attendanceCutoff - 75) * 7 + (enabledRulesCount - 2) * 18);
    const modDelta = Math.round((safeMin - 75) * 14 - highDelta * 0.35);
    const simulatedHigh = Math.max(120, baselineHigh + highDelta);
    const simulatedMod = Math.max(200, baselineMod + modDelta);
    const simulatedLow = Math.max(1500, 4892 - simulatedHigh - simulatedMod);
    const fpChange = ((highDelta + (attendanceCutoff - 75) * 4) * 0.14).toFixed(1);
    return {
      baselineHigh,
      simulatedHigh,
      highDelta,
      simulatedMod,
      simulatedLow,
      fpChange,
    };
  }, [highMax, safeMin, attendanceCutoff, hardRules]);

  const handleSave = () => {
    if (isReadOnly) {
      addToast({ title: "Restricted", message: "Management persona cannot modify policy settings.", type: "warning" });
      return;
    }
    saveThresholds({
      highMax,
      safeMin,
      attendanceCutoff,
      cooldownHours,
      dailyCapPerTeacher,
      dailyDigestEnabled,
    });
    setShowConfirmModal(false);
    addToast({ title: "Policies Saved", message: "Non-overlapping thresholds and alert rules persisted for this session.", type: "success" });
  };

  return (
    <div className="text-[#181D26] pb-8">
      <div className="space-y-8">
        {isReadOnly && (
          <div className="bg-[#FFF9E5] border border-[#F4D35E]/50 rounded-[20px] p-4 flex items-center justify-between text-[#D9A441]">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">lock</span>
              <span className="text-[13px] font-semibold text-[#181D26]">
                Read-Only Mode Active (Executive Management / Dean Persona)
              </span>
            </div>
            <span className="text-[12px] text-[#666D7A]">Threshold calibration, rules &amp; calendar edits are locked</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666D7A] uppercase tracking-wider mb-1">
              <span>Admin Portal</span>
              <span>/</span>
              <span className="text-[#181D26]">System Policies</span>
            </div>
            <h1 className="text-[34px] sm:text-[38px] font-normal tracking-[-0.025em] text-[#181D26] leading-tight">
              Configuration &amp; Policy
            </h1>
            <p className="text-[14px] text-[#666D7A] mt-1">
              Calibrate non-overlapping risk boundaries, hard escalation rules, alert fatigue caps, and academic calendars.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => setShowPreviewDrawer(true)}
              className="px-4 py-2.5 rounded-[14px] bg-white border border-[#E0E2E6] text-[#181D26] text-[13px] font-medium hover:bg-[#F8FAFC] cursor-pointer flex items-center gap-2"
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#1B61C9]">visibility</span>
              <span>What-If Impact ({whatIfMetrics.highDelta >= 0 ? `+${whatIfMetrics.highDelta}` : whatIfMetrics.highDelta})</span>
            </button>
            <button
              onClick={() => !isReadOnly && setShowConfirmModal(true)}
              disabled={isReadOnly}
              className={`px-5 py-2.5 rounded-[14px] text-[13px] font-medium flex items-center gap-2 ${
                isReadOnly
                  ? "bg-[#F7F8FA] text-[#666D7A] cursor-not-allowed border border-[#E0E2E6]"
                  : "bg-[#181D26] hover:bg-[#333840] text-white cursor-pointer"
              }`}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Parameters</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#F7F8FA] p-1.5 rounded-[16px] border border-[#E0E2E6] inline-flex flex-wrap items-center gap-1">
          {CONFIG_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-[12px] text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  isActive ? "bg-[#181D26] text-white shadow-sm" : "text-[#666D7A] hover:text-[#181D26] hover:bg-white/60"
                }`}
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: THRESHOLDS + HARD RULES */}
        {activeTab === "thresholds" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-7 bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#181D26]">Non-Overlapping Risk Tiers</h2>
                  <p className="text-[13px] text-[#666D7A]">Guaranteed mutually exclusive boundaries across Low, Moderate &amp; High bands</p>
                </div>
                <span className="text-[11px] font-medium text-[#0A2E0E] bg-[#F4FAF7] border border-[#A8D8C4]/60 px-2.5 py-1 rounded-full">
                  Zero Overlap Verified
                </span>
              </div>

              <div className="overflow-x-auto rounded-[16px] border border-[#E0E2E6]">
                <table className="w-full text-left text-[13px] min-w-[460px]">
                  <thead>
                    <tr className="bg-[#F7F8FA] border-b border-[#E0E2E6] text-[#666D7A] text-[12px] uppercase">
                      <th className="py-3 px-4">Risk Tier</th>
                      <th className="py-3 px-4">Score Range</th>
                      <th className="py-3 px-4">Attendance Cutoff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E2E6]">
                    <tr>
                      <td className="py-3 px-4 font-medium text-[#AA2D00]">High Risk</td>
                      <td className="py-3 px-4 font-mono font-semibold">0% – {highMax - 1}%</td>
                      <td className="py-3 px-4 font-mono">&lt; {attendanceCutoff}%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-[#D9A441]">Moderate Risk</td>
                      <td className="py-3 px-4 font-mono font-semibold">{highMax}% – {safeMin - 1}%</td>
                      <td className="py-3 px-4 font-mono">{attendanceCutoff}% – 84%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-[#0A2E0E]">Low Risk / Stable</td>
                      <td className="py-3 px-4 font-mono font-semibold">{safeMin}% – 100%</td>
                      <td className="py-3 px-4 font-mono">&gt;= 85%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-5 rounded-[18px] bg-[#F7F8FA] border border-[#E0E2E6] space-y-4">
                <div>
                  <div className="flex justify-between text-[13px] mb-1">
                    <label htmlFor="high-cutoff">High Risk Upper Boundary (&lt; {highMax}%)</label>
                    <strong className="font-mono">{highMax}%</strong>
                  </div>
                  <input
                    id="high-cutoff"
                    disabled={isReadOnly}
                    type="range"
                    min="40"
                    max="70"
                    value={highMax}
                    onChange={(e) => updateHighMax(Number(e.target.value))}
                    className="w-full accent-[#181D26] cursor-pointer disabled:opacity-50"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[13px] mb-1">
                    <label htmlFor="safe-cutoff">Low Risk Lower Boundary (&gt;= {safeMin}%)</label>
                    <strong className="font-mono">{safeMin}%</strong>
                  </div>
                  <input
                    id="safe-cutoff"
                    disabled={isReadOnly}
                    type="range"
                    min="65"
                    max="90"
                    value={safeMin}
                    onChange={(e) => updateSafeMin(Number(e.target.value))}
                    className="w-full accent-[#181D26] cursor-pointer disabled:opacity-50"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[13px] mb-1">
                    <label htmlFor="att-cutoff">Attendance Warning Cutoff (&lt; {attendanceCutoff}%)</label>
                    <strong className="font-mono">{attendanceCutoff}%</strong>
                  </div>
                  <input
                    id="att-cutoff"
                    disabled={isReadOnly}
                    type="range"
                    min="60"
                    max="85"
                    value={attendanceCutoff}
                    onChange={(e) => setAttendanceCutoff(Number(e.target.value))}
                    className="w-full accent-[#181D26] cursor-pointer disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="xl:col-span-5 bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-4">
              <h2 className="text-[18px] font-semibold text-[#181D26]">Hard Escalation Rules</h2>
              <p className="text-[13px] text-[#666D7A]">Deterministic overrides applied alongside ensemble ML predictions</p>
              <div className="space-y-3">
                {hardRules.map((hr) => (
                  <label
                    key={hr.id}
                    className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#E0E2E6] flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <span className="text-[13.5px] font-semibold block">{hr.label}</span>
                      <span className="text-[12px] text-[#666D7A]">{hr.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      checked={hr.enabled}
                      onChange={() =>
                        setHardRules((prev) =>
                          prev.map((item) => (item.id === hr.id ? { ...item, enabled: !item.enabled } : item))
                        )
                      }
                      className="mt-1 w-4 h-4 accent-[#181D26] cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALERT RULES */}
        {activeTab === "alerts" && (
          <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-[16px] bg-[#F7F8FA] border border-[#E0E2E6]">
              <div>
                <label htmlFor="cooldown" className="text-[12px] font-semibold text-[#666D7A] block mb-1">Alert Cooldown (Hours)</label>
                <input
                  id="cooldown"
                  type="number"
                  min={12}
                  max={168}
                  disabled={isReadOnly}
                  value={cooldownHours}
                  onChange={(e) => setCooldownHours(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-[10px] border border-[#E0E2E6] bg-white text-[13px] font-mono"
                />
              </div>
              <div>
                <label htmlFor="daily-cap" className="text-[12px] font-semibold text-[#666D7A] block mb-1">Daily Alert Cap / Teacher</label>
                <input
                  id="daily-cap"
                  type="number"
                  min={1}
                  max={25}
                  disabled={isReadOnly}
                  value={dailyCapPerTeacher}
                  onChange={(e) => setDailyCapPerTeacher(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-[10px] border border-[#E0E2E6] bg-white text-[13px] font-mono"
                />
              </div>
              <label className="flex items-center justify-between px-4 py-2 rounded-[10px] bg-white border border-[#E0E2E6] cursor-pointer">
                <span className="text-[13px] font-medium">Bundle Non-Critical into Daily Digest</span>
                <input
                  type="checkbox"
                  disabled={isReadOnly}
                  checked={dailyDigestEnabled}
                  onChange={(e) => setDailyDigestEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#181D26]"
                />
              </label>
            </div>

            <div className="divide-y divide-[#E0E2E6]">
              {Object.entries(alertRuleToggles).map(([rule, enabled]) => (
                <div key={rule} className="py-3.5 flex items-center justify-between gap-3">
                  <span className="text-[14px] font-semibold">{rule}</span>
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => setAlertRuleToggles((prev) => ({ ...prev, [rule]: !prev[rule] }))}
                    className={`px-3 py-1 rounded-full text-[12px] font-medium border cursor-pointer disabled:opacity-50 ${
                      enabled ? "bg-[#F4FAF7] text-[#0A2E0E] border-[#A8D8C4]" : "bg-[#F7F8FA] text-[#666D7A] border-[#E0E2E6]"
                    }`}
                  >
                    {enabled ? "Active" : "Paused"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INTERVENTION CATALOGUE */}
        {activeTab === "interventions" && (
          <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold">Intervention Catalogue</h2>
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setAddPlaybookOpen(true)}
                className="px-4 py-2 rounded-[10px] bg-[#181D26] text-white text-[12px] font-medium disabled:opacity-50 cursor-pointer"
              >
                + Add Playbook
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playbooks.map((pb) => (
                <div key={pb.id} className="p-4 rounded-[16px] border border-[#E0E2E6] bg-[#F7F8FA] flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[14px] font-semibold">{pb.name}</h3>
                    <p className="text-[12.5px] text-[#666D7A] mt-0.5">{pb.desc}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() =>
                      setPlaybooks((prev) => prev.map((x) => (x.id === pb.id ? { ...x, active: !x.active } : x)))
                    }
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 cursor-pointer disabled:opacity-50 ${
                      pb.active ? "bg-[#F4FAF7] text-[#0A2E0E] border border-[#A8D8C4]" : "bg-white text-[#666D7A] border border-[#E0E2E6]"
                    }`}
                  >
                    {pb.active ? "Enabled" : "Disabled"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ACADEMIC CALENDAR */}
        {activeTab === "calendar" && (
          <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold">Academic Calendar &amp; Milestones</h2>
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setAddCalOpen(true)}
                className="px-4 py-2 rounded-[10px] bg-[#181D26] text-white text-[12px] font-medium disabled:opacity-50 cursor-pointer"
              >
                + Add Window
              </button>
            </div>
            <div className="space-y-3">
              {calendarWindows.map((cw) => (
                <div key={cw.id} className="p-4 rounded-[16px] border border-[#E0E2E6] bg-[#F7F8FA] flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold">{cw.title}</h3>
                    <p className="text-[12px] text-[#666D7A] font-mono">{cw.range}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white border border-[#E0E2E6] text-[12px] font-medium">{cw.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live What-If Drawer */}
      {showPreviewDrawer && (
        <div className="fixed inset-0 bg-[#181D26]/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E0E2E6]">
                <h2 className="text-[18px] font-semibold">Live What-If Cohort Simulation</h2>
                <button type="button" onClick={() => setShowPreviewDrawer(false)} aria-label="Close drawer" className="p-1 rounded-full hover:bg-[#F7F8FA] cursor-pointer">
                  <span aria-hidden="true" className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-4 mt-5">
                <div className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#E0E2E6]">
                  <span className="text-[12px] text-[#666D7A]">Proposed Boundaries</span>
                  <p className="text-[15px] font-semibold font-mono mt-1">
                    High &lt; {highMax}% | Mod {highMax}–{safeMin - 1}% | Low &gt;= {safeMin}% | Att &lt; {attendanceCutoff}%
                  </p>
                </div>
                <div className="p-4 rounded-[16px] bg-[#FFF8F5] border border-[#FCAB79]/40 flex justify-between text-[13px]">
                  <span className="text-[#AA2D00] font-medium">Simulated High-Risk Cohort:</span>
                  <strong className="text-[#AA2D00] font-mono">
                    {whatIfMetrics.simulatedHigh} ({whatIfMetrics.highDelta >= 0 ? `+${whatIfMetrics.highDelta}` : whatIfMetrics.highDelta} vs {whatIfMetrics.baselineHigh})
                  </strong>
                </div>
                <div className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#E0E2E6] flex justify-between text-[13px]">
                  <span className="text-[#666D7A]">Simulated Moderate Cohort:</span>
                  <strong className="font-mono">{whatIfMetrics.simulatedMod} students</strong>
                </div>
                <div className="p-4 rounded-[16px] bg-[#F4FAF7] border border-[#A8D8C4]/50 flex justify-between text-[13px]">
                  <span className="text-[#0A2E0E]">Simulated Low / Stable:</span>
                  <strong className="font-mono text-[#0A2E0E]">{whatIfMetrics.simulatedLow} students</strong>
                </div>
                <p className="text-[12px] text-[#666D7A]">
                  Estimated False-Alert shift: <strong className="font-mono text-[#181D26]">{Number(whatIfMetrics.fpChange) >= 0 ? `+${whatIfMetrics.fpChange}%` : `${whatIfMetrics.fpChange}%`}</strong>
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setShowPreviewDrawer(false)} className="w-full py-2.5 rounded-[14px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">
              Close Preview
            </button>
          </div>
        </div>
      )}

      <ModalShell open={showConfirmModal} title="Confirm Threshold Changes" onClose={() => setShowConfirmModal(false)}>
        <p className="text-[13px] text-[#333840] mb-4">
          Apply High &lt; {highMax}%, Moderate {highMax}–{safeMin - 1}%, Low &gt;= {safeMin}% across institutional scoring?
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setShowConfirmModal(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">Cancel</button>
          <button type="button" onClick={handleSave} className="px-5 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">Confirm &amp; Apply</button>
        </div>
      </ModalShell>

      <ModalShell open={addPlaybookOpen} title="Add Intervention Playbook" onClose={() => setAddPlaybookOpen(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!pbName.trim()) return;
            setPlaybooks((prev) => [...prev, { id: `pb-${Date.now()}`, name: pbName.trim(), desc: pbDesc.trim() || "Standard intervention template", active: true }]);
            setPbName("");
            setPbDesc("");
            setAddPlaybookOpen(false);
            addToast({ title: "Playbook Added", type: "success" });
          }}
          className="space-y-3"
        >
          <input required value={pbName} onChange={(e) => setPbName(e.target.value)} placeholder="Playbook title" className="w-full h-10 px-3 rounded-[10px] border border-[#E0E2E6] text-[13px]" />
          <textarea rows={3} value={pbDesc} onChange={(e) => setPbDesc(e.target.value)} placeholder="Protocol details" className="w-full p-3 rounded-[10px] border border-[#E0E2E6] text-[13px]" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAddPlaybookOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">Add Playbook</button>
          </div>
        </form>
      </ModalShell>

      <ModalShell open={addCalOpen} title="Add Academic Calendar Window" onClose={() => setAddCalOpen(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!calTitle.trim() || !calRange.trim()) return;
            setCalendarWindows((prev) => [...prev, { id: `cal-${Date.now()}`, title: calTitle.trim(), range: calRange.trim(), status: "Scheduled" }]);
            setCalTitle("");
            setCalRange("");
            setAddCalOpen(false);
            addToast({ title: "Calendar Window Added", type: "success" });
          }}
          className="space-y-3"
        >
          <input required value={calTitle} onChange={(e) => setCalTitle(e.target.value)} placeholder="e.g. End-Semester Exam Window" className="w-full h-10 px-3 rounded-[10px] border border-[#E0E2E6] text-[13px]" />
          <input required value={calRange} onChange={(e) => setCalRange(e.target.value)} placeholder="e.g. Dec 10, 2026 – Dec 22, 2026" className="w-full h-10 px-3 rounded-[10px] border border-[#E0E2E6] text-[13px]" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAddCalOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer">Save Window</button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

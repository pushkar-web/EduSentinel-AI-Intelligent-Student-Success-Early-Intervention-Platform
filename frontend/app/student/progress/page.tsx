"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { useT } from "@/lib/i18n/useT";
import { ChartCard, TrendLineChart } from "@/components/charts/ChartCard";

const TERM_METRICS: Record<string, { attendance: number; completedGoals: number; totalGoals: number; studyHrs: number; masteryOffset: number }> = {
  "Term 1, 2026": { attendance: 78.4, completedGoals: 5, totalGoals: 6, studyHrs: 10.2, masteryOffset: -4.2 },
  "Term 2, 2026": { attendance: 64.5, completedGoals: 2, totalGoals: 4, studyHrs: 12.5, masteryOffset: 0 },
  "Term 3, 2026 (Upcoming)": { attendance: 85.0, completedGoals: 1, totalGoals: 4, studyHrs: 13.0, masteryOffset: 2.5 },
};

const TREND_SERIES = [
  { week: "Wk 1", Mathematics: 68, OperatingSystems: 72, Algorithms: 69 },
  { week: "Wk 2", Mathematics: 71, OperatingSystems: 74, Algorithms: 71 },
  { week: "Wk 3", Mathematics: 75, OperatingSystems: 76, Algorithms: 72 },
  { week: "Wk 4", Mathematics: 82, OperatingSystems: 78, Algorithms: 74 },
];

const ASSESSMENTS = [
  { name: "Calculus Problem Set 4: Optimization", subject: "Mathematics", score: 82, status: "Growing Strongly", date: "Nov 18, 2026" },
  { name: "Operating Systems Lab 5 Walkthrough", subject: "Operating Systems", score: 78, status: "Solid Progress", date: "Nov 14, 2026" },
  { name: "Algorithms Design Checkpoint", subject: "Algorithms", score: 74, status: "Building Momentum", date: "Nov 10, 2026" },
  { name: "Technical Reflection Essay", subject: "Communication", score: 85, status: "Signature Strength", date: "Nov 06, 2026" },
];

const TOP_STRENGTHS = [
  { area: "Structured Problem Solving", detail: "+12% gain in recent Mathematics practice modules" },
  { area: "Technical Documentation", detail: "Consistently strong rubric clarity in Communication & Studio labs" },
  { area: "Peer Collaboration", detail: "Active contributor during afternoon group lab check-ins" },
];

const FOCUS_AREAS = [
  { area: "Morning Lecture Rhythm", action: "Arrive on time for 9 AM Calculus blocks 4+ days/week" },
  { area: "Partial Derivatives Practice", action: "Complete two 20-minute guided review sets before Nov 25" },
  { area: "Weekly Study Schedule", action: "Confirm next check-in topic with Dr. Sarah Khan" },
];

const UPCOMING_DEADLINES = [
  { id: "dl-1", title: "Calculus Re-assessment Practice Quiz", due: "Nov 25, 2026", course: "Mathematics" },
  { id: "dl-2", title: "Operating Systems Lab 5 Submission", due: "Nov 27, 2026", course: "Operating Systems" },
  { id: "dl-3", title: "Algorithms Complexity Worksheet", due: "Dec 02, 2026", course: "Algorithms" },
];

export default function MyProgressPage() {
  const { addToast } = useUIStore();
  const { t } = useT();
  const [selectedTerm, setSelectedTerm] = useState("Term 2, 2026");
  const [termMenuOpen, setTermMenuOpen] = useState(false);
  const [activeSubjectFilter, setActiveSubjectFilter] = useState("ALL");

  const rawStats = TERM_METRICS[selectedTerm] ?? TERM_METRICS["Term 2, 2026"];
  const baseAssessmentAvg = ASSESSMENTS.reduce((sum, a) => sum + a.score, 0) / ASSESSMENTS.length;
  const stats = {
    ...rawStats,
    mastery: Number((baseAssessmentAvg + rawStats.masteryOffset).toFixed(1)),
  };
  const goalPct = Math.round((stats.completedGoals / stats.totalGoals) * 100);
  const attRadius = 42;
  const attCircumference = 2 * Math.PI * attRadius;
  const attStroke = (stats.attendance / 100) * attCircumference;
  const goalStroke = (goalPct / 100) * attCircumference;

  const filteredAssessments = useMemo(() => {
    if (activeSubjectFilter === "ALL") return ASSESSMENTS;
    return ASSESSMENTS.filter((a) => a.subject === activeSubjectFilter);
  }, [activeSubjectFilter]);

  const handleExportPortfolio = () => {
    const text = [
      `EduSentinel AI — Growth Portfolio (${selectedTerm})`,
      `Course Mastery: ${stats.mastery}% | Attendance: ${stats.attendance}% | Study Rhythm: ${stats.studyHrs} hrs/wk`,
      ``,
      `Assessments:`,
      ...filteredAssessments.map((a) => `- ${a.name} (${a.subject}): ${a.score}% — ${a.status}`),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edusentinel_growth_portfolio.txt";
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: "Growth Portfolio Exported", type: "success" });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAECEF] text-[#181D26] text-[12px] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#006400]" />
            Student Empowerment &amp; Growth
          </div>
          <h1 className="text-[34px] sm:text-[40px] font-normal tracking-tight text-[#181D26]">
            {t("My Learning & Growth Journey")}
          </h1>
          <p className="text-[15px] text-[#41454D]">
            Celebrate your strengths, track subject growth curves, and plan upcoming goals with supportive milestones.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <button
              onClick={() => setTermMenuOpen(!termMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-[14px] text-[#181D26] text-[13.5px] font-medium cursor-pointer border border-[#DDDDDD]"
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#666D7A]">calendar_today</span>
              <span>{selectedTerm}</span>
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#666D7A]">keyboard_arrow_down</span>
            </button>
            {termMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-[18px] shadow-xl p-2 z-20 border border-[#EAECEF]">
                {Object.keys(TERM_METRICS).map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSelectedTerm(term);
                      setTermMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-[10px] text-[13px] font-medium cursor-pointer ${
                      selectedTerm === term ? "bg-[#181D26] text-white" : "text-[#181D26] hover:bg-[#F7F8FA]"
                    }`}
                    type="button"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleExportPortfolio}
            className="w-10 h-10 bg-white rounded-full border border-[#DDDDDD] flex items-center justify-center text-[#181D26] hover:bg-[#F7F8FA] cursor-pointer"
            title="Export Growth Portfolio"
            aria-label="Export Growth Portfolio"
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[19px]">ios_share</span>
          </button>
        </div>
      </div>

      {/* Strengths Celebration Banner */}
      <div className="rounded-[22px] bg-[#0A2E0E] text-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <h2 className="text-[18px] font-medium">Celebrating Your Strengths in Mathematics &amp; Problem Solving!</h2>
          <p className="text-[13.5px] text-[#A8D8C4]">
            Your steady practice boosted Calculus fluency by +12% over recent study blocks. Keep building momentum!
          </p>
        </div>
        <Link
          href="/student/support-plan"
          className="px-5 py-2.5 rounded-[12px] bg-white text-[#0A2E0E] text-[13px] font-semibold shrink-0 self-start sm:self-auto"
        >
          View Active Support Plan →
        </Link>
      </div>

      {/* Gauges + Goals Ring Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white rounded-[20px] p-6 border border-[#EAECEF] flex items-center justify-between gap-4">
          <div>
            <span className="text-[13px] font-medium text-[#666D7A]">{t("Attendance Rhythm")}</span>
            <div className="text-[30px] font-medium font-mono mt-1">{stats.attendance}%</div>
            <span className="text-[12px] text-[#059669]">Target goal: 85%</span>
          </div>
          <svg width="96" height="96" viewBox="0 0 100 100" role="img" aria-label={`Attendance gauge ${stats.attendance}%`}>
            <circle cx="50" cy="50" r={attRadius} fill="none" stroke="#EAECEF" strokeWidth="10" />
            <circle cx="50" cy="50" r={attRadius} fill="none" stroke="#0A2E0E" strokeWidth="10" strokeDasharray={`${attStroke} ${attCircumference}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
          </svg>
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[#EAECEF] flex items-center justify-between gap-4">
          <div>
            <span className="text-[13px] font-medium text-[#666D7A]">{t("Goals Progress Ring")}</span>
            <div className="text-[30px] font-medium font-mono mt-1">{goalPct}%</div>
            <span className="text-[12px] text-[#666D7A]">{stats.completedGoals} of {stats.totalGoals} milestones</span>
          </div>
          <svg width="96" height="96" viewBox="0 0 100 100" role="img" aria-label={`Goals progress ${goalPct}%`}>
            <circle cx="50" cy="50" r={attRadius} fill="none" stroke="#EAECEF" strokeWidth="10" />
            <circle cx="50" cy="50" r={attRadius} fill="none" stroke="#181D26" strokeWidth="10" strokeDasharray={`${goalStroke} ${attCircumference}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
          </svg>
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[#EAECEF] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#666D7A]">{t("Course Mastery Avg")}</span>
          <div className="text-[32px] font-medium font-mono mt-2">{stats.mastery}%</div>
          <span className="text-[12px] text-[#059669] font-medium">Steady upward trajectory</span>
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[#EAECEF] flex flex-col justify-between">
          <span className="text-[13px] font-medium text-[#666D7A]">{t("Weekly Study Rhythm")}</span>
          <div className="text-[32px] font-medium font-mono mt-2">{stats.studyHrs} hrs</div>
          <span className="text-[12px] text-[#059669] font-medium">+2.1h vs prior week</span>
        </div>
      </div>

      {/* Subject Scores Trend Chart */}
      <ChartCard
        title="Subject Scores Trend"
        subtitle="Weekly formative score progression across active courses"
        ariaLabel="Line chart showing upward score progress across Mathematics, Operating Systems, and Algorithms"
        data={TREND_SERIES}
        filename="my_subject_score_trend"
        height={250}
      >
        <TrendLineChart
          data={TREND_SERIES}
          xKey="week"
          series={[
            { key: "Mathematics", color: "#0A2E0E" },
            { key: "OperatingSystems", label: "Operating Systems", color: "#254FAD" },
            { key: "Algorithms", color: "#D9A441" },
          ]}
          height={250}
        />
      </ChartCard>

      {/* Top 3 Strengths, Focus Areas & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#F4FAF7] rounded-[22px] p-6 border border-[#A8D8C4] space-y-3">
          <h2 className="text-[17px] font-semibold text-[#0A2E0E]">{t("Top 3 Strengths")}</h2>
          {TOP_STRENGTHS.map((s) => (
            <div key={s.area} className="p-3.5 rounded-[14px] bg-white border border-[#A8D8C4]/50">
              <p className="text-[13.5px] font-semibold text-[#181D26]">{s.area}</p>
              <p className="text-[12px] text-[#41454D] mt-0.5">{s.detail}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-3">
          <h2 className="text-[17px] font-semibold text-[#181D26]">{t("Recommended Focus Areas")}</h2>
          {FOCUS_AREAS.map((f) => (
            <div key={f.area} className="p-3.5 rounded-[14px] bg-[#F7F8FA] border border-[#EAECEF]">
              <p className="text-[13.5px] font-semibold text-[#181D26]">{f.area}</p>
              <p className="text-[12px] text-[#666D7A] mt-0.5">{f.action}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-3">
          <h2 className="text-[17px] font-semibold text-[#181D26]">{t("Upcoming Deadlines")}</h2>
          {UPCOMING_DEADLINES.map((d) => (
            <div key={d.id} className="p-3.5 rounded-[14px] bg-[#F7F8FA] border border-[#EAECEF] flex items-center justify-between gap-2">
              <div>
                <p className="text-[13.5px] font-medium text-[#181D26]">{d.title}</p>
                <span className="text-[11.5px] text-[#666D7A]">{d.course}</span>
              </div>
              <span className="font-mono text-[11.5px] font-semibold text-[#181D26] shrink-0">{d.due}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subject-Filterable Assessments */}
      <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F3F5]">
          <div>
            <h2 className="text-[18px] font-medium">Recent Formative Checkpoints</h2>
            <p className="text-[13px] text-[#666D7A]">Filter your quiz reflections by subject</p>
          </div>
          <select
            aria-label="Filter assessments by subject"
            value={activeSubjectFilter}
            onChange={(e) => setActiveSubjectFilter(e.target.value)}
            className="h-9 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]"
          >
            <option value="ALL">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Algorithms">Algorithms</option>
            <option value="Communication">Communication</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredAssessments.map((a) => (
            <div key={a.name} className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#EAECEF] flex items-center justify-between gap-3">
              <div>
                <span className="text-[14px] font-medium">{a.name}</span>
                <p className="text-[12px] text-[#666D7A]">{a.subject} • {a.date}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-[16px] font-semibold">{a.score}%</span>
                <span className="block text-[11px] font-medium text-[#059669]">{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

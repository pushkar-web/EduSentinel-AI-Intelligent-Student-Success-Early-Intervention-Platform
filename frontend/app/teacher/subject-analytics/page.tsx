"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChartCard, BarComparisonChart } from "@/components/charts/ChartCard";

interface SubjectBundle {
  avgScore: number;
  priorDelta: string;
  atRiskCount: number;
  atRiskPct: string;
  masteryIndex: number;
  onTimePct: number;
  latePct: number;
  missingPct: number;
  histogram: { band: string; students: number }[];
  topicHeatmap: { unit: string; secA: number; secB: number; priority?: string }[];
  atRiskStudents: { id: string; name: string; score: number; gap: string }[];
}

const SUBJECT_DATA: Record<string, SubjectBundle> = {
  Mathematics: {
    avgScore: 76,
    priorDelta: "+5% vs prior",
    atRiskCount: 8,
    atRiskPct: "21% of class",
    masteryIndex: 62,
    onTimePct: 88,
    latePct: 7,
    missingPct: 5,
    histogram: [
      { band: "0-20%", students: 2 },
      { band: "21-40%", students: 4 },
      { band: "41-60%", students: 8 },
      { band: "61-80%", students: 16 },
      { band: "81-100%", students: 8 },
    ],
    topicHeatmap: [
      { unit: "Linear Algebra & Vectors", secA: 84, secB: 80 },
      { unit: "Differential Calculus III", secA: 52, secB: 58, priority: "Priority Gap" },
      { unit: "Applied Probability Models", secA: 48, secB: 54, priority: "Priority Gap" },
      { unit: "Multivariable Optimization", secA: 68, secB: 72 },
    ],
    atRiskStudents: [
      { id: "STU1001", name: "Aarav Deshmukh", score: 38, gap: "Calculus III Midterm" },
      { id: "STU1003", name: "Rohan Kapoor", score: 54, gap: "Probability Exercises" },
    ],
  },
  "Operating Systems": {
    avgScore: 72,
    priorDelta: "+2% vs prior",
    atRiskCount: 6,
    atRiskPct: "16% of class",
    masteryIndex: 68,
    onTimePct: 81,
    latePct: 11,
    missingPct: 8,
    histogram: [
      { band: "0-20%", students: 1 },
      { band: "21-40%", students: 3 },
      { band: "41-60%", students: 9 },
      { band: "61-80%", students: 18 },
      { band: "81-100%", students: 7 },
    ],
    topicHeatmap: [
      { unit: "Process Scheduling & Threads", secA: 79, secB: 76 },
      { unit: "Deadlocks & Mutex Semaphores", secA: 56, secB: 60, priority: "Needs Review" },
      { unit: "Virtual Memory Paging", secA: 65, secB: 61 },
      { unit: "Kernel File Systems", secA: 74, secB: 71 },
    ],
    atRiskStudents: [
      { id: "STU1002", name: "Priya Rao", score: 42, gap: "OS Quiz 2 & Lab 4–5" },
      { id: "STU1001", name: "Aarav Deshmukh", score: 54, gap: "Concurrency Lab" },
    ],
  },
  "Data Structures": {
    avgScore: 74,
    priorDelta: "+4% vs prior",
    atRiskCount: 5,
    atRiskPct: "13% of class",
    masteryIndex: 70,
    onTimePct: 85,
    latePct: 9,
    missingPct: 6,
    histogram: [
      { band: "0-20%", students: 0 },
      { band: "21-40%", students: 3 },
      { band: "41-60%", students: 7 },
      { band: "61-80%", students: 17 },
      { band: "81-100%", students: 11 },
    ],
    topicHeatmap: [
      { unit: "Balanced Trees (AVL/RB)", secA: 64, secB: 68 },
      { unit: "Graph Traversal & Shortest Path", secA: 72, secB: 75 },
      { unit: "Dynamic Programming", secA: 55, secB: 52, priority: "Priority Gap" },
    ],
    atRiskStudents: [
      { id: "STU1003", name: "Rohan Kapoor", score: 58, gap: "Tree & DP backlog" },
      { id: "STU1004", name: "Ananya Iyer", score: 62, gap: "Algorithms Midterm" },
    ],
  },
  "Software Engineering": {
    avgScore: 84,
    priorDelta: "+7% vs prior",
    atRiskCount: 2,
    atRiskPct: "5% of class",
    masteryIndex: 82,
    onTimePct: 94,
    latePct: 4,
    missingPct: 2,
    histogram: [
      { band: "0-20%", students: 0 },
      { band: "21-40%", students: 1 },
      { band: "41-60%", students: 4 },
      { band: "61-80%", students: 16 },
      { band: "81-100%", students: 17 },
    ],
    topicHeatmap: [
      { unit: "Architecture & Design Patterns", secA: 86, secB: 84 },
      { unit: "Automated Testing & CI", secA: 82, secB: 79 },
      { unit: "Agile Sprint Delivery", secA: 89, secB: 87 },
    ],
    atRiskStudents: [
      { id: "STU1004", name: "Ananya Iyer", score: 69, gap: "Sprint documentation delay" },
    ],
  },
};

function cellColor(score: number) {
  if (score < 60) return "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]";
  if (score < 72) return "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]";
  return "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]";
}

export default function SubjectAnalyticsPage() {
  const subjects = Object.keys(SUBJECT_DATA);
  const [activeSubject, setActiveSubject] = useState(subjects[0]);
  const data = SUBJECT_DATA[activeSubject];
  const cohortTotal = data.histogram.reduce((sum, bin) => sum + bin.students, 0);
  const derivedAtRiskPct = cohortTotal > 0 ? `${Math.round((data.atRiskCount / cohortTotal) * 100)}% of ${cohortTotal}` : data.atRiskPct;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAECEF] text-[#181D26] text-[12px] font-medium">
            Curriculum Mastery Telemetry
          </div>
          <h1 className="text-[34px] sm:text-[40px] font-normal tracking-tight text-[#181D26]">
            Curriculum Competency &amp; Subject Analytics
          </h1>
          <p className="text-[15px] text-[#41454D]">
            Score histograms, topic weakness heatmaps, submission patterns, and subject-scoped at-risk rosters.
          </p>
        </div>

        <Link
          href="/teacher/class-overview"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[14px] bg-white border border-[#DDDDDD] text-[13.5px] font-medium self-start"
        >
          ← Class Overview
        </Link>
      </div>

      {/* Subject Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#EAECEF]">
        {subjects.map((subject) => (
          <button
            key={subject}
            type="button"
            onClick={() => setActiveSubject(subject)}
            className={`px-4 py-2 rounded-[12px] text-[13.5px] font-medium shrink-0 cursor-pointer ${
              activeSubject === subject ? "bg-[#181D26] text-white" : "text-[#41454D] hover:bg-[#F7F8FA]"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white rounded-[20px] p-6 border border-[#EAECEF]">
          <span className="text-[13px] font-medium text-[#666D7A]">Cohort Average Score</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-[36px] font-medium font-mono">{data.avgScore}%</span>
            <span className="text-[12px] font-semibold text-[#059669]">{data.priorDelta}</span>
          </div>
        </div>
        <div className="bg-[#FEF2F2]/60 rounded-[20px] p-6 border border-[#FECACA]">
          <span className="text-[13px] font-semibold text-[#DC2626]">Students At Risk</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-[36px] font-medium font-mono text-[#DC2626]">{data.atRiskCount}</span>
            <span className="text-[12px] text-[#DC2626]">{derivedAtRiskPct}</span>
          </div>
        </div>
        <div className="bg-white rounded-[20px] p-6 border border-[#EAECEF]">
          <span className="text-[13px] font-medium text-[#666D7A]">Topic Mastery Index</span>
          <div className="my-2 text-[36px] font-medium font-mono">{data.masteryIndex}%</div>
        </div>
        <div className="bg-[#ECFDF5]/60 rounded-[20px] p-6 border border-[#A7F3D0]">
          <span className="text-[13px] font-semibold text-[#059669]">Assignment Submission Split</span>
          <div className="my-2 text-[22px] font-semibold font-mono text-[#059669]">{data.onTimePct}% On-Time</div>
          <span className="text-[12px] text-[#333840]">Late {data.latePct}% • Missing {data.missingPct}%</span>
        </div>
      </div>

      {/* Histogram + Topic Weakness Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <ChartCard
            title={`Score Histogram — ${activeSubject}`}
            subtitle="Student distribution across 20-point intervals"
            ariaLabel={`Bar histogram of scores in ${activeSubject}`}
            data={data.histogram}
            filename={`${activeSubject.toLowerCase().replace(/\s+/g, "_")}_histogram`}
            height={250}
          >
            <BarComparisonChart
              data={data.histogram}
              xKey="band"
              series={[{ key: "students", label: "Students", color: "#181D26" }]}
              height={250}
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-6 bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-4">
          <div>
            <h2 className="text-[18px] font-medium">Topic Weakness Heatmap (Unit × Division)</h2>
            <p className="text-[13px] text-[#666D7A]">Module mastery percentages across Section A &amp; Section B</p>
          </div>
          <table className="w-full text-left text-[13px] border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[11px] uppercase text-[#666D7A]">
                <th className="py-1 px-2">Module</th>
                <th className="py-1 px-2 text-center">Sec A</th>
                <th className="py-1 px-2 text-center">Sec B</th>
              </tr>
            </thead>
            <tbody>
              {data.topicHeatmap.map((t) => (
                <tr key={t.unit}>
                  <td className="py-2 px-2 font-medium">
                    {t.unit}
                    {t.priority && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF2F2] text-[#DC2626]">
                        {t.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-1 text-center">
                    <span className={`inline-block w-16 py-1 rounded-[8px] border font-mono text-[12px] font-semibold ${cellColor(t.secA)}`}>
                      {t.secA}%
                    </span>
                  </td>
                  <td className="px-1 text-center">
                    <span className={`inline-block w-16 py-1 rounded-[8px] border font-mono text-[12px] font-semibold ${cellColor(t.secB)}`}>
                      {t.secB}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject-Scoped At-Risk Roster */}
      <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold">Subject-Scoped At-Risk Students ({activeSubject})</h2>
          <Link href="/teacher/interventions" className="text-[13px] font-medium text-[#1B61C9] hover:underline">
            Prescribe Support →
          </Link>
        </div>
        <div className="divide-y divide-[#EAECEF]">
          {data.atRiskStudents.map((st) => (
            <div key={st.id} className="py-3 flex items-center justify-between gap-3 text-[13px]">
              <div>
                <Link href={`/teacher/students/${st.id}`} className="font-semibold hover:underline">
                  {st.name}
                </Link>
                <span className="ml-2 font-mono text-[11px] text-[#666D7A]">{st.id}</span>
                <p className="text-[12px] text-[#666D7A]">{st.gap}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-[#DC2626]">{st.score}%</span>
                <Link href={`/teacher/students/${st.id}`} className="px-3 py-1 rounded-[8px] border border-[#DDDDDD] text-[12px]">
                  Student 360
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

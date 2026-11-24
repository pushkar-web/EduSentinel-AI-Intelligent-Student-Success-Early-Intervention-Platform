"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import ModalShell from "@/components/ui/ModalShell";
import { ChartCard, TrendLineChart } from "@/components/charts/ChartCard";

interface ConfusionMatrix {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

interface ModelVersionSeed {
  version: string;
  name: string;
  status: "Active" | "Candidate" | "Archived";
  deployedDate: string;
  prAuc: number;
  brier: number;
  ece: number;
  dataDrift: number;
  fairnessIndex: number;
  trainingSamples: number;
  algorithm: string;
  confusion: ConfusionMatrix;
  topShap: { feature: string; impact: number }[];
}

interface ModelVersionData extends ModelVersionSeed {
  precision: number;
  recall: number;
  f1: number;
  falseAlertRate: string;
}

function enrichModelMetrics(seed: ModelVersionSeed): ModelVersionData {
  const { tp, fp, fn } = seed.confusion;
  const precision = tp + fp > 0 ? Number((tp / (tp + fp)).toFixed(3)) : 0;
  const recall = tp + fn > 0 ? Number((tp / (tp + fn)).toFixed(3)) : 0;
  const f1 = 2 * tp + fp + fn > 0 ? Number(((2 * tp) / (2 * tp + fp + fn)).toFixed(3)) : 0;
  const falseDiscoveryPct = tp + fp > 0 ? ((fp / (tp + fp)) * 100).toFixed(1) : "0.0";
  return {
    ...seed,
    precision,
    recall,
    f1,
    falseAlertRate: `${falseDiscoveryPct}%`,
  };
}

const INITIAL_MODEL_SEEDS: ModelVersionSeed[] = [
  {
    version: "v2.4.1",
    name: "EduSentinel-v2.4.1 (LightGBM)",
    status: "Active",
    deployedDate: "Oct 28, 2026",
    prAuc: 0.874,
    brier: 0.091,
    ece: 0.034,
    dataDrift: 0.04,
    fairnessIndex: 0.03,
    trainingSamples: 14200,
    algorithm: "LightGBM Calibrated Ensemble",
    // tp + fn = 412 at-risk; fp + tn = 4480 good standing; total = 4892 (exact match to Institution KPIs)
    confusion: { tp: 363, fp: 36, fn: 49, tn: 4444 },
    topShap: [
      { feature: "Trailing 30-Day Attendance Rate", impact: 0.31 },
      { feature: "Internal Assessment Score Delta", impact: 0.27 },
      { feature: "LMS Assignment Submission Tardiness", impact: 0.16 },
      { feature: "Consecutive Lab Absences", impact: 0.14 },
    ],
  },
  {
    version: "v2.5.0-rc1",
    name: "EduSentinel-v2.5.0-rc1 (Candidate)",
    status: "Candidate",
    deployedDate: "Staging (Nov 18, 2026)",
    prAuc: 0.889,
    brier: 0.084,
    ece: 0.027,
    dataDrift: 0.03,
    fairnessIndex: 0.02,
    trainingSamples: 18900,
    algorithm: "LightGBM + Isotonic Calibration",
    confusion: { tp: 371, fp: 30, fn: 41, tn: 4450 },
    topShap: [
      { feature: "Trailing 30-Day Attendance Rate", impact: 0.29 },
      { feature: "Internal Assessment Score Delta", impact: 0.28 },
      { feature: "LMS Login Recency Gap", impact: 0.18 },
      { feature: "Historical Term GPA Slope", impact: 0.13 },
    ],
  },
  {
    version: "v2.3.0",
    name: "EduSentinel-v2.3.0 (XGBoost)",
    status: "Archived",
    deployedDate: "Aug 12, 2026",
    prAuc: 0.842,
    brier: 0.108,
    ece: 0.049,
    dataDrift: 0.09,
    fairnessIndex: 0.05,
    trainingSamples: 12000,
    algorithm: "XGBoost Classifier",
    confusion: { tp: 350, fp: 45, fn: 62, tn: 4435 },
    topShap: [
      { feature: "Trailing 30-Day Attendance Rate", impact: 0.33 },
      { feature: "Internal Assessment Score Delta", impact: 0.24 },
      { feature: "LMS Submission Count", impact: 0.15 },
      { feature: "Prior Semester Backlogs", impact: 0.12 },
    ],
  },
];

const INITIAL_MODELS: ModelVersionData[] = INITIAL_MODEL_SEEDS.map(enrichModelMetrics);

const PERF_TREND = [
  { month: "Jun", prAuc: 0.82, f1: 0.85, precision: 0.87, recall: 0.83 },
  { month: "Jul", prAuc: 0.83, f1: 0.86, precision: 0.88, recall: 0.84 },
  { month: "Aug", prAuc: 0.842, f1: 0.867, precision: 0.886, recall: 0.85 },
  { month: "Sep", prAuc: 0.858, f1: 0.882, precision: 0.898, recall: 0.867 },
  { month: "Oct", prAuc: 0.874, f1: 0.895, precision: 0.91, recall: 0.881 },
  { month: "Nov", prAuc: 0.889, f1: 0.913, precision: 0.925, recall: 0.9 },
];

export default function ModelMonitorPage() {
  const { user, activeRole } = useAuthStore();
  const { addToast } = useUIStore();
  const isReadOnly = user?.role === "management" || activeRole === "management";

  const [models, setModels] = useState<ModelVersionData[]>(INITIAL_MODELS);
  const [selectedVersionKey, setSelectedVersionKey] = useState<string>("v2.4.1");
  const [retrainModalOpen, setRetrainModalOpen] = useState(false);
  const [epochs, setEpochs] = useState("100");
  const [learningRate, setLearningRate] = useState("0.05");
  const [isRetraining, setIsRetraining] = useState(false);
  const [inspectDrawerOpen, setInspectDrawerOpen] = useState(false);
  const [inspectedVersionKey, setInspectedVersionKey] = useState<string>("v2.4.1");

  const currentModel = models.find((m) => m.version === selectedVersionKey) ?? models[0];
  const inspectedModel = models.find((m) => m.version === inspectedVersionKey) ?? currentModel;

  const handleStartRetraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      addToast({ title: "Action Restricted", message: "Model retraining is disabled in Management Read-Only mode.", type: "warning" });
      return;
    }
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      setRetrainModalOpen(false);
      addToast({
        title: "Training Job Initiated",
        message: `Retraining job #TRN-8821 queued (${epochs} epochs, LR ${learningRate}).`,
        type: "success",
      });
    }, 800);
  };

  const handlePromoteToProduction = (ver: ModelVersionData) => {
    if (isReadOnly) {
      addToast({ title: "Action Restricted", message: "Promotion is restricted in Executive Read-Only mode.", type: "warning" });
      return;
    }
    setModels((prev) =>
      prev.map((m) => {
        if (m.version === ver.version) return { ...m, status: "Active", deployedDate: "Today (Promoted)" };
        if (m.status === "Active") return { ...m, status: "Archived" };
        return m;
      })
    );
    setSelectedVersionKey(ver.version);
    setInspectDrawerOpen(false);
    addToast({
      title: "Model Promoted to Production",
      message: `${ver.version} is now Active; previous production model moved to Archived.`,
      type: "success",
    });
  };

  return (
    <div className="text-[#181D26] pb-8">
      <div className="space-y-8">
        {isReadOnly && (
          <div className="bg-[#FFF9E5] border border-[#F4D35E]/50 rounded-[20px] p-4 flex items-center justify-between text-[#D9A441]">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">visibility</span>
              <span className="text-[13px] font-semibold text-[#181D26]">
                Executive Governance Mode (Read-Only)
              </span>
            </div>
            <span className="text-[12px] text-[#666D7A]">Model retraining &amp; promotion controls are disabled</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666D7A] uppercase tracking-wider mb-1">
              <span>Admin Portal</span>
              <span>/</span>
              <span className="text-[#181D26]">ML Diagnostics</span>
            </div>
            <h1 className="text-[34px] sm:text-[38px] font-normal tracking-[-0.025em] text-[#181D26] leading-tight">
              Model Monitor
            </h1>
            <p className="text-[14px] text-[#666D7A] mt-1">
              PR-AUC, Brier/ECE calibration error, Global SHAP feature importance, confusion matrices &amp; lineage promotion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Select model version"
              value={selectedVersionKey}
              onChange={(e) => setSelectedVersionKey(e.target.value)}
              className="h-11 px-4 rounded-[14px] bg-white border border-[#E0E2E6] text-[13px] font-semibold cursor-pointer"
            >
              {models.map((m) => (
                <option key={m.version} value={m.version}>
                  {m.version} — {m.status}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setRetrainModalOpen(true)}
              disabled={isReadOnly}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#181D26] hover:bg-[#333840] text-white text-[13px] font-medium cursor-pointer disabled:opacity-50"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">autorenew</span>
              <span>Request Retraining</span>
            </button>
          </div>
        </div>

        {/* 6 Calibration & Performance Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-[20px] p-4 border border-[#E0E2E6]">
            <span className="text-[12px] font-medium text-[#666D7A]">PR-AUC</span>
            <div className="text-[28px] font-semibold font-mono mt-2">{currentModel.prAuc.toFixed(3)}</div>
            <span className="text-[11px] text-[#0A2E0E]">Imbalanced precision</span>
          </div>
          <div className="bg-white rounded-[20px] p-4 border border-[#E0E2E6]">
            <span className="text-[12px] font-medium text-[#666D7A]">Brier Score</span>
            <div className="text-[28px] font-semibold font-mono mt-2">{currentModel.brier.toFixed(3)}</div>
            <span className="text-[11px] text-[#0A2E0E]">Probability calibration</span>
          </div>
          <div className="bg-white rounded-[20px] p-4 border border-[#E0E2E6]">
            <span className="text-[12px] font-medium text-[#666D7A]">ECE Error</span>
            <div className="text-[28px] font-semibold font-mono mt-2">{currentModel.ece.toFixed(3)}</div>
            <span className="text-[11px] text-[#0A2E0E]">Target &lt; 0.050</span>
          </div>
          <div className="bg-[#F4FAF7] rounded-[20px] p-4 border border-[#A8D8C4]/50">
            <span className="text-[12px] font-medium text-[#0A2E0E]">F1 / Precision / Recall</span>
            <div className="text-[24px] font-semibold font-mono text-[#0A2E0E] mt-2">{currentModel.f1.toFixed(3)}</div>
            <span className="text-[11px] text-[#0A2E0E]">
              P {currentModel.precision.toFixed(2)} • R {currentModel.recall.toFixed(2)}
            </span>
          </div>
          <div className="bg-[#FFF8F5] rounded-[20px] p-4 border border-[#FCAB79]/40">
            <span className="text-[12px] font-medium text-[#AA2D00]">False Alert Rate</span>
            <div className="text-[28px] font-semibold font-mono text-[#AA2D00] mt-2">{currentModel.falseAlertRate}</div>
            <span className="text-[11px] text-[#AA2D00]">Alert fatigue check</span>
          </div>
          <div className="bg-white rounded-[20px] p-4 border border-[#E0E2E6]">
            <span className="text-[12px] font-medium text-[#666D7A]">Data Drift (PSI)</span>
            <div className="text-[28px] font-semibold font-mono mt-2">{currentModel.dataDrift.toFixed(2)}</div>
            <span className="text-[11px] text-[#0A2E0E]">Fairness {currentModel.fairnessIndex.toFixed(2)}</span>
          </div>
        </div>

        {/* Performance Trend Chart + Global SHAP Feature Importance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ChartCard
              title="Model Calibration & Accuracy Trend"
              subtitle="Monthly PR-AUC, F1, Precision & Recall trajectory"
              ariaLabel="Line chart comparing monthly PR-AUC, F1, precision, and recall"
              data={PERF_TREND}
              filename="model_performance_trend"
              height={260}
            >
              <TrendLineChart
                data={PERF_TREND}
                xKey="month"
                series={[
                  { key: "prAuc", label: "PR-AUC", color: "#AA2D00" },
                  { key: "f1", label: "F1", color: "#0A2E0E" },
                  { key: "precision", label: "Precision", color: "#181D26" },
                  { key: "recall", label: "Recall", color: "#254FAD" },
                ]}
                height={260}
              />
            </ChartCard>
          </div>

          <div className="lg:col-span-5 bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-semibold">Global SHAP Feature Importance</h2>
                <p className="text-[12.5px] text-[#666D7A]">Top predictive drivers for {currentModel.version}</p>
              </div>
              <Link href="/admin/reports?tab=model" className="text-[12px] font-medium text-[#1B61C9] hover:underline">
                Full Report →
              </Link>
            </div>
            <div className="space-y-3">
              {currentModel.topShap.map((item) => (
                <div key={item.feature} className="space-y-1">
                  <div className="flex justify-between text-[12.5px]">
                    <span className="font-medium text-[#181D26]">{item.feature}</span>
                    <span className="font-mono font-semibold text-[#AA2D00]">+{item.impact.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#F7F8FA] overflow-hidden">
                    <div className="h-full bg-[#181D26] rounded-full" style={{ width: `${Math.min(100, item.impact * 280)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registry Table */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E0E2E6] space-y-4">
          <h2 className="text-[18px] font-semibold">Model Registry &amp; Lineage Promotion</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] min-w-[700px]">
              <thead>
                <tr className="border-b border-[#E0E2E6] text-[12px] font-medium text-[#666D7A] uppercase">
                  <th className="py-2.5 px-4">Version</th>
                  <th className="py-2.5 px-4">Algorithm</th>
                  <th className="py-2.5 px-4">PR-AUC</th>
                  <th className="py-2.5 px-4">ECE</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E2E6]">
                {models.map((ver) => (
                  <tr key={ver.version} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-mono font-semibold">{ver.version}</td>
                    <td className="py-3 px-4">{ver.algorithm}</td>
                    <td className="py-3 px-4 font-mono">{ver.prAuc.toFixed(3)}</td>
                    <td className="py-3 px-4 font-mono">{ver.ece.toFixed(3)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          ver.status === "Active"
                            ? "bg-[#F4FAF7] text-[#0A2E0E] border border-[#A8D8C4]"
                            : ver.status === "Candidate"
                            ? "bg-[#FFF9E5] text-[#D9A441] border border-[#F4D35E]"
                            : "bg-[#F7F8FA] text-[#666D7A] border border-[#E0E2E6]"
                        }`}
                      >
                        {ver.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectedVersionKey(ver.version);
                          setInspectDrawerOpen(true);
                        }}
                        className="px-3 py-1 rounded-[10px] border border-[#E0E2E6] text-[12px] font-medium hover:bg-[#F7F8FA] cursor-pointer"
                      >
                        Inspect Matrix
                      </button>
                      {ver.status !== "Active" && (
                        <button
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => handlePromoteToProduction(ver)}
                          className="px-3 py-1 rounded-[10px] bg-[#181D26] text-white text-[12px] font-medium disabled:opacity-50 cursor-pointer"
                        >
                          Promote to Production
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalShell open={retrainModalOpen} title="Request Model Retraining" onClose={() => setRetrainModalOpen(false)}>
        <form onSubmit={handleStartRetraining} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold block mb-1">Epochs</label>
              <input type="number" value={epochs} onChange={(e) => setEpochs(e.target.value)} className="w-full h-10 px-3 rounded-[10px] border border-[#E0E2E6]" />
            </div>
            <div>
              <label className="text-[12px] font-semibold block mb-1">Learning Rate</label>
              <input type="text" value={learningRate} onChange={(e) => setLearningRate(e.target.value)} className="w-full h-10 px-3 rounded-[10px] border border-[#E0E2E6]" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRetrainModalOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">Cancel</button>
            <button type="submit" disabled={isRetraining} className="px-5 py-2 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer disabled:opacity-50">
              {isRetraining ? "Starting..." : "Launch Retraining"}
            </button>
          </div>
        </form>
      </ModalShell>

      {inspectDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#181D26]/40 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E0E2E6]">
                <div>
                  <h2 className="text-[18px] font-semibold">{inspectedModel.name}</h2>
                  <span className="text-[12px] text-[#666D7A] font-mono">{inspectedModel.deployedDate}</span>
                </div>
                <button type="button" onClick={() => setInspectDrawerOpen(false)} aria-label="Close drawer" className="p-1 rounded-full hover:bg-[#F7F8FA] cursor-pointer">
                  <span aria-hidden="true" className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#666D7A] block mb-2">
                  Version-Specific Confusion Matrix ({inspectedModel.version})
                </span>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-[#F4FAF7] p-3.5 rounded-[14px] border border-[#A8D8C4]">
                    <span className="text-[11px] text-[#666D7A] block">True Positives</span>
                    <span className="text-[24px] font-mono font-semibold text-[#0A2E0E]">{inspectedModel.confusion.tp}</span>
                  </div>
                  <div className="bg-[#FFF8F5] p-3.5 rounded-[14px] border border-[#FCAB79]/50">
                    <span className="text-[11px] text-[#666D7A] block">False Positives</span>
                    <span className="text-[24px] font-mono font-semibold text-[#AA2D00]">{inspectedModel.confusion.fp}</span>
                  </div>
                  <div className="bg-[#FFF8F5] p-3.5 rounded-[14px] border border-[#FCAB79]/50">
                    <span className="text-[11px] text-[#666D7A] block">False Negatives</span>
                    <span className="text-[24px] font-mono font-semibold text-[#AA2D00]">{inspectedModel.confusion.fn}</span>
                  </div>
                  <div className="bg-[#F4FAF7] p-3.5 rounded-[14px] border border-[#A8D8C4]">
                    <span className="text-[11px] text-[#666D7A] block">True Negatives</span>
                    <span className="text-[24px] font-mono font-semibold text-[#0A2E0E]">{inspectedModel.confusion.tn}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E0E2E6] flex justify-between">
              <button type="button" onClick={() => setInspectDrawerOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">
                Close
              </button>
              {inspectedModel.status !== "Active" && (
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => handlePromoteToProduction(inspectedModel)}
                  className="px-5 py-2.5 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium disabled:opacity-50 cursor-pointer"
                >
                  Promote to Production
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import ModalShell from "@/components/ui/ModalShell";

export default function StudentPrivacyPage() {
  const { user, hasAcknowledgedConsent, setConsentAcknowledged } = useAuthStore();
  const { addToast } = useUIStore();

  const [allowAiPredictive, setAllowAiPredictive] = useState(true);
  const [allowMentorSharing, setAllowMentorSharing] = useState(true);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionField, setCorrectionField] = useState("Attendance Record");
  const [correctionReason, setCorrectionReason] = useState("");
  const [auditEvents, setAuditEvents] = useState([
    { time: "Nov 14, 2026 • 10:08 AM", action: "Initial consent terms acknowledged" },
    { time: "Nov 15, 2026 • 09:30 AM", action: "Weekly study insights calculated (no disciplinary scoring)" },
  ]);

  const appendAudit = (action: string) => {
    setAuditEvents((prev) => [{ time: "Just now", action }, ...prev]);
  };

  const handleToggleAi = (checked: boolean) => {
    setAllowAiPredictive(checked);
    setConsentAcknowledged();
    appendAudit(checked ? "Enabled Early Study Support Forecasts" : "Paused Early Study Support Forecasts");
    addToast({ title: checked ? "AI Study Forecasts Enabled" : "AI Study Forecasts Paused", type: "success" });
  };

  const handleToggleMentor = (checked: boolean) => {
    setAllowMentorSharing(checked);
    setConsentAcknowledged();
    appendAudit(checked ? "Enabled Mentor Support Plan Sharing" : "Restricted Mentor Support Plan Sharing");
    addToast({ title: checked ? "Mentor Sharing Enabled" : "Mentor Sharing Restricted", type: "success" });
  };

  const handleExportData = () => {
    const payload = {
      studentId: user.id,
      name: user.name,
      consentAcknowledged: hasAcknowledgedConsent,
      preferences: { allowAiPredictive, allowMentorSharing },
      recentAuditPreview: auditEvents,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edusentinel_student_data_${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    appendAudit(`Exported personal JSON archive (${user.id})`);
    addToast({ title: "Downloaded Privacy Archive (JSON)", type: "success" });
  };

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionReason.trim()) return;
    setShowCorrectionModal(false);
    appendAudit(`Submitted rectification request for ${correctionField}`);
    setCorrectionReason("");
    addToast({ title: "Correction Request Submitted", message: `Case #REQ-2026-44 for ${correctionField}.`, type: "success" });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAECEF] text-[#181D26] text-[12px] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#006400]" />
            Student Rights &amp; Data Governance
          </div>
          <h1 className="text-[34px] sm:text-[40px] font-normal tracking-tight text-[#181D26]">
            Privacy, Transparency &amp; Data Agency
          </h1>
          <p className="text-[15px] text-[#41454D]">
            Control how your learning data is used, inspect consent audit history, or request record corrections anytime.
          </p>
        </div>
        <button
          onClick={handleExportData}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[14px] bg-white border border-[#DDDDDD] text-[13.5px] font-medium hover:bg-[#F7F8FA] cursor-pointer self-start"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">download</span>
          <span>Download My Data (JSON)</span>
        </button>
      </div>

      {/* Consent Controls + Dispute */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F5]">
            <div>
              <h2 className="text-[18px] font-medium">Active Consent Controls</h2>
              <p className="text-[13px] text-[#666D7A]">Changes sync directly to your session consent record</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#0A2E0E] border border-[#A7F3D0]">
              {hasAcknowledgedConsent ? "Acknowledged" : "Pending Confirmation"}
            </span>
          </div>

          <label className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#EAECEF] flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-[14px] font-medium">Early Study Support Insights</p>
              <p className="text-[12.5px] text-[#41454D]">Allow learning analytics to highlight helpful tutoring milestones.</p>
            </div>
            <input type="checkbox" checked={allowAiPredictive} onChange={(e) => handleToggleAi(e.target.checked)} className="w-5 h-5 mt-1 accent-[#181D26]" />
          </label>

          <label className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#EAECEF] flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-[14px] font-medium">Mentor Support Plan Sharing</p>
              <p className="text-[12.5px] text-[#41454D]">Share active study milestones with your assigned mentor Dr. Sarah Khan.</p>
            </div>
            <input type="checkbox" checked={allowMentorSharing} onChange={(e) => handleToggleMentor(e.target.checked)} className="w-5 h-5 mt-1 accent-[#181D26]" />
          </label>
        </div>

        <div className="lg:col-span-5 bg-[#F5E9D4]/40 rounded-[22px] p-6 border border-[#F5E9D4] flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-[17px] font-medium">Dispute or Correct Record</h3>
            <p className="text-[13px] text-[#41454D] mt-1">
              Spot an attendance slip or missing score? Request an academic registrar review in one click.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCorrectionModal(true)}
            className="px-5 py-2.5 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium cursor-pointer self-start"
          >
            Request Data Correction
          </button>
        </div>
      </div>

      {/* Live Audit Trail Preview */}
      <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-3">
        <h2 className="text-[17px] font-semibold">My Consent &amp; Access Audit Preview</h2>
        <div className="divide-y divide-[#EAECEF] text-[13px]">
          {auditEvents.map((ev, i) => (
            <div key={i} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-medium text-[#181D26]">{ev.action}</span>
              <span className="font-mono text-[12px] text-[#666D7A]">{ev.time}</span>
            </div>
          ))}
        </div>
      </div>

      <ModalShell open={showCorrectionModal} title="Request Data Correction" onClose={() => setShowCorrectionModal(false)}>
        <form onSubmit={handleCorrectionSubmit} className="space-y-4">
          <select value={correctionField} onChange={(e) => setCorrectionField(e.target.value)} className="w-full h-10 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]">
            <option value="Attendance Record">Attendance Record</option>
            <option value="Assessment Grade">Assessment Score</option>
            <option value="LMS Activity Log">LMS Activity Log</option>
          </select>
          <textarea rows={3} required value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} placeholder="Describe discrepancy..." className="w-full p-3 rounded-[10px] border border-[#DDDDDD] text-[13px]" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCorrectionModal(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-[10px] bg-[#181D26] text-white text-[13px] cursor-pointer">Submit Request</button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

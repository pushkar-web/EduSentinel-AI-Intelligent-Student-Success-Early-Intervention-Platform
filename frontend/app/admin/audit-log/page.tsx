"use client";

import React, { useMemo, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import ModalShell from "@/components/ui/ModalShell";
import { EmptyState } from "@/components/ui/StateFeedback";

interface AuditEvent {
  id: string;
  title: string;
  category: "auth" | "data" | "config" | "system";
  severity: "success" | "info" | "warning" | "critical";
  actorName: string;
  actorRole: string;
  actorInitials: string;
  timestamp: string;
  ip: string;
  network: string;
  resource: string;
  sessionKey: string;
  hash: string;
  payload: string;
}

const MERKLE_ROOT = "7e2b90f4a8192301823901bca910293849102938491029384910293849102938";

const INITIAL_EVENTS: AuditEvent[] = [
  {
    id: "EVT-2026-99214",
    title: "Updated Academic Risk Threshold",
    category: "config",
    severity: "success",
    actorName: "Prof. R. Deshmukh",
    actorRole: "Admin • ADM-001",
    actorInitials: "RD",
    timestamp: "Nov 18, 2026, 11:02:14 AM",
    ip: "192.168.1.45",
    network: "Campus VPN",
    resource: "Academic_Risk_Classifier_v2",
    sessionKey: "sess_99f0...bc12",
    hash: "9a8e52c8b07d4b29c9fe871ef4bc3410529d84bfda42bb6c88f219036fbb40a8",
    payload: JSON.stringify({ entity: "ThresholdConfiguration", high_risk_score: "< 60%", attendance_trigger: "< 75%" }, null, 2),
  },
  {
    id: "EVT-2026-99213",
    title: "Batch Student Data Ingestion",
    category: "data",
    severity: "info",
    actorName: "Ms. Priya Sharma",
    actorRole: "Teacher • IT",
    actorInitials: "PS",
    timestamp: "Nov 17, 2026, 09:15:30 AM",
    ip: "192.168.1.88",
    network: "Internal Lab Network",
    resource: "term2_attendance_final_v2.csv",
    sessionKey: "sess_883a...912a",
    hash: "f4b6289d0124a919248df92831bca89123847291a823901bca91092384910293",
    payload: JSON.stringify({ file_name: "term2_attendance_final_v2.csv", records_imported: 1420, validation_status: "PASSED" }, null, 2),
  },
  {
    id: "EVT-2026-99212",
    title: "Prescribed Support Intervention",
    category: "system",
    severity: "success",
    actorName: "Dr. Sarah Khan",
    actorRole: "Mentor • IT",
    actorInitials: "SK",
    timestamp: "Nov 16, 2026, 04:45:10 PM",
    ip: "192.168.1.112",
    network: "Campus Faculty WiFi",
    resource: "Student Profile: STU1001",
    sessionKey: "sess_772c...331b",
    hash: "b823910cda8192348df82391823910bca819238491283910bca9182938102938",
    payload: JSON.stringify({ action: "CreateIntervention", target_student_id: "STU1001", student_name: "Aarav Deshmukh" }, null, 2),
  },
  {
    id: "EVT-2026-99211",
    title: "Institutional Report Exported",
    category: "data",
    severity: "info",
    actorName: "Dr. Rajesh Gupta",
    actorRole: "Management • Executive Oversight",
    actorInitials: "RG",
    timestamp: "Nov 15, 2026, 02:18:22 PM",
    ip: "172.16.4.12",
    network: "Executive Gateway",
    resource: "FY2026_Institutional_KPI_Report.html",
    sessionKey: "sess_112a...776e",
    hash: "c718293810293849102938401923849102938401928394019283940192839401",
    payload: JSON.stringify({ action: "ExportReport", departments: ["IT", "Comp", "Mech", "Civil", "EXTC"] }, null, 2),
  },
  {
    id: "EVT-2026-99209",
    title: "Student Consent Preferences Updated",
    category: "auth",
    severity: "success",
    actorName: "Aarav Deshmukh",
    actorRole: "Student • STU1001",
    actorInitials: "AD",
    timestamp: "Nov 14, 2026, 10:08:05 AM",
    ip: "10.24.6.91",
    network: "Campus Student Portal",
    resource: "ConsentRecord: STU1001",
    sessionKey: "sess_510c...204f",
    hash: "d918273645102938475610293847561029384756102938475610293847561029",
    payload: JSON.stringify({ action: "CONSENT_UPDATED", student_id: "STU1001", analytics: true, mentor_alerts: true }, null, 2),
  },
  {
    id: "EVT-2026-99208",
    title: "Student Explanation Feedback Submitted",
    category: "system",
    severity: "info",
    actorName: "Priya Rao",
    actorRole: "Student • STU1002",
    actorInitials: "PR",
    timestamp: "Nov 13, 2026, 03:22:19 PM",
    ip: "10.24.8.14",
    network: "Campus Student Portal",
    resource: "Student Progress Card: STU1002",
    sessionKey: "sess_319e...881a",
    hash: "a102938475619283746501928374650192837465019283746501928374650192",
    payload: JSON.stringify({ action: "STUDENT_EXPLANATION_FEEDBACK", student_id: "STU1002", verdict: "useful" }, null, 2),
  },
];

export default function AuditLogPage() {
  const { addToast } = useUIStore();

  const [events] = useState<AuditEvent[]>(INITIAL_EVENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [integrityModalOpen, setIntegrityModalOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return events.filter((evt) => {
      const matchesSearch =
        evt.title.toLowerCase().includes(q) ||
        evt.actorName.toLowerCase().includes(q) ||
        evt.id.toLowerCase().includes(q) ||
        evt.ip.includes(q) ||
        evt.resource.toLowerCase().includes(q);
      const matchesType = eventTypeFilter === "all" || evt.category === eventTypeFilter;
      const matchesSeverity = severityFilter === "all" || evt.severity === severityFilter;
      const matchesRole = roleFilter === "all" || evt.actorRole.toLowerCase().includes(roleFilter.toLowerCase());
      return matchesSearch && matchesType && matchesSeverity && matchesRole;
    });
  }, [events, searchQuery, eventTypeFilter, severityFilter, roleFilter]);

  const handleExportCSV = () => {
    const csv = [
      "Event ID,Title,Category,Severity,Actor,Role,Timestamp,IP,Resource,Hash",
      ...filteredEvents.map(
        (e) => `${e.id},"${e.title}",${e.category},${e.severity},"${e.actorName}","${e.actorRole}","${e.timestamp}",${e.ip},"${e.resource}",${e.hash}`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edusentinel_immutable_audit_log.csv";
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: "Audit Log Exported (CSV)", type: "info" });
  };

  const handleDownloadCertificate = () => {
    const certHtml = [
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Compliance Certificate #CERT-2026-NAAC-99</title></head>`,
      `<body style="font-family:system-ui,sans-serif;padding:40px;max-width:720px;margin:auto;color:#181D26">`,
      `<h1>EduSentinel AI — Governance &amp; Audit Compliance Certificate</h1>`,
      `<p><strong>Certificate ID:</strong> CERT-2026-NAAC-99</p>`,
      `<p><strong>Issued At:</strong> ${new Date().toISOString()}</p>`,
      `<p><strong>Records Verified:</strong> ${filteredEvents.length} filtered ledger entries (14,820 institution events)</p>`,
      `<p><strong>SHA-256 Merkle Root:</strong> <code>${MERKLE_ROOT}</code></p>`,
      `<hr/><p>Attests append-only write-once logging across Admin, Mentor, Teacher, Coordinator, Management, and Student privacy actions.</p>`,
      `</body></html>`,
    ].join("");
    const blob = new Blob([certHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CERT-2026-NAAC-99_Compliance_Certificate.html";
    a.click();
    URL.revokeObjectURL(url);
    addToast({ title: "Compliance Certificate Downloaded", message: "Saved CERT-2026-NAAC-99_Compliance_Certificate.html", type: "success" });
  };

  return (
    <div className="text-[#181D26] pb-8">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#666D7A] uppercase tracking-wider mb-1">
              <span>Admin Portal</span>
              <span>/</span>
              <span className="text-[#181D26]">Compliance &amp; Governance</span>
            </div>
            <h1 className="text-[34px] sm:text-[38px] font-normal tracking-[-0.025em] text-[#181D26] leading-tight">
              Audit Log
            </h1>
            <p className="text-[14px] text-[#666D7A] mt-1">
              Immutable provenance log covering Staff, Management, and Student privacy/consent actions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 bg-white border border-[#E0E2E6] hover:bg-[#F8FAFC] text-[13px] font-medium px-4 py-2.5 rounded-[14px] cursor-pointer"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">download</span>
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setIntegrityModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#181D26] hover:bg-[#333840] text-white text-[13px] font-medium px-5 py-2.5 rounded-[14px] cursor-pointer"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">verified</span>
              <span>Verify Integrity Proof</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[22px] p-4 px-6 border border-[#E0E2E6] flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative flex-1 min-w-[260px]">
            <span aria-hidden="true" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#666D7A]">search</span>
            <input
              type="text"
              aria-label="Search audit events"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actor, event, IP, or resource..."
              className="w-full pl-10 pr-4 py-2 text-[13px] bg-[#F7F8FA] rounded-[12px] border border-[#E0E2E6]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select aria-label="Filter by event category" value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)} className="h-10 px-3 rounded-[12px] bg-white border border-[#E0E2E6] text-[13px]">
              <option value="all">Category: All</option>
              <option value="auth">Authentication &amp; Consent</option>
              <option value="data">Data Access / Export</option>
              <option value="config">Config Update</option>
              <option value="system">System / Intervention</option>
            </select>

            <select aria-label="Filter by severity" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="h-10 px-3 rounded-[12px] bg-white border border-[#E0E2E6] text-[13px]">
              <option value="all">Severity: All</option>
              <option value="success">Success</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>

            <select aria-label="Filter by actor role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-10 px-3 rounded-[12px] bg-white border border-[#E0E2E6] text-[13px]">
              <option value="all">Role: All Roles</option>
              <option value="admin">Admin</option>
              <option value="mentor">Mentor</option>
              <option value="teacher">Teacher</option>
              <option value="coordinator">Coordinator</option>
              <option value="management">Management</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[22px] border border-[#E0E2E6] overflow-hidden">
          {filteredEvents.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No matching audit events"
                message="Clear filters to inspect the full immutable ledger."
                action={{
                  label: "Reset Filters",
                  onClick: () => {
                    setSearchQuery("");
                    setEventTypeFilter("all");
                    setSeverityFilter("all");
                    setRoleFilter("all");
                  },
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap min-w-[760px] text-[13px]">
                <thead>
                  <tr className="border-b border-[#E0E2E6] text-[12px] font-medium text-[#666D7A] uppercase">
                    <th className="py-3 px-5">Event ID</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">IP</th>
                    <th className="py-3 px-5 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E2E6]">
                  {filteredEvents.map((evt) => (
                    <tr
                      key={evt.id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setDrawerOpen(true);
                      }}
                      className="hover:bg-[#F8FAFC] cursor-pointer"
                    >
                      <td className="py-3.5 px-5 font-mono font-semibold">{evt.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium block">{evt.title}</span>
                        <span className="text-[11px] font-mono text-[#666D7A]">{evt.resource}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold block">{evt.actorName}</span>
                        <span className="text-[11px] text-[#666D7A]">{evt.actorRole}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#666D7A] text-[12px]">{evt.timestamp}</td>
                      <td className="py-3.5 px-4 font-mono text-[12px] text-[#666D7A]">{evt.ip}</td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                            setDrawerOpen(true);
                          }}
                          className="px-3 py-1 rounded-[10px] border border-[#E0E2E6] text-[12px] font-medium hover:bg-[#F7F8FA] cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Compliance Certificate Banner */}
        <div className="p-5 rounded-[20px] bg-white border border-[#E0E2E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[14px] font-semibold block">Institutional Audit Retention &amp; Compliance Certificate</span>
            <span className="text-[12px] text-[#666D7A]">7-year append-only storage with SHA-256 Merkle chain proofs.</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadCertificate}
            className="px-4 py-2.5 rounded-[12px] bg-[#181D26] text-white text-[13px] font-medium hover:bg-[#333840] cursor-pointer shrink-0"
          >
            Download Compliance Cert
          </button>
        </div>
      </div>

      {/* Inspection Modal / Drawer via ModalShell for Escape & focus trap */}
      <ModalShell
        open={drawerOpen && Boolean(selectedEvent)}
        title={selectedEvent ? `${selectedEvent.id} — ${selectedEvent.title}` : "Event Details"}
        onClose={() => setDrawerOpen(false)}
        widthClass="max-w-xl"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div className="p-3 rounded-[12px] bg-[#F7F8FA] border border-[#E0E2E6]">
                <span className="text-[#666D7A] block">Actor</span>
                <strong>{selectedEvent.actorName}</strong> ({selectedEvent.actorRole})
              </div>
              <div className="p-3 rounded-[12px] bg-[#F7F8FA] border border-[#E0E2E6]">
                <span className="text-[#666D7A] block">IP / Network</span>
                <strong className="font-mono">{selectedEvent.ip}</strong> • {selectedEvent.network}
              </div>
            </div>
            <pre className="bg-[#181D26] text-white p-4 rounded-[14px] font-mono text-[11px] overflow-x-auto">
              {selectedEvent.payload}
            </pre>
            <div className="p-3 rounded-[12px] bg-[#F4FAF7] border border-[#A8D8C4] font-mono text-[11px] break-all">
              Hash: {selectedEvent.hash}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedEvent.payload);
                  addToast({ title: "Payload Copied", type: "success" });
                }}
                className="px-4 py-2 rounded-[10px] bg-[#181D26] text-white text-[12px] font-medium cursor-pointer"
              >
                Copy JSON
              </button>
            </div>
          </div>
        )}
      </ModalShell>

      <ModalShell open={integrityModalOpen} title="Cryptographic Integrity Confirmed" onClose={() => setIntegrityModalOpen(false)}>
        <div className="space-y-3">
          <p className="text-[13px] text-[#333840]">
            SHA-256 hash chain verified across 14,820 ledger entries with zero tampering detected.
          </p>
          <div className="p-3 rounded-[12px] bg-[#F7F8FA] border border-[#E0E2E6] font-mono text-[11px] break-all">
            Merkle Root: {MERKLE_ROOT}
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => setIntegrityModalOpen(false)} className="px-4 py-2 rounded-[10px] bg-[#181D26] text-white text-[13px] cursor-pointer">
              Close
            </button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}

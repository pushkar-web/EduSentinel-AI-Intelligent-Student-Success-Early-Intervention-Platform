"use client";

import React, { useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { useDemoDataStore, type PersistedGoalMilestone } from "@/store/useDemoDataStore";
import ModalShell from "@/components/ui/ModalShell";

const RECOMMENDED_RESOURCES = [
  { title: "Calculus III Interactive Visualizer", type: "Practice Workbook • 20 min", tag: "Mathematics", href: "/student/progress" },
  { title: "OS Concurrency & Mutex Walkthrough", type: "Lab Prep Guide • 15 min", tag: "Operating Systems", href: "/student/progress" },
  { title: "Pomodoro Deep-Focus Study Template", type: "Study Habit Playbook", tag: "Study Habits", href: "/student/progress" },
];

export default function MySupportPlanPage() {
  const { addToast } = useUIStore();
  const { studentGoals: goals, toggleStudentGoal, addStudentGoal } = useDemoDataStore();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [supportCategory, setSupportCategory] = useState("Mathematics Tutoring");
  const [supportUrgency, setSupportUrgency] = useState<"routine" | "this_week" | "before_exam">("routine");
  const [supportDescription, setSupportDescription] = useState("");

  const completedCount = goals.filter((g) => g.completed).length;
  const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const ringStroke = (progressPercent / 100) * circumference;

  const displayedGoals = activeTab === "active" ? goals.filter((g) => !g.completed) : goals.filter((g) => g.completed);

  const handleToggleGoal = (id: string) => {
    const target = goals.find((g) => g.id === id);
    const next = toggleStudentGoal(id);
    if (target) {
      addToast({
        title: next ? "Milestone completed!" : "Goal moved back to active list",
        message: target.title,
        type: next ? "success" : "info",
      });
    }
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportDescription.trim()) return;
    const urgencyLabel =
      supportUrgency === "before_exam"
        ? "Before Next Exam"
        : supportUrgency === "this_week"
        ? "This Week"
        : "Routine";
    const newGoal: PersistedGoalMilestone = {
      id: `G-${Date.now().toString().slice(-3)}`,
      title: `${supportCategory} (${urgencyLabel})`,
      description: supportDescription.trim(),
      category: supportCategory.includes("Math") ? "Mathematics" : supportCategory.includes("OS") ? "Operating Systems" : "Study Habits",
      mentor: "Dr. Sarah Khan",
      dueDate: supportUrgency === "before_exam" ? "Nov 26, 2026" : "Dec 02, 2026",
      completed: false,
    };
    addStudentGoal(newGoal);
    setIsModalOpen(false);
    setSupportDescription("");
    addToast({ title: "Guidance Request Sent", message: `Dr. Sarah Khan notified (${urgencyLabel} priority).`, type: "success" });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAECEF] text-[#181D26] text-[12px] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#006400]" />
            Personal Support Roadmap
          </div>
          <h1 className="text-[34px] sm:text-[40px] font-normal tracking-tight text-[#181D26]">
            My Academic Support Plan
          </h1>
          <p className="text-[15px] text-[#41454D]">
            Collaboratively designed with your mentor to build confidence, clear milestones, and celebrate wins.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#181D26] text-white text-[13.5px] font-medium hover:bg-[#0D1218] cursor-pointer self-start"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
          <span>Request Mentor Guidance</span>
        </button>
      </div>

      {/* Circular Progress Ring + Next Mentor Meeting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white rounded-[22px] p-6 border border-[#EAECEF] flex items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#666D7A]">Semester Milestone Progress</span>
            <div className="text-[38px] font-medium font-mono">{progressPercent}%</div>
            <p className="text-[13.5px] text-[#666D7A]">{completedCount} of {goals.length} supportive milestones completed</p>
          </div>
          <svg width="108" height="108" viewBox="0 0 100 100" role="img" aria-label={`Support plan completion ${progressPercent}%`}>
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#EAECEF" strokeWidth="10" />
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#0A2E0E" strokeWidth="10" strokeDasharray={`${ringStroke} ${circumference}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
          </svg>
        </div>

        <div className="lg:col-span-5 bg-[#F4FAF7] rounded-[22px] p-6 border border-[#A8D8C4] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0A2E0E]">Next Scheduled Mentor Meeting</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-[#0A2E0E] text-[11px] font-semibold">Confirmed</span>
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[#181D26]">Dr. Sarah Khan — Lead Mentor</h2>
            <p className="text-[13px] font-mono text-[#333840] mt-1">Nov 25, 2026 • 03:30 PM</p>
            <p className="text-[12.5px] text-[#0A2E0E] mt-0.5">Academic Success Center (Room 204) • Topic: Calculus Practice Check</p>
          </div>
        </div>
      </div>

      {/* Tabs + Goals */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 border-b border-[#EAECEF] pb-1">
          {[
            ["active", `Active Goals (${goals.filter((g) => !g.completed).length})`],
            ["completed", `Completed Milestones (${completedCount})`],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as "active" | "completed")}
              className={`px-4 py-2 rounded-[12px] text-[13.5px] font-medium cursor-pointer ${
                activeTab === key ? "bg-[#181D26] text-white" : "text-[#41454D]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {displayedGoals.map((g) => (
            <div key={g.id} className={`p-5 rounded-[20px] border flex items-start justify-between gap-4 ${g.completed ? "bg-[#F7F8FA] opacity-80" : "bg-white"} border-[#EAECEF]`}>
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={g.completed}
                  onChange={() => handleToggleGoal(g.id)}
                  aria-label={`Toggle ${g.title}`}
                  className="w-5 h-5 mt-1 accent-[#181D26] cursor-pointer"
                />
                <div>
                  <span className={`text-[15px] font-medium block ${g.completed ? "line-through text-[#666D7A]" : "text-[#181D26]"}`}>{g.title}</span>
                  <p className="text-[13px] text-[#41454D] mt-0.5">{g.description}</p>
                  <p className="text-[11.5px] text-[#666D7A] mt-1 font-mono">{g.category} • {g.mentor} • Due {g.dueDate}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${g.completed ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F7F8FA] text-[#666D7A]"}`}>
                {g.completed ? "Achieved" : "In Progress"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Learning Resources */}
      <div className="bg-white rounded-[22px] p-6 border border-[#EAECEF] space-y-4">
        <h2 className="text-[18px] font-semibold">Recommended Learning Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECOMMENDED_RESOURCES.map((res) => (
            <div key={res.title} className="p-4 rounded-[16px] bg-[#F7F8FA] border border-[#EAECEF] flex flex-col justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-white border border-[#DDDDDD] text-[11px] font-medium">{res.tag}</span>
                <h3 className="text-[14px] font-semibold mt-2">{res.title}</h3>
                <p className="text-[12px] text-[#666D7A] mt-0.5">{res.type}</p>
              </div>
              <button
                type="button"
                onClick={() => addToast({ title: "Opened Study Resource", message: res.title, type: "info" })}
                className="self-start text-[12.5px] font-semibold text-[#1B61C9] hover:underline cursor-pointer"
              >
                Launch Module →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Request Mentor Guidance Modal with Urgency Selector */}
      <ModalShell open={isModalOpen} title="Request Mentor Guidance" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div>
            <label htmlFor="sup-cat" className="block text-[13px] font-medium mb-1">Area of Support</label>
            <select id="sup-cat" value={supportCategory} onChange={(e) => setSupportCategory(e.target.value)} className="w-full h-10 px-3 rounded-[10px] border border-[#DDDDDD] text-[13px]">
              <option value="Mathematics Tutoring">Mathematics Tutoring &amp; Problem Sets</option>
              <option value="OS Lab Walkthrough">Operating Systems Lab Coursework</option>
              <option value="Study Habits Coaching">Time Management &amp; Focus Habits</option>
            </select>
          </div>
          <div>
            <span className="block text-[13px] font-medium mb-1.5">Urgency / Timing</span>
            <div className="grid grid-cols-3 gap-2 text-[12px]">
              {[
                { id: "routine" as const, label: "Routine" },
                { id: "this_week" as const, label: "This Week" },
                { id: "before_exam" as const, label: "Before Exam" },
              ].map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSupportUrgency(u.id)}
                  className={`py-2 px-2 rounded-[10px] border font-medium cursor-pointer ${
                    supportUrgency === u.id ? "bg-[#181D26] text-white border-[#181D26]" : "bg-white border-[#DDDDDD]"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="sup-desc" className="block text-[13px] font-medium mb-1">What would you like help with?</label>
            <textarea
              id="sup-desc"
              rows={3}
              required
              value={supportDescription}
              onChange={(e) => setSupportDescription(e.target.value)}
              placeholder="Share the topic or assignment..."
              className="w-full p-3 rounded-[10px] border border-[#DDDDDD] text-[13px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[13px] text-[#666D7A] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-[10px] bg-[#181D26] text-white text-[13px] cursor-pointer">Submit Request</button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

import Link from "next/link";

export const metadata = {
  title: "Privacy Charter | EduSentinel AI",
  description:
    "How EduSentinel AI collects, uses, protects and shares student data, and the rights every student keeps.",
};

const PRINCIPLES = [
  {
    icon: "visibility",
    title: "Transparent by default",
    body: "Every risk score comes with the top contributing factors in plain language. Students can see what the model sees about them.",
  },
  {
    icon: "support_agent",
    title: "Support, never punishment",
    body: "Risk scores are used only to offer help — mentoring, tutoring, or a check-in. They never affect grades, discipline or admissions.",
  },
  {
    icon: "lock",
    title: "Minimum necessary access",
    body: "Access is role-based. Teachers, mentors, coordinators and administrators only see the data their role requires. Management views are read-only.",
  },
  {
    icon: "person_check",
    title: "Student agency",
    body: "Students can review, correct and contest data, give feedback on explanations, and withdraw consent from the Privacy & Consent page.",
  },
  {
    icon: "history",
    title: "Auditable",
    body: "Access to student records and every model or configuration change is written to an immutable audit log reviewed by governance.",
  },
  {
    icon: "timer",
    title: "Secure sessions",
    body: "Sessions are signed out automatically after 15 minutes of inactivity, and session data is cleared when the browser tab is closed.",
  },
];

export default function PrivacyCharterPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#181D26] px-4 py-12 selection:bg-[#EAECEF]">
      <div className="mx-auto w-full max-w-[820px]">
        <header className="mb-10 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-[20px] font-semibold tracking-tight">
            EduSentinel AI
          </Link>
          <p className="mt-1 text-[12px] font-medium uppercase tracking-wider text-[#666D7A]">
            Data Governance &amp; Student Agency
          </p>
          <h1 className="mt-6 text-[34px] font-normal leading-tight tracking-[-0.025em]">
            Privacy Charter
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-[14px] text-[#666D7A]">
            Our commitments on how student data is collected, used and protected. Applicable to
            every EduSentinel AI role and session.
          </p>
        </header>

        <section aria-label="Principles" className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <article
              key={p.title}
              className="rounded-[20px] border border-[#EAECEF] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
            >
              <span
                aria-hidden="true"
                className="material-symbols-outlined mb-3 text-[24px] text-[#AA2D00]"
              >
                {p.icon}
              </span>
              <h2 className="mb-1 text-[16px] font-semibold">{p.title}</h2>
              <p className="text-[13px] leading-relaxed text-[#666D7A]">{p.body}</p>
            </article>
          ))}
        </section>

        <section
          aria-label="Data covered"
          className="mt-6 rounded-[20px] border border-[#EAECEF] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
        >
          <h2 className="mb-2 text-[16px] font-semibold">What data is used</h2>
          <p className="text-[13px] leading-relaxed text-[#666D7A]">
            Attendance, assessment scores, assignment submissions and learning-platform activity
            from the institutional systems of record. No social media, location, or biometric data
            is collected.
          </p>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[13px] text-[#666D7A]">
          <Link href="/consent" className="hover:underline">
            Read the Consent Terms
          </Link>
          <Link href="/login" className="hover:underline">
            Back to Sign In
          </Link>
        </footer>
      </div>
    </div>
  );
}

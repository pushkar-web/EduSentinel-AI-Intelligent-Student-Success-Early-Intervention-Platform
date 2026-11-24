import React, { Suspense } from "react";
import Student360ClientView from "./Student360ClientView";

export function generateStaticParams() {
  return [
    { studentId: "STU1001" },
    { studentId: "STU1002" },
    { studentId: "STU1003" },
    { studentId: "STU1004" },
    { studentId: "STU1005" },
    { studentId: "STU1006" },
  ];
}

export default async function Student360ProfilePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-muted">
          Loading Student 360 Profile...
        </div>
      }
    >
      <Student360ClientView studentId={studentId} />
    </Suspense>
  );
}

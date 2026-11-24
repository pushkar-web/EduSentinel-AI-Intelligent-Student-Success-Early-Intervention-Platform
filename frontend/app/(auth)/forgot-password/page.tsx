"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validation/schemas";

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmittedEmail(values.email);
      setDispatched(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#181D26] flex flex-col justify-between py-12 px-4 selection:bg-[#EAECEF]">
      {/* Top Brand Header */}
      <div className="w-full flex flex-col items-center justify-center text-center">
        <Link href="/login" className="flex items-center gap-3 mb-2 group">
          <div className="w-11 h-11 rounded-full bg-[#181D26] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
              <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
              <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
            </svg>
          </div>
          <span className="text-[20px] font-semibold text-[#181D26] tracking-tight">
            EduSentinel AI
          </span>
        </Link>
        <p className="text-[12px] font-medium uppercase tracking-wider text-[#666D7A]">
          Security &amp; Account Recovery
        </p>
      </div>

      {/* Main Card */}
      <main className="w-full max-w-[460px] mx-auto my-auto">
        <div className="bg-white rounded-[24px] shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-[#EAECEF] p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#F7F8FA] border border-[#EAECEF] flex items-center justify-center text-[#181D26] shadow-xs mb-3">
              <span className="material-symbols-outlined text-[24px]">lock_reset</span>
            </div>
            <h1 className="text-[26px] font-normal tracking-tight text-[#181D26] mb-1.5">
              Reset your password
            </h1>
            <p className="text-[14px] text-[#666D7A] max-w-[340px] leading-relaxed">
              Enter your institutional email and we will send you secure recovery instructions.
            </p>
          </div>

          {/* Success Notification */}
          {dispatched ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-[14px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#0A2E0E] text-[13px] leading-relaxed flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#006400] shrink-0 mt-0.5">
                  check_circle
                </span>
                <div>
                  <p className="font-semibold text-[#006400]">Recovery email sent</p>
                  <p className="mt-1">
                    If an account exists for <strong className="font-semibold">{submittedEmail}</strong>, you will receive password reset instructions within 2 minutes.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full h-11 bg-[#181D26] text-white font-medium text-[14px] rounded-[14px] flex items-center justify-center gap-2 hover:bg-[#0D1218] transition-all shadow-xs"
                >
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[13px] font-medium text-[#181D26] mb-1.5"
                >
                  Institutional Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#666D7A] text-[18px]">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    placeholder="you@institution.edu"
                    className="w-full h-11 pl-10 pr-3.5 bg-white text-[#181D26] placeholder:text-[#666D7A] text-[14px] rounded-[12px] border border-[#DDDDDD] focus:outline-hidden focus:border-[#181D26] transition-colors"
                  />
                </div>
                {errors.email && (
                  <p id="email-error" role="alert" className="mt-1.5 text-[12.5px] text-[#DC2626]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#181D26] text-white font-medium text-[14px] rounded-[14px] flex items-center justify-center gap-2 hover:bg-[#0D1218] transition-all shadow-xs cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </div>

              <div className="pt-3 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#181D26] hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-[12px] text-[#666D7A]">
        <p>© 2026 EduSentinel AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

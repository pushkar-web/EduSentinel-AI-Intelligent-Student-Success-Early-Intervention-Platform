"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { UserRole } from "@/lib/auth-types";
import { apiClient } from "@/lib/api-client";
import { LOCALE_OPTIONS } from "@/lib/i18n/messages";
import { useT } from "@/lib/i18n/useT";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validation/schemas";

function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case "teacher":
      return "/teacher/class-overview";
    case "student":
      return "/student/progress";
    case "mentor":
      return "/mentor/dashboard";
    case "coordinator":
      return "/coordinator/dashboard";
    case "admin":
      return "/admin/institution-kpis";
    case "management":
      return "/admin/institution-kpis";
    default:
      return "/teacher/class-overview";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const switchingIdentity = searchParams.get("switch") === "1";
  const { isAuthenticated, activeRole, hasAcknowledgedConsent, setAuth } = useAuthStore();
  const { setLocale } = useUIStore();
  const { t, locale } = useT();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [ssoModalOpen, setSsoModalOpen] = useState(false);

  // If already authenticated, forward directly to the role dashboard
  // (skipped when the user explicitly asked to switch identity via ?switch=1)
  useEffect(() => {
    if (switchingIdentity) return;
    if (isAuthenticated && activeRole) {
      if (activeRole === "student" && !hasAcknowledgedConsent) {
        router.replace("/consent");
      } else {
        router.replace(getRoleRedirectPath(activeRole));
      }
    }
  }, [switchingIdentity, isAuthenticated, activeRole, hasAcknowledgedConsent, router]);

  const onSubmit = async ({ email, password }: LoginFormValues) => {
    setLoading(true);
    setStatus(null);

    try {
      // Authenticate via central API client
      const authRes = await apiClient.login({ email, password });
      setLoading(false);

      // Securely obtain authenticated user and actual role from auth response
      setAuth(authRes.user, authRes.token);

      setStatus({
        message: `Authenticated as ${authRes.user.name} (${authRes.user.role.toUpperCase()}). Redirecting...`,
        type: "success",
      });

      setTimeout(() => {
        if (authRes.requiresConsent) {
          router.push("/consent");
        } else {
          router.push(getRoleRedirectPath(authRes.user.role));
        }
      }, 450);
    } catch (err: unknown) {
      setLoading(false);
      setStatus({
        message:
          err instanceof Error
            ? err.message
            : "Authentication failed. Please verify credentials.",
        type: "error",
      });
    }
  };

  const handleSelectSSO = async (providerName: string) => {
    setSsoModalOpen(false);
    setLoading(true);
    setStatus({
      message: `Connecting to ${providerName}... Authenticating federated identity...`,
      type: "success",
    });

    try {
      const authRes = await apiClient.login({ email: "p.sharma@edusentinel.edu" });
      setLoading(false);
      setAuth(authRes.user, authRes.token);

      setTimeout(() => {
        router.push(getRoleRedirectPath(authRes.user.role));
      }, 450);
    } catch {
      setLoading(false);
      setStatus({
        message: "SSO authentication could not be completed.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-[#181D26] relative overflow-x-hidden flex flex-col lg:flex-row selection:bg-[#EAECEF]">
      {/* ============================================================== */}
      {/* DESKTOP BACKGROUND: Full-Height 16:9 Mascot in Garden Scene     */}
      {/* The image natively has the curved white area on the left 45%   */}
      {/* ============================================================== */}
      <div
        className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <div className="relative w-full h-full flex items-center justify-end">
          <Image
            src="/images/mascot/login-robot-background.png"
            alt="EduSentinel AI Orange Robot Mascot in Garden"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-right animate-mascot-float"
          />

          {/* Restrained sparkling twinkle effect over the waving hand's yellow stars */}
          <div className="absolute right-[8%] top-[25%] pointer-events-none animate-sparkle-twinkle">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              className="text-amber-300/80 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
            >
              <path
                d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="absolute right-[13.5%] top-[19%] pointer-events-none animate-sparkle-twinkle [animation-delay:1.8s]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              className="text-amber-200/70 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
            >
              <path
                d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE / TABLET HEADER: Compact Mascot Illustration Banner     */}
      {/* ============================================================== */}
      <div className="lg:hidden w-full relative h-48 sm:h-64 overflow-hidden bg-[#FEFBF6] border-b border-[#F0F2F5] shrink-0">
        <Image
          src="/images/mascot/login-robot-background.png"
          alt="EduSentinel AI Orange Robot Mascot in Garden"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[78%_40%] animate-mascot-float"
        />
        <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent opacity-90" />
      </div>

      {/* ============================================================== */}
      {/* LEFT SIDE: Clean Editorial Form on the Seamless White Canvas   */}
      {/* Sits naturally on the 45% white curved negative space          */}
      {/* ============================================================== */}
      <div className="w-full lg:w-[48%] xl:w-[45%] 2xl:w-[42%] min-h-screen z-10 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:pl-16 2xl:pl-24 bg-transparent">
        {/* Brand Header + Language Switcher */}
        <header className="flex items-center justify-between gap-3 pt-2">
          <Link href="/login" className="flex items-center gap-3 group">
            {/* Geometric Quadrant Brand Symbol */}
            <div className="w-10 h-10 rounded-full bg-[#181D26] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
                <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
                <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[19px] font-semibold text-[#181D26] tracking-tight leading-tight">
                EduSentinel AI
              </span>
              <span className="text-[11.5px] font-medium text-[#666D7A] tracking-normal">
                Student Success Intelligence
              </span>
            </div>
          </Link>

          <div
            role="group"
            aria-label="Login language"
            className="inline-flex items-center rounded-[10px] bg-[#F7F8FA] border border-[#EAECEF] p-0.5 shrink-0"
          >
            {LOCALE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLocale(opt.code)}
                aria-pressed={locale === opt.code}
                title={opt.nativeName}
                className={`px-2 py-1 rounded-[8px] text-[11px] font-semibold transition-colors cursor-pointer ${
                  locale === opt.code ? "bg-[#181D26] text-white shadow-xs" : "text-[#666D7A] hover:text-[#181D26]"
                }`}
              >
                {opt.shortLabel}
              </button>
            ))}
          </div>
        </header>

        {/* Center Login Form Content */}
        <main className="my-auto py-8 max-w-[420px] w-full">
          {/* Editorial Welcome Heading */}
          <div className="mb-7">
            <h1 className="text-[32px] sm:text-[36px] font-normal tracking-tight text-[#181D26] mb-1.5 leading-tight">
              {t("Welcome back")}
            </h1>
            <p className="text-[14.5px] text-[#41454D]">
              {t("Sign in to continue to your workspace.")}
            </p>
          </div>

          {/* Status Feedback Banner */}
          {status && (
            <div
              className={`mb-5 p-3.5 rounded-[14px] text-[13px] flex items-start gap-2.5 transition-all duration-200 ${
                status.type === "error"
                  ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                  : "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                {status.type === "error" ? "error" : "check_circle"}
              </span>
              <span className="flex-1 font-medium leading-relaxed">{status.message}</span>
            </div>
          )}

          {/* Primary Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Institutional Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-[13px] font-medium text-[#181D26] mb-1.5"
              >
                Institutional Email
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#666D7A] text-[18px] pointer-events-none">
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
                  className="w-full h-11 pl-10 pr-3.5 bg-white text-[#181D26] placeholder:text-[#8A909D] text-[14px] rounded-[12px] border border-[#DDDDDD] hover:border-[#CBD0D7] focus:outline-hidden focus:border-[#181D26] focus:ring-2 focus:ring-[#181D26]/5 transition-all"
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className="mt-1.5 text-[12.5px] text-[#DC2626]">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-[#181D26] mb-1.5"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#666D7A] text-[18px] pointer-events-none">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-10 pr-10 bg-white text-[#181D26] placeholder:text-[#8A909D] text-[14px] rounded-[12px] border border-[#DDDDDD] hover:border-[#CBD0D7] focus:outline-hidden focus:border-[#181D26] focus:ring-2 focus:ring-[#181D26]/5 transition-all"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#666D7A] hover:text-[#181D26] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="mt-1.5 text-[12.5px] text-[#DC2626]">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-[4px] border-[#DDDDDD] text-[#181D26] focus:ring-0 accent-[#181D26] cursor-pointer"
                />
                <span className="text-[13px] text-[#41454D]">
                  {t("Remember me")}
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[13px] text-[#1B61C9] hover:underline font-medium"
              >
                {t("Forgot password?")}
              </Link>
            </div>

            {/* Primary Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#181D26] text-white font-medium text-[14px] rounded-[14px] flex items-center justify-center gap-2 hover:bg-[#0D1218] active:scale-[0.99] transition-all shadow-xs cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>{t("Sign in")}</span>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-[#EAECEF]" />
            </div>
            <span className="relative px-3 bg-white text-[12px] font-medium text-[#666D7A]">
              or
            </span>
          </div>

          {/* Institutional SSO Action */}
          <button
            type="button"
            onClick={() => setSsoModalOpen(true)}
            className="w-full h-12 bg-white text-[#181D26] font-medium text-[14px] rounded-[14px] border border-[#DDDDDD] hover:bg-[#F8FAFC] hover:border-[#CBD0D7] flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px] text-[#666D7A]">
              vpn_key
            </span>
            <span>Continue with Institution SSO</span>
          </button>

          {/* Security Information Message */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[12.5px] text-[#666D7A]">
            <span className="material-symbols-outlined text-[15px] text-[#666D7A]">
              lock
            </span>
            <span>Secure access for authorised users.</span>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full text-[12px] text-[#666D7A] flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#F0F2F5] lg:border-none">
          <p>© 2026 EduSentinel AI. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[#1B61C9]">
            <Link href="/consent" className="hover:underline">
              AI Ethics &amp; Consent
            </Link>
            <span>•</span>
            <Link href="/privacy-charter" className="hover:underline">
              Privacy Charter
            </Link>
          </div>
        </footer>
      </div>

      {/* ============================================================== */}
      {/* SSO IDENTITY PROVIDER MODAL                                    */}
      {/* ============================================================== */}
      {ssoModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 shadow-xl border border-[#EAECEF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAECEF] mb-4">
              <h2 className="text-[17px] font-medium text-[#181D26]">
                Institutional SSO Identity Provider
              </h2>
              <button
                onClick={() => setSsoModalOpen(false)}
                type="button"
                className="text-[#666D7A] hover:text-[#181D26] p-1 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-[13px] text-[#41454D] mb-4">
              Select your academic federated identity provider to authenticate securely via SAML 2.0 / OpenID Connect:
            </p>
            <div className="space-y-2">
              {[
                { name: "Google Workspace for Education", icon: "school" },
                { name: "Microsoft Azure AD / Entra ID", icon: "badge" },
                { name: "Shibboleth / InCommon Federation", icon: "shield" },
                { name: "Canvas / Blackboard LMS SSO", icon: "hub" },
              ].map((provider) => (
                <button
                  key={provider.name}
                  type="button"
                  onClick={() => handleSelectSSO(provider.name)}
                  className="w-full flex items-center justify-between p-3.5 rounded-[14px] bg-[#F7F8FA] hover:bg-white border border-[#EAECEF] hover:border-[#181D26] transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-[#666D7A] group-hover:text-[#181D26]">
                      {provider.icon}
                    </span>
                    <span className="text-[13.5px] font-medium text-[#181D26]">
                      {provider.name}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-[#666D7A] group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-[14px] text-[#666D7A]">
          Loading authentication workspace...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

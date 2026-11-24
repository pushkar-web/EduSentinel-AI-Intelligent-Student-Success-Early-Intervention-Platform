import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RoleGuard from "@/components/auth/RoleGuard";
import ModalShell from "@/components/ui/ModalShell";
import Avatar from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/useAuthStore";

const replaceMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/users",
}));

describe("RoleGuard RBAC enforcement", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    pushMock.mockReset();
    useAuthStore.getState().logout();
  });

  it("prompts login and redirects when unauthenticated", () => {
    render(
      <RoleGuard allowedRoles={["admin"]} sectionName="Admin Portal">
        <div>Protected Content</div>
      </RoleGuard>
    );
    expect(screen.getByText("Authentication Required")).toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("shows UnauthorizedPage when activeRole is disallowed", () => {
    useAuthStore.getState().login("student");
    render(
      <RoleGuard allowedRoles={["admin"]} sectionName="Admin Portal">
        <div>Protected Content</div>
      </RoleGuard>
    );
    expect(screen.getByText("Unauthorized Scope")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders protected workspace when role is permitted", () => {
    useAuthStore.getState().login("mentor");
    render(
      <RoleGuard allowedRoles={["mentor", "admin"]} sectionName="Mentor Portal">
        <div>Mentor Safe Area</div>
      </RoleGuard>
    );
    expect(screen.getByText("Mentor Safe Area")).toBeInTheDocument();
  });
});

describe("Shared ModalShell and Avatar components", () => {
  it("supports accessible dialog role and closes on Escape", () => {
    const onClose = vi.fn();
    render(
      <ModalShell open={true} onClose={onClose} title="Schedule Check-in">
        <button type="button">Confirm</button>
      </ModalShell>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders SVG initials fallback cleanly when no image URL is given", () => {
    render(<Avatar name="Dr. Sarah Khan" size={32} />);
    expect(screen.getByRole("img", { name: "Dr. Sarah Khan" })).toBeInTheDocument();
    expect(screen.getByText("SK")).toBeInTheDocument();
  });
});

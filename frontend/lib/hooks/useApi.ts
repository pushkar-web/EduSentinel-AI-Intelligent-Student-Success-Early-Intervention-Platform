"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import type { UserRole } from "../auth-types";

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => apiClient.getStudents(),
  });
}

export function useStudentDetail(id: string) {
  return useQuery({
    queryKey: ["student", id],
    queryFn: () => apiClient.getStudentById(id),
    enabled: Boolean(id),
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiClient.getAlerts(),
  });
}

export function useInterventions() {
  return useQuery({
    queryKey: ["interventions"],
    queryFn: () => apiClient.getInterventions(),
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => apiClient.getAuditLogs(),
  });
}

export function useInstitutionKPIs() {
  return useQuery({
    queryKey: ["institutionKPIs"],
    queryFn: () => apiClient.getInstitutionKPIs(),
  });
}


export function useNotifications(role: UserRole) {
  return useQuery({
    queryKey: ["notifications", role],
    queryFn: () => apiClient.getNotifications(role),
  });
}

export function useModelRegistry() {
  return useQuery({
    queryKey: ["modelRegistry"],
    queryFn: () => apiClient.getModelRegistry(),
  });
}

export function useRiskConfig() {
  return useQuery({
    queryKey: ["riskConfig"],
    queryFn: () => apiClient.getRiskConfig(),
  });
}

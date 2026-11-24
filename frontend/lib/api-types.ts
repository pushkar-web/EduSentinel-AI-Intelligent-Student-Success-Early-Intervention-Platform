export type RiskLevel = "Critical" | "High" | "Medium" | "Low" | "Stable";

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  department: string;
  batch: string;
  currentCgpa: number;
  attendanceRate: number;
  riskLevel: RiskLevel;
  riskScore: number;
  keyDrivers: string[];
  lastActive: string;
  avatarUrl?: string;
}

export interface StudentProfileDetail extends Student {
  enrollmentDate: string;
  advisor: string;
  mentor: string;
  predictedRiskTrend: "increasing" | "stable" | "decreasing";
  mlConfidence: number;
  academicHistory: {
    semester: string;
    gpa: number;
    credits: number;
    attendance: number;
    status: string;
  }[];
  subjectBreakdown: {
    code: string;
    name: string;
    credits: number;
    internalScore: number;
    attendance: number;
    gradeForecast: string;
    risk: RiskLevel;
  }[];
  attendanceHistory: {
    month: string;
    rate: number;
    missedClasses: number;
    excused: number;
  }[];
  recentAlerts: Alert[];
  interventions: Intervention[];
  shapValues: { feature: string; impact: number; description: string }[];
}

export interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  alertType: "ACADEMIC_DROP" | "ATTENDANCE_CRITICAL" | "BEHAVIORAL" | "ENGAGEMENT";
  title: string;
  description: string;
  subject?: string;
  detectedAt: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "ACKNOWLEDGED";
  assignedTo?: string;
}

export interface Intervention {
  id: string;
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  title: string;
  category: "ACADEMIC_TUTORING" | "COUNSELING" | "ATTENDANCE_CONTRACT" | "PEER_MENTORSHIP" | "FINANCIAL_AID";
  assignedTo: string;
  assignedToRole: string;
  status: "ACTIVE" | "PENDING_STUDENT" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  startDate: string;
  targetCompletionDate: string;
  progressPercentage: number;
  milestones: { title: string; completed: boolean; dueDate?: string }[];
  notesCount: number;
  latestNote?: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  ipAddress: string;
  action: string;
  resourceType: string;
  resourceId: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
  detailsJson: Record<string, unknown>;
}

export interface InstitutionKPIs {
  totalStudents: number;
  atRiskCount: number;
  criticalCount: number;
  activeInterventionsCount: number;
  interventionSuccessRate: number;
  overallAttendanceRate: number;
  averageCgpa: number;
  modelAccuracyF1: number;
}


export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "critical" | "warning" | "info";
  /** Destination is always a route the targeted roles are allowed to open. */
  href: string;
  roles: import("./auth-types").UserRole[];
}

export interface ModelVersion {
  version: string;
  status: "PRODUCTION" | "STAGING" | "ARCHIVED";
  algorithm: string;
  trainedOn: string;
  prAuc: number;
  brier: number;
  ece: number;
  f1: number;
  confusion: { tp: number; fp: number; fn: number; tn: number };
  topShap: { feature: string; impact: number }[];
}

export interface RiskConfig {
  academicRiskThreshold: number;
  attendanceCutoff: number;
  criticalScore: number;
  highScore: number;
  mediumScore: number;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

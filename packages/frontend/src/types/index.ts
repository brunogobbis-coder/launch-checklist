export type ChecklistStatus = "in_progress" | "complete";

export type CheckStatus =
  | "pending"
  | "ready"
  | "not_ready"
  | "confirm_set_up"
  | "check_manually"
  | "failed";

export interface ChecklistSummary {
  id: string;
  storeId: number;
  name: string;
  status: ChecklistStatus;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  statusCounts: Partial<Record<CheckStatus, number>>;
}

export interface CheckResult {
  id: string;
  checkType: string;
  displayName: string;
  description: string;
  status: CheckStatus;
  updatedAt: string;
}

export interface SubcategoryResult {
  id: string;
  name: string;
  checks: CheckResult[];
}

export interface SectionResult {
  id: string;
  name: string;
  subcategories: SubcategoryResult[];
}

export interface ChecklistDetail {
  id: string;
  storeId: number;
  name: string;
  status: ChecklistStatus;
  createdAt: string;
  updatedAt: string;
  sections: SectionResult[];
}

export interface CheckDetail {
  id: string;
  checkType: string;
  status: CheckStatus;
  displayName: string;
  description: string;
  assessment: string;
  detailedFindings: Record<string, unknown> | null;
  businessImpact: string;
  recommendations: string[];
  usefulLinks: { title: string; url: string }[];
}

export interface RegistryCheck {
  checkType: string;
  displayName: string;
  description: string;
}

export interface RegistrySubcategory {
  id: string;
  name: string;
  checks: RegistryCheck[];
}

export interface RegistrySection {
  id: string;
  name: string;
  subcategories: RegistrySubcategory[];
}

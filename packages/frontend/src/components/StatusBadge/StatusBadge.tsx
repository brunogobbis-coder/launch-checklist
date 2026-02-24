import { Tag } from "@nimbus-ds/components";
import { useTranslation } from "react-i18next";
import type { ChecklistStatus, CheckStatus } from "../../types";

const CHECK_STATUS_APPEARANCE: Record<
  CheckStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  ready: "success",
  not_ready: "danger",
  confirm_set_up: "warning",
  check_manually: "neutral",
  pending: "neutral",
  failed: "danger",
};

const CHECKLIST_STATUS_APPEARANCE: Record<
  ChecklistStatus,
  "success" | "warning"
> = {
  complete: "success",
  in_progress: "warning",
};

interface CheckStatusBadgeProps {
  status: CheckStatus;
}

export function CheckStatusBadge({ status }: CheckStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Tag appearance={CHECK_STATUS_APPEARANCE[status]}>
      {t(`status.${status}`)}
    </Tag>
  );
}

interface ChecklistStatusBadgeProps {
  status: ChecklistStatus;
}

export function ChecklistStatusBadge({ status }: ChecklistStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Tag appearance={CHECKLIST_STATUS_APPEARANCE[status]}>
      {t(`checklistStatus.${status}`)}
    </Tag>
  );
}

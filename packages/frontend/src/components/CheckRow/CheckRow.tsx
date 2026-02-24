import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Box, Text, Select } from "@nimbus-ds/components";
import { CheckStatusBadge } from "../StatusBadge";
import type { CheckResult, CheckStatus } from "../../types";

const STATUS_OPTIONS: CheckStatus[] = [
  "pending",
  "ready",
  "not_ready",
  "confirm_set_up",
  "check_manually",
];

interface Props {
  check: CheckResult;
  onStatusChange: (checkId: string, status: CheckStatus) => void;
  onClick: (checkId: string) => void;
}

export function CheckRow({ check, onStatusChange, onClick }: Props) {
  const { t } = useTranslation();

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.stopPropagation();
      onStatusChange(check.id, e.target.value as CheckStatus);
    },
    [check.id, onStatusChange]
  );

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      padding="3"
      borderColor="neutral-surfaceHighlight"
      borderStyle="solid"
      borderWidth="none"
      borderBottomWidth="1"
      cursor="pointer"
      onClick={() => onClick(check.id)}
    >
      <Box flex="1">
        <Text fontWeight="medium">{check.displayName}</Text>
        <Text fontSize="caption" color="neutral-textDisabled">
          {check.description}
        </Text>
      </Box>
      <Box display="flex" alignItems="center" gap="3">
        <CheckStatusBadge status={check.status} />
        <Box width="160px" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <Select
            id={`status-${check.id}`}
            name={`status-${check.id}`}
            value={check.status}
            onChange={handleStatusChange}
          >
            {STATUS_OPTIONS.map((s) => (
              <Select.Option key={s} value={s} label={t(`status.${s}`)} />
            ))}
          </Select>
        </Box>
      </Box>
    </Box>
  );
}

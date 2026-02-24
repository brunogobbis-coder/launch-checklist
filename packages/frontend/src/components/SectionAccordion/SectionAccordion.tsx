import { useState, useMemo } from "react";
import { Box, Card, Text, Tag } from "@nimbus-ds/components";
import { ChevronDownIcon, ChevronUpIcon } from "@nimbus-ds/icons";
import { CheckRow } from "../CheckRow";
import type { SectionResult, CheckStatus } from "../../types";

interface Props {
  section: SectionResult;
  onStatusChange: (checkId: string, status: CheckStatus) => void;
  onCheckClick: (checkId: string) => void;
}

export function SectionAccordion({
  section,
  onStatusChange,
  onCheckClick,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<CheckStatus, number>> = {};
    for (const sub of section.subcategories) {
      for (const check of sub.checks) {
        counts[check.status] = (counts[check.status] || 0) + 1;
      }
    }
    return counts;
  }, [section]);

  const totalChecks = useMemo(
    () =>
      section.subcategories.reduce(
        (sum, sub) => sum + sub.checks.length,
        0
      ),
    [section]
  );

  return (
    <Card>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        padding="3"
        cursor="pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Box display="flex" alignItems="center" gap="2">
          <Text fontWeight="bold" fontSize="base">
            {section.name}
          </Text>
          <Text color="neutral-textDisabled" fontSize="caption">
            ({totalChecks})
          </Text>
        </Box>
        <Box display="flex" alignItems="center" gap="2">
          {statusCounts.ready ? (
            <Tag appearance="success">
              ✓ {statusCounts.ready}
            </Tag>
          ) : null}
          {statusCounts.not_ready ? (
            <Tag appearance="danger">
              ✕ {statusCounts.not_ready}
            </Tag>
          ) : null}
          {statusCounts.pending ? (
            <Tag appearance="neutral">
              ○ {statusCounts.pending}
            </Tag>
          ) : null}
          {isOpen ? (
            <ChevronUpIcon size={16} />
          ) : (
            <ChevronDownIcon size={16} />
          )}
        </Box>
      </Box>

      {isOpen && (
        <Box>
          {section.subcategories.map((sub) => (
            <Box key={sub.id}>
              <Box
                padding="3"
                backgroundColor="neutral-surface"
              >
                <Text
                  fontWeight="bold"
                  fontSize="caption"
                  color="neutral-textDisabled"
                >
                  {sub.name.toUpperCase()}
                </Text>
              </Box>
              {sub.checks.map((check) => (
                <CheckRow
                  key={check.id}
                  check={check}
                  onStatusChange={onStatusChange}
                  onClick={onCheckClick}
                />
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}

import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Title,
  Text,
  Card,
  Button,
  Tag,
  Spinner,
} from "@nimbus-ds/components";
import { ChevronLeftIcon } from "@nimbus-ds/icons";
import { navigateHeader } from "@tiendanube/nexo";
import nexo from "../../nexoClient";
import { useChecklist, useUpdateCheckStatus } from "../../hooks/useChecklist";
import { ChecklistStatusBadge } from "../../components/StatusBadge";
import { SectionAccordion } from "../../components/SectionAccordion";
import { CheckDetailSidebar } from "../../components/CheckDetailSidebar";
import type { CheckStatus } from "../../types";

export function ChecklistResults() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: checklist, isLoading } = useChecklist(id!);
  const updateStatus = useUpdateCheckStatus(id!);
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);

  useEffect(() => {
    navigateHeader(nexo, { goTo: "/", text: t("results.back") });
  }, [t]);

  const handleStatusChange = useCallback(
    (checkId: string, status: CheckStatus) => {
      updateStatus.mutate({ checkId, status });
    },
    [updateStatus]
  );

  const handleCheckClick = useCallback((checkId: string) => {
    setSelectedCheckId(checkId);
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <Spinner size="large" />
      </Box>
    );
  }

  if (!checklist) {
    return (
      <Box padding="4" display="flex" flexDirection="column" gap="4">
        <Text>{t("results.notFound")}</Text>
        <Button onClick={() => navigate("/")}>{t("results.backToList")}</Button>
      </Box>
    );
  }

  return (
    <Box padding="4" display="flex" flexDirection="column" gap="4">
      <Button
        appearance="transparent"
        onClick={() => navigate("/")}
      >
        <ChevronLeftIcon size={16} />
        {t("results.backToList")}
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap="3">
          <Title as="h1">{checklist.name}</Title>
          <ChecklistStatusBadge status={checklist.status} />
        </Box>
        <Text fontSize="caption" color="neutral-textDisabled">
          {formatDate(checklist.createdAt)}
        </Text>
      </Box>

      <Card>
        <Card.Header title={t("results.legendTitle")} />
        <Card.Body>
          <Box display="flex" gap="4" flexWrap="wrap">
            <Box display="flex" alignItems="center" gap="2">
              <Tag appearance="success">{t("status.ready")}</Tag>
              <Text fontSize="caption">{t("results.legendReady")}</Text>
            </Box>
            <Box display="flex" alignItems="center" gap="2">
              <Tag appearance="danger">{t("status.not_ready")}</Tag>
              <Text fontSize="caption">{t("results.legendNotReady")}</Text>
            </Box>
            <Box display="flex" alignItems="center" gap="2">
              <Tag appearance="warning">{t("status.confirm_set_up")}</Tag>
              <Text fontSize="caption">{t("results.legendConfirm")}</Text>
            </Box>
            <Box display="flex" alignItems="center" gap="2">
              <Tag appearance="neutral">{t("status.check_manually")}</Tag>
              <Text fontSize="caption">{t("results.legendManual")}</Text>
            </Box>
          </Box>
        </Card.Body>
      </Card>

      {checklist.sections.map((section) => (
        <SectionAccordion
          key={section.id}
          section={section}
          onStatusChange={handleStatusChange}
          onCheckClick={handleCheckClick}
        />
      ))}

      {selectedCheckId && (
        <CheckDetailSidebar
          checklistId={id!}
          checkId={selectedCheckId}
          onClose={() => setSelectedCheckId(null)}
        />
      )}
    </Box>
  );
}

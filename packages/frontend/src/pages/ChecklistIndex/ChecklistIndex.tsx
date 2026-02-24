import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Card,
  Title,
  Text,
  Button,
  Input,
  Alert,
  Table,
  IconButton,
  Spinner,
} from "@nimbus-ds/components";
import { PlusCircleIcon, TrashIcon, SearchIcon } from "@nimbus-ds/icons";
import { useChecklists, useDeleteChecklist } from "../../hooks/useChecklists";
import { ChecklistStatusBadge } from "../../components/StatusBadge";
import { NewChecklistModal } from "../../components/NewChecklistModal";
import type { ChecklistSummary } from "../../types";

export function ChecklistIndex() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { data: checklists, isLoading } = useChecklists(
    search || undefined
  );
  const deleteMutation = useDeleteChecklist();

  const handleRowClick = useCallback(
    (id: string) => {
      navigate(`/checklists/${id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm(t("index.confirmDelete"))) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation, t]
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box padding="4" display="flex" flexDirection="column" gap="4">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Title as="h1">{t("index.title")}</Title>
        <Button appearance="primary" onClick={() => setShowModal(true)}>
          <PlusCircleIcon size={16} />
          {t("index.newChecklist")}
        </Button>
      </Box>

      <Alert appearance="warning" title={t("index.alertTitle")}>
        {t("index.alertDescription")}
      </Alert>

      <Card>
        <Card.Header>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Text fontWeight="bold">{t("index.allChecklists")}</Text>
            <Box width="280px">
              <Input
                type="search"
                placeholder={t("index.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                append={<SearchIcon size={16} />}
                appendPosition="start"
              />
            </Box>
          </Box>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              padding="6"
            >
              <Spinner size="large" />
            </Box>
          ) : !checklists?.length ? (
            <Box padding="6" display="flex" justifyContent="center">
              <Text color="neutral-textDisabled">
                {search
                  ? t("index.noResults")
                  : t("index.emptyState")}
              </Text>
            </Box>
          ) : (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Cell as="th">{t("index.colName")}</Table.Cell>
                  <Table.Cell as="th">{t("index.colTasks")}</Table.Cell>
                  <Table.Cell as="th">{t("index.colStatus")}</Table.Cell>
                  <Table.Cell as="th">{t("index.colCreated")}</Table.Cell>
                  <Table.Cell as="th" width="48px">{""}</Table.Cell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {checklists.map((cl: ChecklistSummary) => (
                  <Table.Row
                    key={cl.id}
                    onClick={() => handleRowClick(cl.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Cell>
                      <Text fontWeight="medium">{cl.name}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text>{cl.taskCount}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <ChecklistStatusBadge status={cl.status} />
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="caption">
                        {formatDate(cl.createdAt)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <IconButton
                        source={<TrashIcon size={16} />}
                        size="2rem"
                        onClick={(e: React.MouseEvent) =>
                          handleDelete(e, cl.id)
                        }
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Body>
      </Card>

      {showModal && (
        <NewChecklistModal onClose={() => setShowModal(false)} />
      )}
    </Box>
  );
}

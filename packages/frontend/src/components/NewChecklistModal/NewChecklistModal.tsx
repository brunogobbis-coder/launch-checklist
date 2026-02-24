import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Box,
  Input,
  Button,
  Text,
  Checkbox,
  Spinner,
  Label,
} from "@nimbus-ds/components";
import { ChevronDownIcon, ChevronUpIcon } from "@nimbus-ds/icons";
import { useRegistry } from "../../hooks/useRegistry";
import { useCreateChecklist } from "../../hooks/useChecklists";
import type { RegistrySection } from "../../types";

interface Props {
  onClose: () => void;
}

export function NewChecklistModal({ onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: sections, isLoading } = useRegistry();
  const createMutation = useCreateChecklist();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const allCheckTypes = useMemo(() => {
    if (!sections) return [];
    return sections.flatMap((s) =>
      s.subcategories.flatMap((sub) => sub.checks.map((c) => c.checkType))
    );
  }, [sections]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
      return next;
    });
  }, []);

  const getSectionCheckTypes = useCallback(
    (section: RegistrySection) =>
      section.subcategories.flatMap((sub) =>
        sub.checks.map((c) => c.checkType)
      ),
    []
  );

  const toggleSectionAll = useCallback(
    (section: RegistrySection) => {
      const types = getSectionCheckTypes(section);
      const allSelected = types.every((ct) => selected.has(ct));
      setSelected((prev) => {
        const next = new Set(prev);
        if (allSelected) {
          types.forEach((ct) => next.delete(ct));
        } else {
          types.forEach((ct) => next.add(ct));
        }
        return next;
      });
    },
    [selected, getSectionCheckTypes]
  );

  const toggleCheck = useCallback((checkType: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(checkType) ? next.delete(checkType) : next.add(checkType);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selected.size === allCheckTypes.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allCheckTypes));
    }
  }, [allCheckTypes, selected.size]);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || selected.size === 0) return;
    const result = await createMutation.mutateAsync({
      name: name.trim(),
      checkTypes: Array.from(selected),
    });
    onClose();
    navigate(`/checklists/${result.id}`);
  }, [name, selected, createMutation, onClose, navigate]);

  return (
    <Modal open onDismiss={onClose}>
      <Modal.Header title={t("modal.title")} />
      <Modal.Body padding="none">
        <Box padding="4" display="flex" flexDirection="column" gap="4">
          <Box display="flex" flexDirection="column" gap="1">
            <Label htmlFor="checklist-name">{t("modal.nameLabel")}</Label>
            <Input
              id="checklist-name"
              placeholder={t("modal.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold">{t("modal.selectChecks")}</Text>
            <Button appearance="transparent" onClick={selectAll}>
              {selected.size === allCheckTypes.length
                ? t("modal.deselectAll")
                : t("modal.selectAll")}
            </Button>
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" padding="4">
              <Spinner size="large" />
            </Box>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              gap="2"
              maxHeight="400px"
              overflow="auto"
            >
              {sections?.map((section) => {
                const sectionTypes = getSectionCheckTypes(section);
                const selectedCount = sectionTypes.filter((ct) =>
                  selected.has(ct)
                ).length;
                const isExpanded = expanded.has(section.id);
                const allSectionSelected =
                  selectedCount === sectionTypes.length;

                return (
                  <Box key={section.id}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap="2"
                      padding="2"
                      borderColor="neutral-surfaceHighlight"
                      borderStyle="solid"
                      borderWidth="1"
                      borderRadius="2"
                      cursor="pointer"
                      onClick={() => toggleSection(section.id)}
                    >
                      <Checkbox
                        name={`section-${section.id}`}
                        checked={allSectionSelected}
                        onChange={() => toggleSectionAll(section)}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      />
                      <Box flex="1">
                        <Text fontWeight="bold">
                          {section.name}{" "}
                          <Text as="span" color="neutral-textDisabled">
                            ({selectedCount}/{sectionTypes.length})
                          </Text>
                        </Text>
                      </Box>
                      {isExpanded ? (
                        <ChevronUpIcon size={16} />
                      ) : (
                        <ChevronDownIcon size={16} />
                      )}
                    </Box>

                    {isExpanded && (
                      <Box paddingLeft="6" paddingTop="2">
                        {section.subcategories.map((sub) => (
                          <Box key={sub.id} paddingBottom="2">
                            <Text
                              fontSize="caption"
                              fontWeight="bold"
                              color="neutral-textDisabled"
                            >
                              {sub.name.toUpperCase()}
                            </Text>
                            {sub.checks.map((check) => (
                              <Box
                                key={check.checkType}
                                display="flex"
                                alignItems="flex-start"
                                gap="2"
                                paddingTop="1"
                                paddingBottom="1"
                              >
                                <Checkbox
                                  name={check.checkType}
                                  checked={selected.has(check.checkType)}
                                  onChange={() =>
                                    toggleCheck(check.checkType)
                                  }
                                />
                                <Box>
                                  <Text fontSize="base">
                                    {check.displayName}
                                  </Text>
                                  <Text
                                    fontSize="caption"
                                    color="neutral-textDisabled"
                                  >
                                    {check.description}
                                  </Text>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Modal.Body>
      <Modal.Footer>
        <Box display="flex" gap="2" justifyContent="flex-end">
          <Button onClick={onClose}>{t("modal.cancel")}</Button>
          <Button
            appearance="primary"
            onClick={handleCreate}
            disabled={
              !name.trim() ||
              selected.size === 0 ||
              createMutation.isPending
            }
          >
            {createMutation.isPending
              ? t("modal.creating")
              : t("modal.start")}
          </Button>
        </Box>
      </Modal.Footer>
    </Modal>
  );
}

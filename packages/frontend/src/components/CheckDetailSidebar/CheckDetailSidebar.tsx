import { useTranslation } from "react-i18next";
import {
  Sidebar,
  Box,
  Title,
  Text,
  Accordion,
  Link,
  Spinner,
  List,
} from "@nimbus-ds/components";
import { ExternalLinkIcon } from "@nimbus-ds/icons";
import { CheckStatusBadge } from "../StatusBadge";
import { useCheckDetail } from "../../hooks/useCheckDetail";

interface Props {
  checklistId: string;
  checkId: string;
  onClose: () => void;
}

export function CheckDetailSidebar({ checklistId, checkId, onClose }: Props) {
  const { t } = useTranslation();
  const { data: detail, isLoading } = useCheckDetail(checklistId, checkId);

  return (
    <Sidebar open onRemove={onClose} position="right" maxWidth="480px">
      <Sidebar.Header title={detail?.displayName ?? t("sidebar.loading")} />
      <Sidebar.Body>
        {isLoading || !detail ? (
          <Box display="flex" justifyContent="center" padding="6">
            <Spinner size="large" />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap="4" padding="2">
            <Box display="flex" alignItems="center" gap="2">
              <CheckStatusBadge status={detail.status} />
              <Text color="neutral-textDisabled" fontSize="caption">
                {detail.checkType}
              </Text>
            </Box>

            <Text>{detail.description}</Text>

            <Box
              padding="3"
              backgroundColor="neutral-surface"
              borderRadius="2"
            >
              <Text>{detail.assessment}</Text>
            </Box>

            <Accordion>
              <Accordion.Item index="0">
                <Accordion.Header>
                  <Title as="h4">{t("sidebar.findings")}</Title>
                </Accordion.Header>
                <Accordion.Body>
                  {detail.detailedFindings ? (
                    <Text>
                      {JSON.stringify(detail.detailedFindings, null, 2)}
                    </Text>
                  ) : (
                    <Text color="neutral-textDisabled">
                      {t("sidebar.noFindings")}
                    </Text>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item index="1">
                <Accordion.Header>
                  <Title as="h4">{t("sidebar.impact")}</Title>
                </Accordion.Header>
                <Accordion.Body>
                  <Text>{detail.businessImpact}</Text>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item index="2">
                <Accordion.Header>
                  <Title as="h4">{t("sidebar.recommendations")}</Title>
                </Accordion.Header>
                <Accordion.Body>
                  <List>
                    {detail.recommendations.map((rec, i) => (
                      <List.Item key={i}>{rec}</List.Item>
                    ))}
                  </List>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item index="3">
                <Accordion.Header>
                  <Title as="h4">{t("sidebar.links")}</Title>
                </Accordion.Header>
                <Accordion.Body>
                  <Box display="flex" flexDirection="column" gap="2">
                    {detail.usefulLinks.map((link, i) => (
                      <Link
                        key={i}
                        as="a"
                        href={link.url}
                        target="_blank"
                        appearance="primary"
                      >
                        {link.title}
                        <ExternalLinkIcon size={12} />
                      </Link>
                    ))}
                  </Box>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Box>
        )}
      </Sidebar.Body>
    </Sidebar>
  );
}

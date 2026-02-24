import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export interface UsefulLink {
  title: string;
  url: string;
}

export interface CheckDefinition {
  check_type: string;
  section: string;
  subcategory: string;
  display_name: string;
  description: string;
  execution_mode: "manual" | "automated";
  default_assessment: string;
  business_impact: string;
  recommendations: string[];
  useful_links: UsefulLink[];
}

export interface SectionMeta {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
    checks: string[];
  }[];
}

const SECTION_DISPLAY: Record<string, string> = {
  store_data: "Dados da loja",
  admin_settings: "Configurações do admin",
  front_end: "Front-end",
  b2b: "B2B",
  pos: "Ponto de venda (PDV)",
};

const SUBCATEGORY_DISPLAY: Record<string, string> = {
  customers: "Clientes",
  orders: "Pedidos",
  products: "Produtos",
  apps: "Aplicativos",
  checkout: "Checkout",
  domains: "Domínios",
  email: "E-mail",
  languages: "Idiomas",
  locations: "Locais",
  organization: "Organização",
  payments: "Pagamentos",
  policies: "Políticas",
  shipping: "Envio",
  staff: "Equipe",
  ownership: "Propriedade",
  experience: "Experiência",
  redirects: "Redirecionamentos",
  seo: "SEO",
  tracking: "Rastreamento",
  checkout_experience: "Experiência de checkout",
  customer_accounts: "Contas de clientes",
  pricing: "Preços",
  configuration: "Configuração",
  fulfillment: "Fulfillment",
};

const SECTION_ORDER = [
  "store_data",
  "admin_settings",
  "front_end",
  "b2b",
  "pos",
];

const registry = new Map<string, CheckDefinition>();
let sections: SectionMeta[] = [];

function loadDefinitions(): void {
  const defsRoot = path.join(__dirname, "definitions");
  const dirs = fs.readdirSync(defsRoot, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const sectionDir = path.join(defsRoot, dir.name);
    const files = fs.readdirSync(sectionDir).filter((f) => f.endsWith(".yaml"));

    for (const file of files) {
      const content = fs.readFileSync(path.join(sectionDir, file), "utf-8");
      const def = yaml.load(content) as CheckDefinition;
      registry.set(def.check_type, def);
    }
  }

  buildSections();
}

function buildSections(): void {
  const grouped = new Map<string, Map<string, string[]>>();

  for (const [checkType, def] of registry) {
    if (!grouped.has(def.section)) {
      grouped.set(def.section, new Map());
    }
    const sectionMap = grouped.get(def.section)!;
    if (!sectionMap.has(def.subcategory)) {
      sectionMap.set(def.subcategory, []);
    }
    sectionMap.get(def.subcategory)!.push(checkType);
  }

  sections = SECTION_ORDER.filter((s) => grouped.has(s)).map((sectionId) => {
    const subcats = grouped.get(sectionId)!;
    return {
      id: sectionId,
      name: SECTION_DISPLAY[sectionId] ?? sectionId,
      subcategories: Array.from(subcats.entries()).map(([subId, checks]) => ({
        id: subId,
        name: SUBCATEGORY_DISPLAY[subId] ?? subId,
        checks,
      })),
    };
  });
}

export function getCheckDefinition(
  checkType: string
): CheckDefinition | undefined {
  return registry.get(checkType);
}

export function getAllCheckTypes(): string[] {
  return Array.from(registry.keys());
}

export function getAllDefinitions(): CheckDefinition[] {
  return Array.from(registry.values());
}

export function getSections(): SectionMeta[] {
  return sections;
}

export function getChecksBySection(sectionId: string): CheckDefinition[] {
  return Array.from(registry.values()).filter((d) => d.section === sectionId);
}

loadDefinitions();

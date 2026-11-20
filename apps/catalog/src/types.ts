export interface IconRecord {
  id: string;
  exportName: string;
  exportAliases: string[];
  name: string;
  label: { en: string; zh: string };
  description: { en: string; zh: string };
  category: string;
  tags: string[];
  actions: string[];
  aliasOf?: string;
  path: string;
  naming: { status: 'draft' | 'confirmed'; candidates: string[]; notes: string };
  source: {
    kind: 'unreviewed' | 'original' | 'mdi-alias' | 'mdi-derived' | 'game-derived';
    license: string | null;
    reviewed: boolean;
    repository?: string;
    file: string;
    commit?: string;
    collection?: string;
    sha256?: string;
    mdiName?: string;
    mdiExport?: string;
    version?: string;
    referenceVersion?: string;
    referenceVersionEvidence?: string;
    author?: string;
    authorEvidence?: string;
    url?: string;
    modified?: boolean;
    changes?: string;
    reference?: string;
    adaptation?: 'redrawn' | 'processed';
    additionalSources?: {
      kind: 'mdi-derived';
      mdiName: string;
      mdiExport?: string;
      modified: true;
      license: string | null;
      reviewed: boolean;
      changes?: string;
      version?: string;
      referenceVersion?: string;
      referenceVersionEvidence?: string;
      author?: string;
      authorEvidence?: string;
      url?: string;
    }[];
  };
  designSources?: { collection: string; file: string; sha256: string }[];
}
export interface Catalog {
  schemaVersion: number;
  version: string;
  revision: string;
  packageName: string;
  reviewMigration?: { fromRevision: string; eligibleIds: string[] };
  reviewApplication?: { fromRevision: string; appliedIds: string[]; removedIds: string[] };
  redirects?: Record<string, string>;
  icons: IconRecord[];
}
export interface NamingEdit {
  exportName: string;
  candidates: string[];
  status: 'draft' | 'confirmed';
  notes: string;
}

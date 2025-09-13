// Definisikan tipe untuk data terstruktur di sidebar
export interface ProjectData {
  id: string;
  title: string;
  problem_statement?: string;
  target_audience?: { icon: string; text: string }[];
  success_metrics?: { type: string; text: string }[];
  tech_stack?: string[];
  tags?: string[];
  is_starred: boolean;
  last_activity: string;
  status: string;
  priority: string;
  cover_image_url?: string;
  repo_url?: string;
  live_url?: string;
  created_at: Date;
}

// Definisikan tipe untuk konten workbench
export interface WorkbenchContent {
  markdown: string;
}

// Gabungkan keduanya menjadi satu tipe utama untuk detail ide
export interface IdeaDetail extends ProjectData {
  workbenchContent: WorkbenchContent | null;
}

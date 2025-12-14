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
  workbenchContent?: { markdown: string } | null;
}

// Definisikan tipe untuk konten workbench
export interface WorkbenchContent {
  markdown: string;
}

// Gabungkan keduanya menjadi satu tipe utama untuk detail ide
export interface IdeaDetail extends ProjectData {
  workbenchContent: WorkbenchContent | null;
  hasSchema?: boolean;
}

export type FullProject = ProjectData;

// --- PERBAIKAN: Tambahkan 'export' pada Column dan Table ---
export interface Column {
  name: string;
  type: string;
  is_primary_key?: boolean;
  foreign_key_to?: string;
}

export interface Table {
  table_name: string;
  columns: Column[];
}

export interface SchemaResponse {
  schema: Table[];
}
// --- AKHIR PERBAIKAN ---

export type ProjectCardProps = {
  id: string;
  type: "default" | "internal";
  title: string;
  description?: string;
  avatars: string[];
  lastActivity: string;
  isStarred: boolean;
  isFloating?: boolean;
  tags?: string[];
};

export interface Idea {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  tags: string[];
  isStarred: boolean;
  lastActivity: string | null;
  status: "Idea" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  tech_stack: string[];
  cover_image_url?: string;
  repo_url?: string;
  live_url?: string;
}

// AI Interview Display
export interface ConversationTurn {
  question: string;
  answer: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IdeaOption {
  projectName: string;
  projectDescription: string;
  reasonProjectName: string;
  uniqueSellingProposition: string;
  mvpFeatures: string[];
}

export interface GeneratedBlueprint {
  projectData: {
    title: string;
    title_reason: string;
    problem_statement: string;
    target_audience: { icon: string; text: string }[];
    success_metrics: { type: string; text: string }[];
    tech_stack: string[];
  };
  workbenchContent: string;
}

export type InterviewStep =
  | "initial"
  | "interviewing"
  | "showOptions"
  | "generating"
  | "result";

export interface InterviewSessionState {
  interest: string;
  conversationHistory: ConversationTurn[];
  currentQuestion: string;
  ideaOptions: IdeaOption[];
  generatedBlueprint: GeneratedBlueprint | null;
  messages: ChatMessage[]; // Chat format for UI
}

export interface HeadingItem {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

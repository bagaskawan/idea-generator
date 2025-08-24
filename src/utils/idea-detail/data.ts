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

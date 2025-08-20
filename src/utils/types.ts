export interface DataItem {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  tags: string[];
  isStarred: boolean;
  lastActivity: string;
  status: string;
  priority: string;
  tech_stack: string[];
  cover_image_url: string;
  repo_url: string;
  live_url: string;
}

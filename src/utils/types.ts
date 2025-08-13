export interface DataItem {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  tags: string[];
  isStarred: boolean;
  lastActivity: string;
}

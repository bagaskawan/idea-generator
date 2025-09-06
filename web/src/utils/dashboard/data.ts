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

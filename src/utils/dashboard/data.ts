export type ProjectCardProps = {
  type: "default" | "internal";
  title: string;
  description?: string;
  avatars: string[];
  lastActivity: string;
  isStarred: boolean;
  isFloating?: boolean;
};

export const projects: ProjectCardProps[] = [
  {
    type: "default",
    title: "Video Campaign",
    description: "Application Concept\nWebsite Concept",
    avatars: ["", ""],
    lastActivity: "Active recently",
    isStarred: true,
  },
  {
    type: "default",
    title: "NPS",
    description: "Statistics and Overview\nnps@gmail.com",
    avatars: ["", ""],
    lastActivity: "1 day ago",
    isStarred: true,
  },
  {
    type: "internal",
    title: "Internal",
    avatars: ["", "", ""],
    lastActivity: "1 day ago",
    isStarred: true,
  },
  {
    type: "default",
    title: "Growth Hacking",
    description: "Ideas, challenges and tests",
    avatars: ["", ""],
    lastActivity: "2 days ago",
    isStarred: false,
  },
  {
    type: "default",
    title: "Product Marketing",
    description: "All things marketing",
    avatars: ["", ""],
    lastActivity: "1 week ago",
    isStarred: false,
  },
  {
    type: "default",
    title: "Mobile App Design",
    description: "Prototypes, mockups, client and collaboration",
    avatars: ["", ""],
    lastActivity: "1 week ago",
    isStarred: false,
    isFloating: true,
  },
];

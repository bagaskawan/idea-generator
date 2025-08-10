export type ProjectCardProps = {
  type: "default" | "internal";
  title: string;
  description?: string;
  avatars: string[];
  lastActivity: string;
  isStarred: boolean;
  isFloating?: boolean;
  tags?: string[];
};

export const projects: ProjectCardProps[] = [
  {
    type: "default",
    title: "Video Campaign",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    avatars: ["", ""],
    lastActivity: "Active recently",
    isStarred: true,
    tags: ["Mobile", "Web", "IoT"],
  },
  {
    type: "default",
    title: "NPS",
    description: "Statistics and Overview\nnps@gmail.com",
    avatars: ["", ""],
    lastActivity: "1 day ago",
    isStarred: true,
    tags: ["Mobile", "Web", "IoT"],
  },
  {
    type: "internal",
    title: "Internal",
    avatars: ["", "", ""],
    lastActivity: "1 day ago",
    isStarred: true,
    tags: ["Mobile", "Web", "IoT"],
  },
  {
    type: "default",
    title: "Product Marketing",
    description: "All things marketing",
    avatars: ["", ""],
    lastActivity: "1 week ago",
    isStarred: false,
    tags: ["Mobile", "Web", "IoT"],
  },
  {
    type: "default",
    title: "Mobile App Design",
    description: "Prototypes, mockups, client and collaboration",
    avatars: ["", ""],
    lastActivity: "1 week ago",
    isStarred: false,
    tags: ["Mobile", "Web", "IoT"],
  },
];

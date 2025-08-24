import { Idea } from "@/types/idea";

interface Props {
  idea: Idea;
  setIdea: React.Dispatch<React.SetStateAction<Idea | null>>;
}

export default function IdeaHeader({ idea }: Props) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">{idea.name}</h1>
      <span className="px-3 py-1 text-sm rounded bg-gray-200">
        {idea.status}
      </span>
    </div>
  );
}

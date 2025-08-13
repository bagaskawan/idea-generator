import IdeaDetailView from "@/components/idea/IdeaDetailView";
import { FullScreenModalWrapper } from "@/components/ui/FullScreenModalWrapper";

type PageProps = {
  params: {
    id: string;
  };
};

// This is a Server Component
export default function IdeaDetailPage({ params }: PageProps) {
  const { id } = params;

  // We pass the id to the client component that handles data fetching and state.
  return (
    <FullScreenModalWrapper>
      <IdeaDetailView id={id} />
    </FullScreenModalWrapper>
  );
}

import IdeaDetailView from "@/components/idea/IdeaDetailView";
import { FullScreenModalWrapper } from "@/components/ui/FullScreenModalWrapper";

// This is a Server Component
export default async function IdeaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // We pass the id to the client component that handles data fetching and state.
  return (
    <FullScreenModalWrapper>
      <IdeaDetailView id={id} />
    </FullScreenModalWrapper>
  );
}

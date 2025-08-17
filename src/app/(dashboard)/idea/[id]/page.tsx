import IdeaDetailView from "@/components/idea/IdeaDetailView";
import { FullScreenModalWrapper } from "@/components/ui/FullScreenModalWrapper";

type IdeaDetailPageProps = {
  params: { id: string };
};

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const { id } = await params;
  if (!id) return <div>Data Projek tidak ditemukan</div>;

  return (
    <FullScreenModalWrapper>
      <IdeaDetailView id={id} />
    </FullScreenModalWrapper>
  );
}

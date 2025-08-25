import IdeaDetailView from "@/components/idea/detail/IdeaDetailView";
import { FullScreenModalWrapper } from "@/components/ui/FullScreenModalWrapper";

type IdeaDetailPageProps = {
  params: { id: string };
};

export default function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const { id } = params;
  if (!id) return <div>Data Projek tidak ditemukan</div>;

  return (
    <FullScreenModalWrapper>
      <IdeaDetailView id={id} />
    </FullScreenModalWrapper>
  );
}

import IdeaDetailView from "@/components/modules/idea-detail/IdeaDetailView";
import { FullScreenModalWrapper } from "@/components/shared/ui/FullScreenModalWrapper";

type IdeaDetailPageProps = {
  params: { id: string };
};

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const { id } = await params;
  if (!id) return <div>Data Projek tidak ditemukan</div>;

  return (
    <FullScreenModalWrapper>
      <div className="mt-18">
        <IdeaDetailView id={id} />
      </div>
    </FullScreenModalWrapper>
  );
}

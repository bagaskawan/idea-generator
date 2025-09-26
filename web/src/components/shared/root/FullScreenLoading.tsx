export default function FullScreenLoading({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <p className="mt-4 text-lg text-foreground">{text}</p>
    </div>
  );
}

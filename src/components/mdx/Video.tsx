interface VideoProps {
  src: string;
  title?: string;
}

export function Video({ src, title = "Video" }: VideoProps) {
  return (
    <div className="my-4 not-prose">
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={src}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

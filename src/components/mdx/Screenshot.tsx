interface ScreenshotProps {
  src: string;
  alt: string;
  caption?: string;
}

export function Screenshot({ src, alt, caption }: ScreenshotProps) {
  return (
    <figure className="my-4 not-prose">
      <img
        src={src}
        alt={alt}
        className="rounded-lg border border-gray-200 shadow-sm w-full"
      />
      {caption && (
        <figcaption className="mt-2 text-xs text-gray-500 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  src: string | null;
  alt: string;
  label: string;
  aspectRatio: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  rounded?: string;
}

export function PlaceholderImage({
  src,
  alt,
  label,
  aspectRatio,
  sizes = "(min-width: 768px) 33vw, 100vw",
  priority = false,
  className,
  rounded = "rounded-2xl",
}: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        rounded,
        !src &&
          "flex items-center justify-center border-2 border-dashed border-accent/25 bg-gradient-to-br from-accent-soft via-surface to-lime/15",
        className
      )}
      style={{ aspectRatio }}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <ImageIcon aria-hidden="true" className="h-8 w-8 text-accent-hover/60" strokeWidth={1.5} />
          <p className="text-sm font-medium text-muted">{label}</p>
        </div>
      )}
    </div>
  );
}

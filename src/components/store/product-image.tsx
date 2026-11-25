"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";

function ImageState(props: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        role="img"
        aria-label={`${props.alt || "Photo"} : image indisponible`}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary p-2 text-center text-xs text-muted-foreground"
      >
        <ImageOff size={24} aria-hidden="true" />
        <span>Photo indisponible</span>
      </div>
    );
  return (
    <>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[inherit] bg-secondary motion-safe:animate-pulse"
        />
      )}
      <Image
        {...props}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}

export default function ProductImage(props: ImageProps) {
  return (
    <ImageState
      key={typeof props.src === "string" ? props.src : props.alt}
      {...props}
    />
  );
}

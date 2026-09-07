/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";

export default function Lightbox({ src, alt, onClose }: { src: string | null; alt?: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!src || !element) return;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => { element.close(); document.body.style.overflow = previousOverflow; };
  }, [src]);

  return <dialog ref={dialog} className="image-dialog" aria-label={alt ? `Enlarged image: ${alt}` : "Enlarged image"}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <button type="button" onClick={onClose} className="image-dialog-close" aria-label="Close image">Close ×</button>
    {src && <img src={src} alt={alt ?? ""} />}
  </dialog>;
}

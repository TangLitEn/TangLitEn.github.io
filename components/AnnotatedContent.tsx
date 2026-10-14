"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Lightbox from "./Lightbox";

export default function AnnotatedContent({ children, className }: { children: ReactNode; className?: string }) {
  const container = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [note, setNote] = useState<{ title: string; html: string } | null>(null);
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!note || !element) return;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [note]);

  const openImage = (target: Element) => {
    if (!(target instanceof HTMLImageElement) || target.closest("a")) return;
    setImage({ src: target.src, alt: target.alt });
  };

  return <article ref={container} className={className} onKeyDown={(event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target instanceof HTMLImageElement) {
      event.preventDefault();
      openImage(event.target);
    }
  }} onClick={(event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>("button[data-note]");
    if (button) {
      const template = Array.from(container.current!.querySelectorAll<HTMLTemplateElement>("template[id]"))
        .find((item) => item.id === button.dataset.note);
      if (!template) return;
      trigger.current = button;
      setNote({ title: template.dataset.noteTitle ?? "Note", html: template.innerHTML });
      return;
    }
    openImage(target);
  }}>
    {children}
    <dialog ref={dialog} className="note-dialog" aria-label={note?.title ?? "Note"}
      onCancel={(event) => { event.preventDefault(); setNote(null); }}
      onClick={(event) => { if (event.target === event.currentTarget) setNote(null); }}>
      <div className="note-dialog-panel">
        <header className="note-dialog-heading">
          <span>{note?.title}</span>
          <button type="button" autoFocus onClick={() => setNote(null)} aria-label="Close note">Close ×</button>
        </header>
        {note && <div className="post-content note-dialog-content" dangerouslySetInnerHTML={{ __html: note.html }} />}
      </div>
    </dialog>
    <Lightbox src={image?.src ?? null} alt={image?.alt} onClose={() => setImage(null)} />
  </article>;
}

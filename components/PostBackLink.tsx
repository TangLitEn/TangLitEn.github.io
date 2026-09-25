"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPostReturnHref } from "../lib/post-navigation";

export default function PostBackLink({ slug }: { slug: string }) {
  const router = useRouter();
  return <Link className="back-link" href="/#posts" onClick={(event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    router.push(getPostReturnHref(slug));
  }}>← Back to previous page</Link>;
}

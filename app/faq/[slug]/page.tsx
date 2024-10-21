import { posts } from "@/.velite";
import { MDXContent } from "@/components/mdx-content";
import { notFound } from "next/navigation";

const slugify = (s: string) => s.replace(/\s+/g, "-").toLowerCase();

export default function Post({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const post = posts.find((i) => {
    return slugify(i.title) === slug;
  });
  if (!post) return notFound();
  return (
    <article className="prose">
      <h1>{post.title}</h1>
      <MDXContent code={post.code} components={{}} />
    </article>
  );
}

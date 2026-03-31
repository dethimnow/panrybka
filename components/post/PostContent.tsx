export function PostContent({ html }: { html: string }) {
  return (
    <div
      id="article-content"
      className="article-body mx-auto max-w-3xl px-4 py-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

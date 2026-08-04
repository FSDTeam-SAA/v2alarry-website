import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type AssistantMessageProps = {
  content: string;
  isStreaming: boolean;
};

export function AssistantMessage({
  content,
  isStreaming,
}: AssistantMessageProps) {
  if (isStreaming) {
    return <p className="coaching-message-plain">{content}</p>;
  }

  return (
    <ReactMarkdown
      components={{
        a: ({ children, ...props }) => (
          <a {...props} rel="noreferrer noopener" target="_blank">
            {children}
          </a>
        ),
        img: () => null,
      }}
      rehypePlugins={[rehypeSanitize]}
      remarkPlugins={[remarkGfm]}
      skipHtml
    >
      {content}
    </ReactMarkdown>
  );
}

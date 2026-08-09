import { render, screen } from "@testing-library/react";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: jest.fn(({ children }: { children: string }) => (
    <div data-testid="markdown">{children}</div>
  )),
}));
jest.mock("remark-gfm", () => ({ __esModule: true, default: "remark-gfm" }));
jest.mock("rehype-sanitize", () => ({
  __esModule: true,
  default: "rehype-sanitize",
}));

import { AssistantMessage } from "./AssistantMessage";
import ReactMarkdown from "react-markdown";

const mockedReactMarkdown = jest.mocked(ReactMarkdown);

describe("AssistantMessage", () => {
  const markdown =
    "## A practical next step\n\nUse **clear language**.\n\n- Prepare your examples\n- Ask one question\n\n> Keep the conversation focused.\n\n<script>alert('unsafe')</script>";

  it("delegates completed assistant responses to sanitized markdown rendering", () => {
    render(<AssistantMessage content={markdown} isStreaming={false} />);

    expect(screen.getByTestId("markdown")).toHaveTextContent(
      "A practical next step",
    );
    expect(mockedReactMarkdown).toHaveBeenCalledWith(
      expect.objectContaining({
        rehypePlugins: expect.any(Array),
        remarkPlugins: expect.any(Array),
        skipHtml: true,
      }),
      undefined,
    );
  });

  it("renders streaming content with the same safe markdown pipeline", () => {
    render(<AssistantMessage content={"**Still streaming"} isStreaming />);

    expect(screen.getByTestId("markdown")).toHaveTextContent("Still streaming");
    expect(mockedReactMarkdown).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rehypePlugins: expect.any(Array),
        remarkPlugins: expect.any(Array),
        skipHtml: true,
      }),
      undefined,
    );
  });
});

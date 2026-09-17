import { fireEvent, render, screen } from "@testing-library/react";
import { KnowledgeBasePage } from "./KnowledgeBasePage";

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/knowledge-base",
}));
jest.mock("next/link", () => {
  function NextLinkMock({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  }

  return NextLinkMock;
});
jest.mock("../hooks/useDocuments", () => ({
  useDocuments: () => ({
    isLoading: false,
    isError: false,
    data: [],
    refetch: jest.fn(),
  }),
  useDocumentMutations: () => ({
    upload: { mutateAsync: jest.fn(), isPending: false },
    remove: { mutateAsync: jest.fn(), isPending: false },
  }),
}));
jest.mock("../hooks/useProfile", () => ({
  useProfile: () => ({
    data: { fullName: "Test Admin", role: "admin" },
  }),
}));
jest.mock("../hooks/useUsers", () => ({
  useUsers: () => ({
    isLoading: false,
    data: [
      {
        id: "1",
        name: "Test Candidate",
        email: "candidate@example.com",
        registeredAt: "Oct 12, 2023",
        lastActive: "Active",
        sessions: 5,
      },
    ],
  }),
}));

describe("KnowledgeBasePage", () => {
  it("opens the upload dialog", () => {
    render(<KnowledgeBasePage />);
    fireEvent.click(screen.getByRole("button", { name: /upload document/i }));
    expect(
      screen.getByRole("dialog", { name: "Upload Document" }),
    ).toBeInTheDocument();
  });
});

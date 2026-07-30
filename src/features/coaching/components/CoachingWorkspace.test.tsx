import { act, fireEvent, render, screen } from "@testing-library/react";

import { CoachingWorkspace } from "./CoachingWorkspace";

jest.mock("next/image", () => ({
  __esModule: true,
  default: () => null,
}));

describe("CoachingWorkspace", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function renderWorkspace() {
    const renderResult = render(<CoachingWorkspace />);

    act(() => {
      jest.advanceTimersByTime(0);
    });

    return renderResult;
  }

  it("filters sessions and opens the selected conversation", () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole("button", { name: "Search Sessions" }));
    fireEvent.change(screen.getByLabelText("Search coaching sessions"), {
      target: { value: "feedback" },
    });

    expect(
      screen.getByRole("button", { name: /giving tough feedback/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /leading through change/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /giving tough feedback/i }),
    );

    expect(
      screen.getByRole("heading", { name: "Giving Tough Feedback" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/make the conversation direct and constructive/i),
    ).toBeInTheDocument();
  });

  it("creates a locally persisted session and returns a coaching prompt", () => {
    renderWorkspace();

    fireEvent.change(screen.getByLabelText("What would you like to explore?"), {
      target: { value: "I'm facing a tough decision at work." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Start coaching conversation" }),
    );

    expect(
      screen.getByText("I'm facing a tough decision at work."),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle("I'm facing a tough decision…"),
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(550);
    });

    expect(
      screen.getByText(/two or three options you are weighing/i),
    ).toBeInTheDocument();
  });

  it("adds a selected file to the outgoing message", () => {
    const { container } = renderWorkspace();
    const attachmentInput =
      container.querySelector<HTMLInputElement>("input[type='file']");

    if (!attachmentInput) {
      throw new Error("Expected an attachment input");
    }

    fireEvent.change(attachmentInput, {
      target: {
        files: [new File(["notes"], "team-notes.txt", { type: "text/plain" })],
      },
    });

    expect(screen.getByText("team-notes.txt")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Start coaching conversation" }),
    );

    expect(
      screen.getByText("Shared a file for reflection."),
    ).toBeInTheDocument();
  });
});

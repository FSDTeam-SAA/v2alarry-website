import { act, render, screen } from "@testing-library/react";

import { AuthVisual } from "./AuthVisual";

describe("AuthVisual", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: jest.fn().mockReturnValue({ matches: false }),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("cycles the visual prompt and statement", () => {
    render(
      <AuthVisual prompt="Initial prompt" statement="Initial statement" />,
    );

    act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(
      screen.getByText("Lead with greater intention."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Progress compounds with reflection."),
    ).toBeInTheDocument();
  });
});

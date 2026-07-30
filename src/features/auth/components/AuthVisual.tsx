"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

type AuthVisualProps = {
  prompt: string;
  statement: string;
};

const prompts = [
  "Lead with greater intention.",
  "A clearer path starts here.",
  "Your next breakthrough awaits.",
];

const statements = [
  "Progress compounds with reflection.",
  "Turn insight into meaningful action.",
  "Build momentum with every conversation.",
];

export function AuthVisual({ prompt, statement }: AuthVisualProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const copy = [
    { prompt, statement },
    ...prompts.map((nextPrompt, index) => ({
      prompt: nextPrompt,
      statement: statements[index],
    })),
  ];
  const currentCopy = copy[messageIndex];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % copy.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [copy.length]);

  return (
    <aside aria-hidden="true" className="auth-visual">
      <div className="auth-visual-orb auth-visual-orb-top" />
      <div className="auth-visual-orb auth-visual-orb-bottom" />
      <div className="auth-visual-prompt">
        <span className="auth-visual-copy" key={`prompt-${messageIndex}`}>
          {currentCopy.prompt}
        </span>
        <span className="auth-send-icon">
          <ArrowUp aria-hidden="true" size={16} strokeWidth={2.25} />
        </span>
      </div>
      <p
        className="auth-visual-statement auth-visual-copy"
        key={`statement-${messageIndex}`}
      >
        {currentCopy.statement}
      </p>
    </aside>
  );
}

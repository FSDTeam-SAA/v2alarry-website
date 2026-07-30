import Image from "next/image";
import type { ReactNode } from "react";

import { AuthVisual } from "./AuthVisual";

type AuthShellProps = {
  children: ReactNode;
  visualPosition: "start" | "end";
  prompt: string;
  statement: string;
};

function BrandLogo() {
  return (
    <div className="auth-logo">
      <Image
        alt="LeaderCoach"
        className="auth-logo-image"
        height={1024}
        priority
        src="/images/leader-coach-logo.png"
        width={1536}
      />
    </div>
  );
}

export function AuthShell({
  children,
  visualPosition,
  prompt,
  statement,
}: AuthShellProps) {
  const visual = <AuthVisual prompt={prompt} statement={statement} />;

  return (
    <main className="auth-page">
      <div className="auth-layout">
        {visualPosition === "start" ? visual : null}
        <section className="auth-content">
          <BrandLogo />
          <div className="auth-glow" />
          <div className="auth-form-container">{children}</div>
        </section>
        {visualPosition === "end" ? visual : null}
      </div>
    </main>
  );
}

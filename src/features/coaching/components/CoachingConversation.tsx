"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import {
  ArrowRight,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Paperclip,
  RefreshCw,
} from "lucide-react";

import type { CoachingMessage } from "../types";

type CoachingConversationProps = {
  activeTitle: string;
  canRefreshConversation: boolean;
  draft: string;
  hasActiveConversation: boolean;
  isStreaming: boolean;
  isTranscriptError: boolean;
  isTranscriptLoading: boolean;
  messages: CoachingMessage[];
  onDraftChange: (value: string) => void;
  onRefreshConversation: () => Promise<void>;
  onSendMessage: () => Promise<boolean>;
  onUsePrompt: (prompt: string) => void;
  prompts: string[];
  streamError: string | null;
};

export function CoachingConversation({
  activeTitle,
  canRefreshConversation,
  draft,
  hasActiveConversation,
  isStreaming,
  isTranscriptError,
  isTranscriptLoading,
  messages,
  onDraftChange,
  onRefreshConversation,
  onSendMessage,
  onUsePrompt,
  prompts,
  streamError,
}: CoachingConversationProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const messageLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messageLog = messageLogRef.current;
    if (
      hasActiveConversation &&
      messageLog &&
      typeof messageLog.scrollTo === "function"
    ) {
      messageLog.scrollTo({ top: messageLog.scrollHeight, behavior: "smooth" });
    }
  }, [hasActiveConversation, isStreaming, messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void onSendMessage();
    }
  }

  function handlePrompt(prompt: string) {
    onUsePrompt(prompt);
    textAreaRef.current?.focus();
  }

  return (
    <section
      className={`coaching-panel${hasActiveConversation ? " coaching-panel-conversation" : ""}`}
      aria-labelledby="jess-mode-title"
    >
      {hasActiveConversation ? (
        <>
          <header className="coaching-thread-header">
            <p>Jess Mode</p>
            <h1 id="jess-mode-title">{activeTitle}</h1>
          </header>
          <div
            aria-live="polite"
            className="coaching-message-log"
            ref={messageLogRef}
            role="log"
          >
            {isTranscriptLoading ? (
              <div
                aria-busy="true"
                aria-label="Loading conversation"
                className="coaching-message-skeletons"
              >
                <span />
                <span />
                <span />
              </div>
            ) : null}
            {isTranscriptError ? (
              <div className="coaching-inline-error" role="alert">
                <p>Unable to load this conversation.</p>
                {canRefreshConversation ? (
                  <button
                    onClick={() => void onRefreshConversation()}
                    type="button"
                  >
                    <RefreshCw aria-hidden="true" size={16} />
                    Retry
                  </button>
                ) : null}
              </div>
            ) : null}
            {messages.map((message) => (
              <article
                className={`coaching-message coaching-message-${message.role}`}
                key={message.id}
              >
                <p>{message.content}</p>
              </article>
            ))}
            {isStreaming ? (
              <p className="coaching-typing-indicator">
                <LoaderCircle aria-hidden="true" size={16} />
                Jess is reflecting…
              </p>
            ) : null}
            {streamError ? (
              <div className="coaching-inline-error" role="alert">
                <p>{streamError}</p>
                {canRefreshConversation ? (
                  <button
                    onClick={() => void onRefreshConversation()}
                    type="button"
                  >
                    <RefreshCw aria-hidden="true" size={16} />
                    Refresh conversation
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      <div
        className={`coaching-composer-section${hasActiveConversation ? " coaching-composer-section-conversation" : ""}`}
      >
        {!hasActiveConversation ? (
          <div className="coaching-intro coaching-intro-new">
            <h1 id="jess-mode-title">Enter Jess Mode</h1>
            <p>
              A reflective coaching space to help you think clearly, grow
              intentionally, and take action.
            </p>
          </div>
        ) : null}
        <form className="coaching-composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="coaching-message">
            What would you like to explore?
          </label>
          <textarea
            disabled={isStreaming}
            id="coaching-message"
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share a situation, decision, or conversation you’re working through…"
            ref={textAreaRef}
            rows={2}
            value={draft}
          />
          <div className="coaching-composer-footer">
            <div className="coaching-composer-actions">
              <button
                aria-describedby="attachment-unavailable"
                disabled
                type="button"
              >
                <Paperclip aria-hidden="true" size={17} />
                Attach
              </button>
              <span id="attachment-unavailable">
                File attachments aren’t available yet.
              </span>
              <span>
                <Globe2 aria-hidden="true" size={16} />
                Online
              </span>
            </div>
            <button
              aria-label="Start coaching conversation"
              className="coaching-send-button"
              disabled={isStreaming || !draft.trim()}
              type="submit"
            >
              <ArrowRight aria-hidden="true" size={24} />
            </button>
          </div>
        </form>

        {!hasActiveConversation ? (
          <div className="coaching-prompt-list" aria-label="Suggested prompts">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handlePrompt(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="coaching-privacy">
        <LockKeyhole aria-hidden="true" size={19} />
        Your conversations are saved to your account.
      </p>
    </section>
  );
}

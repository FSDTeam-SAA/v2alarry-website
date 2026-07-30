"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import {
  ArrowRight,
  FileText,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Paperclip,
  X,
} from "lucide-react";

import type { CoachingSession } from "../types";

type CoachingConversationProps = {
  activeSession: CoachingSession | null;
  attachments: string[];
  draft: string;
  isReplyPending: boolean;
  onAddAttachments: (files: FileList | null) => void;
  onDraftChange: (value: string) => void;
  onRemoveAttachment: (attachment: string) => void;
  onSendMessage: () => boolean;
  onUsePrompt: (prompt: string) => void;
  prompts: string[];
};

export function CoachingConversation({
  activeSession,
  attachments,
  draft,
  isReplyPending,
  onAddAttachments,
  onDraftChange,
  onRemoveAttachment,
  onSendMessage,
  onUsePrompt,
  prompts,
}: CoachingConversationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const messageLogRef = useRef<HTMLDivElement>(null);
  const hasActiveSession = activeSession !== null;

  useEffect(() => {
    const messageLog = messageLogRef.current;

    if (
      hasActiveSession &&
      messageLog &&
      typeof messageLog.scrollTo === "function"
    ) {
      messageLog.scrollTo({ top: messageLog.scrollHeight, behavior: "smooth" });
    }
  }, [activeSession?.messages.length, hasActiveSession, isReplyPending]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSendMessage();
    }
  }

  function handlePrompt(prompt: string) {
    onUsePrompt(prompt);
    textAreaRef.current?.focus();
  }

  return (
    <section
      className={`coaching-panel${hasActiveSession ? " coaching-panel-conversation" : ""}`}
      aria-labelledby="jess-mode-title"
    >
      {hasActiveSession ? (
        <>
          <header className="coaching-thread-header">
            <p>Jess Mode</p>
            <h1 id="jess-mode-title">{activeSession.title}</h1>
          </header>
          <div
            aria-live="polite"
            className="coaching-message-log"
            ref={messageLogRef}
            role="log"
          >
            {activeSession.messages.map((message) => (
              <article
                className={`coaching-message coaching-message-${message.role}`}
                key={message.id}
              >
                <p>{message.content}</p>
                {message.attachments?.map((attachment) => (
                  <span
                    className="coaching-message-attachment"
                    key={attachment}
                  >
                    <FileText aria-hidden="true" size={15} />
                    {attachment}
                  </span>
                ))}
              </article>
            ))}
            {isReplyPending && (
              <p className="coaching-typing-indicator">
                <LoaderCircle aria-hidden="true" size={16} />
                Jess is reflecting…
              </p>
            )}
          </div>
        </>
      ) : null}

      <div
        className={`coaching-composer-section${hasActiveSession ? " coaching-composer-section-conversation" : ""}`}
      >
        {!hasActiveSession && (
          <div className="coaching-intro coaching-intro-new">
            <h1 id="jess-mode-title">Enter Jess Mode</h1>
            <p>
              A reflective coaching space to help you think clearly, grow
              intentionally, and take action.
            </p>
          </div>
        )}
        <form className="coaching-composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="coaching-message">
            What would you like to explore?
          </label>
          {attachments.length > 0 && (
            <ul
              className="coaching-attachment-list"
              aria-label="Files ready to send"
            >
              {attachments.map((attachment) => (
                <li key={attachment}>
                  <FileText aria-hidden="true" size={14} />
                  <span>{attachment}</span>
                  <button
                    aria-label={`Remove ${attachment}`}
                    onClick={() => onRemoveAttachment(attachment)}
                    type="button"
                  >
                    <X aria-hidden="true" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <textarea
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
              <input
                className="sr-only"
                id="coaching-attachment"
                onChange={(event) => {
                  onAddAttachments(event.target.files);
                  event.target.value = "";
                }}
                ref={fileInputRef}
                type="file"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Paperclip aria-hidden="true" size={17} />
                Attach
              </button>
              <span>
                <Globe2 aria-hidden="true" size={16} />
                Online
              </span>
            </div>
            <button
              aria-label="Start coaching conversation"
              className="coaching-send-button"
              disabled={!draft.trim() && attachments.length === 0}
              type="submit"
            >
              <ArrowRight aria-hidden="true" size={24} />
            </button>
          </div>
        </form>

        {!hasActiveSession && (
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
        )}
      </div>

      <p className="coaching-privacy">
        <LockKeyhole aria-hidden="true" size={19} />
        Your conversations are private and stored only in this browser
      </p>
    </section>
  );
}

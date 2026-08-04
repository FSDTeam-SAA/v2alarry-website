"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, LoaderCircle, RefreshCw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

import { AssistantMessage } from "./AssistantMessage";
import type {
  CoachingMessage,
  CoachingStarter,
  SubmissionState,
} from "../types";

type CoachingConversationProps = {
  activeTitle: string;
  canRefreshConversation: boolean;
  copySubmittedMessage: () => Promise<void>;
  draft: string;
  greetingName: string | null;
  hasActiveConversation: boolean;
  isStreaming: boolean;
  isTranscriptError: boolean;
  isTranscriptLoading: boolean;
  messages: CoachingMessage[];
  onDraftChange: (value: string) => void;
  onRefreshConversation: () => Promise<void>;
  onSendMessage: () => Promise<boolean>;
  onUsePrompt: (prompt: string) => void;
  starters: readonly CoachingStarter[];
  streamError: string | null;
  submissionState: SubmissionState;
};

function getStreamStatus(submissionState: SubmissionState) {
  if (submissionState.status === "sending") return "Sending message…";
  if (submissionState.status === "streaming") {
    return "Jess is preparing a response…";
  }
  if (submissionState.status === "completed") return "Jess has responded.";
  return "";
}

export function CoachingConversation({
  activeTitle,
  canRefreshConversation,
  copySubmittedMessage,
  draft,
  greetingName,
  hasActiveConversation,
  isStreaming,
  isTranscriptError,
  isTranscriptLoading,
  messages,
  onDraftChange,
  onRefreshConversation,
  onSendMessage,
  onUsePrompt,
  starters,
  streamError,
  submissionState,
}: CoachingConversationProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const messageLogRef = useRef<HTMLDivElement>(null);
  const [showAllStarters, setShowAllStarters] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const displayedStarters = showAllStarters ? starters : starters.slice(0, 3);
  const completedMessages = messages.filter((message) => !message.isStreaming);
  const streamingMessage = messages.find((message) => message.isStreaming);
  const statusText = getStreamStatus(submissionState);

  useEffect(() => {
    const messageLog = messageLogRef.current;
    if (!messageLog || !hasActiveConversation) return;

    if (isNearBottom) {
      if (typeof messageLog.scrollTo === "function") {
        messageLog.scrollTo({
          top: messageLog.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [hasActiveConversation, isNearBottom, messages]);

  function handleScroll() {
    const messageLog = messageLogRef.current;
    if (!messageLog) return;
    const isAtBottom =
      messageLog.scrollHeight - messageLog.scrollTop - messageLog.clientHeight <
      40;
    setIsNearBottom(isAtBottom);
    setHasUnreadMessages(!isAtBottom);
  }

  function jumpToLatest() {
    if (typeof messageLogRef.current?.scrollTo !== "function") return;
    messageLogRef.current.scrollTo({
      top: messageLogRef.current.scrollHeight,
      behavior: "smooth",
    });
  }

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

  function handleStarter(starter: CoachingStarter) {
    onUsePrompt(starter.draft);
    textAreaRef.current?.focus();
  }

  return (
    <section
      className={`coaching-panel${hasActiveConversation ? " coaching-panel-conversation" : ""}`}
      aria-labelledby="jess-mode-title"
    >
      <div aria-atomic="true" className="sr-only" role="status">
        {statusText}
      </div>

      {hasActiveConversation ? (
        <>
          <header className="coaching-thread-header coaching-reading-column">
            <p>Leadership coaching session</p>
            <h1 id="jess-mode-title">{activeTitle}</h1>
          </header>
          <div className="coaching-reading-column coaching-log-wrap">
            <div
              aria-live="polite"
              aria-relevant="additions"
              aria-label="Coaching conversation"
              className="coaching-message-log"
              onScroll={handleScroll}
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
                      <RefreshCw aria-hidden="true" size={16} /> Retry
                    </button>
                  ) : null}
                </div>
              ) : null}
              {completedMessages.map((message) => (
                <article
                  className={`coaching-message coaching-message-${message.role}`}
                  key={message.id}
                >
                  {message.role === "assistant" ? (
                    <span className="coaching-message-author">Jess</span>
                  ) : null}
                  {message.role === "assistant" ? (
                    <AssistantMessage
                      content={message.content}
                      isStreaming={false}
                    />
                  ) : (
                    <p>{message.content}</p>
                  )}
                </article>
              ))}
              {streamingMessage ? (
                <article
                  aria-live="off"
                  className="coaching-message coaching-message-assistant coaching-message-streaming"
                >
                  <span className="coaching-message-author">Jess</span>
                  <AssistantMessage
                    content={streamingMessage.content}
                    isStreaming
                  />
                </article>
              ) : null}
            </div>
            {hasUnreadMessages ? (
              <button
                className="coaching-jump-latest"
                onClick={jumpToLatest}
                type="button"
              >
                Jump to latest <ChevronDown aria-hidden="true" size={16} />
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      <div
        className={`coaching-composer-section${hasActiveConversation ? " coaching-composer-section-conversation" : ""}`}
      >
        {!hasActiveConversation ? (
          <div className="coaching-intro coaching-intro-new">
            <Badge className="coaching-eyebrow bg-[#ffc338]">Jess Mode</Badge>
            {greetingName ? (
              <p className="coaching-greeting">Welcome back, {greetingName}.</p>
            ) : null}
            <h1 id="jess-mode-title">
              What leadership challenge are you working through?
            </h1>
            <p>Reflect, prepare, and identify a practical next step.</p>
          </div>
        ) : null}
        <form className="coaching-composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="coaching-message">
            What would you like to explore?
          </label>
          <textarea
            disabled={
              isStreaming || submissionState.status === "outcome-unknown"
            }
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
              <span>Saved to your account</span>
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button">About Jess Mode</button>
                </DialogTrigger>
                <DialogContent className="coaching-account-dialog">
                  <DialogHeader>
                    <DialogTitle>About Jess Mode</DialogTitle>
                    <DialogDescription>
                      Jess is an AI leadership coaching experience.
                    </DialogDescription>
                  </DialogHeader>
                  <p>
                    Sessions are saved to your account and can be deleted from
                    coaching history. Avoid sharing unnecessary sensitive or
                    identifying information.
                  </p>
                </DialogContent>
              </Dialog>
            </div>
            <button
              aria-label="Send coaching message"
              className="coaching-send-button"
              disabled={
                isStreaming ||
                submissionState.status === "outcome-unknown" ||
                !draft.trim()
              }
              type="submit"
            >
              {isStreaming ? (
                <LoaderCircle aria-hidden="true" size={20} />
              ) : (
                <ArrowRight aria-hidden="true" size={24} />
              )}
            </button>
          </div>
        </form>

        {streamError ? (
          <div className="coaching-inline-error" role="alert">
            <p>{streamError}</p>
            {submissionState.status === "outcome-unknown" ? (
              <button onClick={() => void copySubmittedMessage()} type="button">
                Copy your message
              </button>
            ) : null}
            {canRefreshConversation ? (
              <button
                onClick={() => void onRefreshConversation()}
                type="button"
              >
                <RefreshCw aria-hidden="true" size={16} /> Refresh session
              </button>
            ) : null}
          </div>
        ) : null}

        {!hasActiveConversation ? (
          <div className="coaching-prompt-list" id="coaching-starters">
            {displayedStarters.map((starter) => (
              <button
                key={starter.label}
                onClick={() => handleStarter(starter)}
                type="button"
              >
                {starter.label}
              </button>
            ))}
            <button
              aria-controls="coaching-starters"
              aria-expanded={showAllStarters}
              className="coaching-more-starters"
              onClick={() => setShowAllStarters((current) => !current)}
              type="button"
            >
              {showAllStarters ? "Show fewer" : "More situations"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

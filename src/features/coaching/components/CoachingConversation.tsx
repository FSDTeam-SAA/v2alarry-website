"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowRight, ChevronDown, RefreshCw, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { AssistantMessage } from "./AssistantMessage";
import type {
  CoachingMessage,
  CoachingStarter,
  CoachingStreamStage,
  SubmissionState,
} from "../types";

type CoachingConversationProps = {
  activeConversationId: string | null;
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
  onStopGenerating: () => void;
  onUsePrompt: (prompt: string) => void;
  starters: readonly CoachingStarter[];
  streamError: string | null;
  submissionState: SubmissionState;
};

function getStreamStatus(submissionState: SubmissionState) {
  if (submissionState.status === "sending") {
    return "Sending your message…";
  }

  if (submissionState.status === "streaming") {
    return "Jess is responding…";
  }

  return "";
}

function getPreparationMessage(stage: CoachingStreamStage | undefined) {
  switch (stage) {
    case "retrieving_context":
      return "Reviewing relevant context…";

    case "building_context":
      return "Preparing your response…";

    case "generating_response":
      return "Starting your response…";

    case "accepted":
    default:
      return "Understanding your question…";
  }
}

function ResponsePreparation({ stage }: { stage?: CoachingStreamStage }) {
  const message = getPreparationMessage(stage);

  return (
    <p className="coaching-response-preparation" role="status">
      <span aria-hidden="true" className="coaching-response-dots">
        <i />
        <i />
        <i />
      </span>

      <span className="coaching-response-preparation-label" key={stage}>
        {message}
      </span>
    </p>
  );
}

export function CoachingConversation({
  activeConversationId,
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
  onStopGenerating,
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

  const activeConversationRef = useRef<string | null>(activeConversationId);

  const previousMessageRevisionRef = useRef("");
  const scrollStateFrameRef = useRef<number | null>(null);

  const displayedStarters = showAllStarters ? starters : starters.slice(0, 3);

  const completedMessages = messages.filter((message) => !message.isStreaming);

  const streamingMessage = messages.find((message) => message.isStreaming);

  const statusText = getStreamStatus(submissionState);

  const hasStreamingContent = Boolean(streamingMessage?.content);

  const isPreparingResponse = isStreaming && !hasStreamingContent;

  const composerStatus = isPreparingResponse
    ? "Jess is preparing your response…"
    : "Jess is responding…";

  const shouldShowStreamingMessage =
    Boolean(streamingMessage) && (isStreaming || hasStreamingContent);

  const messageRevision = messages
    .map((message) => `${message.id}:${message.content.length}`)
    .join("|");

  useLayoutEffect(() => {
    const textarea = textAreaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  }, [draft, isStreaming]);

  useEffect(() => {
    const messageLog = messageLogRef.current;

    if (!messageLog || !hasActiveConversation) {
      return;
    }

    const conversationChanged =
      activeConversationRef.current !== activeConversationId;

    if (conversationChanged) {
      activeConversationRef.current = activeConversationId;

      previousMessageRevisionRef.current = "";

      if (scrollStateFrameRef.current !== null) {
        cancelAnimationFrame(scrollStateFrameRef.current);
      }

      scrollStateFrameRef.current = requestAnimationFrame(() => {
        scrollStateFrameRef.current = null;

        setIsNearBottom(true);
        setHasUnreadMessages(false);
      });
    }

    const hasPreviousMessages = Boolean(previousMessageRevisionRef.current);

    const hasNewMessages =
      hasPreviousMessages &&
      previousMessageRevisionRef.current !== messageRevision;

    previousMessageRevisionRef.current = messageRevision;

    if (isNearBottom) {
      if (typeof messageLog.scrollTo === "function") {
        messageLog.scrollTo({
          top: messageLog.scrollHeight,
          behavior: "auto",
        });
      }
    } else if (hasNewMessages) {
      if (scrollStateFrameRef.current !== null) {
        cancelAnimationFrame(scrollStateFrameRef.current);
      }

      scrollStateFrameRef.current = requestAnimationFrame(() => {
        scrollStateFrameRef.current = null;
        setHasUnreadMessages(true);
      });
    }
  }, [
    activeConversationId,
    hasActiveConversation,
    isNearBottom,
    messageRevision,
  ]);

  useEffect(() => {
    return () => {
      if (scrollStateFrameRef.current !== null) {
        cancelAnimationFrame(scrollStateFrameRef.current);
      }
    };
  }, []);

  function handleScroll() {
    const messageLog = messageLogRef.current;

    if (!messageLog) {
      return;
    }

    const isAtBottom =
      messageLog.scrollHeight - messageLog.scrollTop - messageLog.clientHeight <
      40;

    setIsNearBottom((current) =>
      current === isAtBottom ? current : isAtBottom,
    );

    if (isAtBottom) {
      setHasUnreadMessages(false);
    }
  }

  function jumpToLatest() {
    const messageLog = messageLogRef.current;

    if (!messageLog || typeof messageLog.scrollTo !== "function") {
      return;
    }

    setIsNearBottom(true);
    setHasUnreadMessages(false);

    messageLog.scrollTo({
      top: messageLog.scrollHeight,
      behavior: "smooth",
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isStreaming) {
      return;
    }

    void onSendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    if (isStreaming) {
      return;
    }

    event.preventDefault();
    void onSendMessage();
  }

  function handleStarter(starter: CoachingStarter) {
    onUsePrompt(starter.draft);
    textAreaRef.current?.focus();
  }

  return (
    <section
      className={`coaching-panel${
        hasActiveConversation ? " coaching-panel-conversation" : ""
      }${isStreaming ? " coaching-panel-processing" : ""}`}
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
                      <RefreshCw aria-hidden="true" size={16} />
                      Retry
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

              {shouldShowStreamingMessage && streamingMessage ? (
                <article
                  aria-live="off"
                  className="coaching-message coaching-message-assistant coaching-message-streaming"
                >
                  <span className="coaching-message-author">Jess</span>

                  {isPreparingResponse ? (
                    <ResponsePreparation
                      stage={
                        submissionState.status === "streaming"
                          ? submissionState.stage
                          : undefined
                      }
                    />
                  ) : (
                    <AssistantMessage
                      content={streamingMessage.content}
                      isStreaming={isStreaming}
                    />
                  )}
                </article>
              ) : null}
            </div>

            {hasUnreadMessages ? (
              <button
                className="coaching-jump-latest"
                onClick={jumpToLatest}
                type="button"
              >
                Jump to latest
                <ChevronDown aria-hidden="true" size={16} />
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      <div
        className={`coaching-composer-section${
          hasActiveConversation ? " coaching-composer-section-conversation" : ""
        }`}
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

        <form
          className={`coaching-composer${
            isStreaming ? " coaching-composer-processing" : ""
          }`}
          onSubmit={handleSubmit}
        >
          {isStreaming ? (
            <p
              className="coaching-composer-status"
              id="coaching-streaming-note"
            >
              <span
                aria-hidden="true"
                className="coaching-composer-status-indicator"
              />

              <span className="coaching-composer-status-copy">
                {composerStatus}
              </span>
            </p>
          ) : (
            <>
              <label className="sr-only" htmlFor="coaching-message">
                What would you like to explore?
              </label>

              <textarea
                disabled={submissionState.status === "outcome-unknown"}
                id="coaching-message"
                onChange={(event) => onDraftChange(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share a situation, decision, or conversation you’re working through…"
                ref={textAreaRef}
                rows={1}
                value={draft}
              />
            </>
          )}

          {isStreaming ? (
            <button
              aria-label="Stop generating"
              className="coaching-stop-button"
              onClick={onStopGenerating}
              type="button"
            >
              <Square aria-hidden="true" fill="currentColor" size={12} />
              Stop
            </button>
          ) : (
            <button
              aria-label="Send coaching message"
              className="coaching-send-button"
              disabled={
                submissionState.status === "outcome-unknown" || !draft.trim()
              }
              type="submit"
            >
              <ArrowRight aria-hidden="true" size={24} />
            </button>
          )}
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
                <RefreshCw aria-hidden="true" size={16} />
                Refresh session
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

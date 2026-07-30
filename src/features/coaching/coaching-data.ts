import type { CoachingSession } from "./types";

export const suggestedPrompts = [
  "I'm facing a tough decision",
  "I want to build team trust",
  "I need to prepare for a conversation",
];

export const initialCoachingSessions: CoachingSession[] = [
  {
    id: "leading-through-change",
    title: "Leading Through Change",
    dateLabel: "Today",
    messages: [
      {
        id: "leading-through-change-welcome",
        role: "assistant",
        content:
          "What part of this change needs the clearest leadership from you right now?",
      },
    ],
  },
  {
    id: "giving-tough-feedback",
    title: "Giving Tough Feedback",
    dateLabel: "Yesterday",
    messages: [
      {
        id: "giving-tough-feedback-welcome",
        role: "assistant",
        content:
          "We can make the conversation direct and constructive. What outcome do you want to create?",
      },
    ],
  },
  {
    id: "team-brainstorming",
    title: "Conducting a Team Brainstorming Session",
    dateLabel: "Today",
    messages: [
      {
        id: "team-brainstorming-welcome",
        role: "assistant",
        content:
          "A strong brainstorm starts with a clear question. What would you like the team to unlock?",
      },
    ],
  },
  {
    id: "project-milestones",
    title: "Reviewing Project Milestones",
    dateLabel: "This Week",
    messages: [
      {
        id: "project-milestones-welcome",
        role: "assistant",
        content:
          "Let’s separate what is moving, what is blocked, and where your attention will matter most.",
      },
    ],
  },
  {
    id: "client-presentation",
    title: "Preparing for the Client Presentation",
    dateLabel: "Next Monday",
    messages: [
      {
        id: "client-presentation-welcome",
        role: "assistant",
        content:
          "What do you want the client to understand, feel, and decide by the end of the presentation?",
      },
    ],
  },
  {
    id: "user-feedback",
    title: "Analyzing User Feedback",
    dateLabel: "Last Month",
    messages: [
      {
        id: "user-feedback-welcome",
        role: "assistant",
        content:
          "Let’s look for the pattern beneath the comments. Which signal feels most important to explore?",
      },
    ],
  },
];

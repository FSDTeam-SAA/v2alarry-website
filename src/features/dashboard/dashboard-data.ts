import type { KnowledgeDocument, User } from "./types";

export const users: User[] = [
  [
    "Jonathan Sterling",
    "j.sterling@vanguard.com",
    "Oct 12, 2023",
    "2 hours ago",
    25,
  ],
  ["Emily Carter", "e.carter@techify.com", "Oct 11, 2023", "1 day ago", 30],
  [
    "Michael Johnson",
    "m.johnson@innotech.com",
    "Oct 10, 2023",
    "2 days ago",
    15,
  ],
  [
    "Sarah Reynolds",
    "s.reynolds@harmonix.com",
    "Oct 9, 2023",
    "3 days ago",
    18,
  ],
  ["David Kim", "d.kim@startuplab.com", "Oct 8, 2023", "4 days ago", 22],
  ["Rachel Adams", "r.adams@creativehub.com", "Oct 7, 2023", "5 days ago", 28],
  ["Chris Evans", "c.evans@designworks.com", "Oct 6, 2023", "6 days ago", 10],
  ["Samantha Green", "s.green@innovators.com", "Oct 5, 2023", "7 days ago", 35],
  ["Brian Smith", "b.smith@codetech.com", "Oct 4, 2023", "8 days ago", 20],
  ["Angela White", "a.white@pixelart.com", "Oct 3, 2023", "9 days ago", 16],
  [
    "James Taylor",
    "j.taylor@productdesign.com",
    "Oct 2, 2023",
    "10 days ago",
    24,
  ],
  ["Megan Brown", "m.brown@uxstudio.com", "Oct 1, 2023", "11 days ago", 14],
  [
    "Joseph Martinez",
    "j.martinez@websolutions.com",
    "Sep 30, 2023",
    "12 days ago",
    17,
  ],
].map(([name, email, registeredAt, lastActive, sessions], index) => ({
  id: String(index + 1),
  name: String(name),
  email: String(email),
  registeredAt: String(registeredAt),
  lastActive: String(lastActive),
  sessions: Number(sessions),
}));

export const documents: KnowledgeDocument[] = [
  ["CEO_Onboarding_2024.pdf", "2.4 MB", "Leadership", "Oct 12, 2023"],
  ["Product_Design_Guidelines_2024.docx", "1.8 MB", "Design", "Oct 5, 2023"],
  ["Marketing_Strategy_2024.pptx", "3.2 MB", "Marketing", "Oct 10, 2023"],
  [
    "User_Research_Report_August_2023.pdf",
    "2.1 MB",
    "Research",
    "Aug 30, 2023",
  ],
  ["Sales_Data_Q3_2023.xlsx", "2.9 MB", "Sales", "Sep 15, 2023"],
  ["Compliance_Training_Material.pdf", "1.5 MB", "Training", "Sep 20, 2023"],
  ["Customer_Feedback_Analysis_2023.docx", "2.0 MB", "Feedback", "Oct 1, 2023"],
  ["Annual_Budget_2024.xlsx", "4.0 MB", "Finance", "Oct 8, 2023"],
  ["Event_Planning_Checklist_2024.pdf", "0.9 MB", "Events", "Sep 25, 2023"],
  ["HR_Policies_Update_2024.docx", "1.6 MB", "HR", "Oct 4, 2023"],
  [
    "Technical_Requirements_Spec_2023.pdf",
    "3.1 MB",
    "Engineering",
    "Sep 28, 2023",
  ],
].map(([name, size, category, uploadedAt], index) => ({
  id: String(index + 1),
  name,
  size,
  category,
  uploadedAt,
}));

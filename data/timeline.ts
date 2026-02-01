export type TimelineEntry = {
  date: string;        // e.g. "2026-01" or "2024-05"
  title: string;
  org?: string;
  description: string;
  tags?: string[];
  kind: "current" | "project" | "achievement";
};

export const TIMELINE: TimelineEntry[] = [
  {
    date: "2024-08",
    title: "Micron — Problem solving in semiconductor engineering",
    org: "Micron",
    description:
      "Working on process / yield / reliability problem-solving with a focus on disciplined debugging and measurable improvements.",
    tags: ["semiconductor", "engineering", "systems"],
    kind: "current"
  },
  {
    date: "2023-03",
    title: "Learnr — Building interactive learning systems",
    org: "Learnr",
    description:
      "Exploring how to deliver better learning experiences via interactive content, discussion, and structured knowledge pathways.",
    tags: ["learning", "product", "UX"],
    kind: "project"
  },
  {
    date: "2026-01",
    title: "TINKRR — Life optimization as a product",
    org: "TINKRR",
    description:
      "Designing a life OS that turns personal tracking into a coherent, gamified system: time, health, habits, and progress.",
    tags: ["life systems", "design", "software"],
    kind: "project"
  },
  {
    date: "2024-05",
    title: "Valedictorian — NTU Electrical & Electronic Engineering",
    org: "Nanyang Technological University",
    description:
      "Graduated as valedictorian with Highest Distinction (CGPA 4.79/5.00).",
    tags: ["achievement", "EEE"],
    kind: "achievement"
  }
];

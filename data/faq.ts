import { CONTACT } from "./contact";

export const FAQ = [
  {
    question: "What do you write about here?",
    answer: "This is my personal notebook for learning notes, research, engineering projects, and questions I’m exploring.",
    link: { label: "Browse the posts", href: "/" },
  },
  {
    question: "Where can I read about your life checkpoints?",
    answer: "They’re woven into the biography on About. Click a note number to open the story, including its date and photos.",
    link: { label: "Read about me", href: "/about/#biography" },
  },
  {
    question: "Where can I see your travel memories?",
    answer: "The flag strip is beneath the travel paragraph on About. Click a flag to open that destination’s memories and photos. Some destinations are still waiting for their stories.",
    link: { label: "Explore About", href: "/about/#biography" },
  },
  {
    question: "How can I get in touch?",
    answer: "You can reach me by email. My GitHub and Instagram links are also in the footer.",
    link: { label: "Send me an email", href: `mailto:${CONTACT.email}` },
  },
];

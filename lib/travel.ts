import fs from "fs";
import path from "path";
import { renderMarkdown } from "./posts";

const destinations = [
  { code: "la", name: "Laos" },
  { code: "th", name: "Thailand" },
  { code: "tw", name: "Taiwan" },
  { code: "id", name: "Indonesia" },
  { code: "fr", name: "France" },
  { code: "be", name: "Belgium" },
  { code: "de", name: "Germany" },
  { code: "it", name: "Italy" },
  { code: "ch", name: "Switzerland" },
  { code: "cn", name: "China" },
  { code: "mo", name: "Macao" },
  { code: "hk", name: "Hong Kong" },
  { code: "vn", name: "Vietnam" },
  { code: "kr", name: "South Korea" },
];

export function getTravelMemories(directory = path.join(process.cwd(), "content", "travel")) {
  return destinations.map((destination) => {
    const file = path.join(directory, `${destination.code}.md`);
    const content = fs.existsSync(file) ? fs.readFileSync(file, "utf8").trim() : "";
    return {
      ...destination,
      html: renderMarkdown(content || "More memories to come.").html,
    };
  });
}

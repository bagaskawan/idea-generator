// Definisikan tipe data agar lebih aman dan mudah dibaca
interface RoadmapPhase {
  phase: string;
  value: string;
  outcomes: string;
  milestones: string[];
}

interface UserStory {
  role: string;
  benefit: string;
  feature: string;
}

interface ApiEndpoint {
  path: string;
  method: string;
  request: string;
  response: string;
  description: string;
}

interface TaskBreakdown {
  [category: string]: string[];
}

interface BlueprintJson {
  Roadmap?: RoadmapPhase[];
  "User Stories"?: UserStory[];
  "API Endpoints"?: ApiEndpoint[];
  "Task Breakdown"?: TaskBreakdown;
  "System Architecture"?: string;
}

/**
 * Mengubah objek JSON blueprint menjadi string Markdown yang terformat dengan baik.
 * @param jsonData Objek JSON yang berisi data blueprint dari AI.
 * @returns Sebuah string Markdown.
 */
export function jsonToMarkdown(jsonData: BlueprintJson): string {
  let markdown = "";

  if (jsonData.Roadmap) {
    markdown += "## 🗺️ Project Roadmap\n\n";
    jsonData.Roadmap.forEach((phase) => {
      markdown += `### ${phase.phase}\n`;
      markdown += `- **Value:** ${phase.value}\n`;
      markdown += `- **Outcomes:** ${phase.outcomes}\n`;
      markdown += `- **Milestones:**\n`;
      phase.milestones.forEach((milestone) => {
        markdown += `  - ${milestone}\n`;
      });
      markdown += "\n";
    });
  }

  if (jsonData["User Stories"]) {
    markdown += "## 👥 User Stories\n\n";
    jsonData["User Stories"].forEach((story) => {
      markdown += `> As a **${story.role}**, I want to **${story.feature}** so that **${story.benefit}**.\n\n`;
    });
  }

  if (jsonData["API Endpoints"]) {
    markdown += "## 🔗 API Endpoints\n\n";
    markdown += "| Method | Path | Description |\n";
    markdown += "|:---|:---|:---|\n";
    jsonData["API Endpoints"].forEach((endpoint) => {
      markdown += `| \`${endpoint.method}\` | \`${endpoint.path}\` | ${endpoint.description} |\n`;
    });
    markdown += "\n";
  }

  if (jsonData["Task Breakdown"]) {
    markdown += "## 🔨 Task Breakdown\n\n";
    for (const category in jsonData["Task Breakdown"]) {
      markdown += `### ${category}\n`;
      jsonData["Task Breakdown"][category].forEach((task) => {
        markdown += `- [ ] ${task}\n`; // Menambahkan checkbox
      });
      markdown += "\n";
    }
  }

  if (jsonData["System Architecture"]) {
    markdown += "## 🏗️ System Architecture\n\n";
    markdown += `${jsonData["System Architecture"]}\n\n`;
  }

  return markdown.trim();
}

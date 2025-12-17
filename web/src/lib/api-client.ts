const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchFromBackend(
  endpoint: string,
  method: string,
  body?: any
) {
  const headers = {
    "Content-Type": "application/json",
  };

  // DEBUG: Cek URL yang terbentuk di Console Browser
  const fullUrl = `${BACKEND_URL}${endpoint}`;
  console.log(`[API Call] Fetching: ${fullUrl} (${method})`);

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.error || "Failed to fetch from backend"
    );
  }

  return response.json();
}

export const api = {
  startInterview: (interest: string) =>
    fetchFromBackend("/api/interview/start", "POST", { interest }),

  continueInterview: (interest: string, conversation: any[]) =>
    fetchFromBackend("/api/interview/continue", "POST", {
      interest,
      conversation,
    }),

  generateIdeas: (data: any) =>
    fetchFromBackend("/api/idea/generate-list", "POST", data),

  generateBlueprint: (data: any) =>
    fetchFromBackend("/api/idea/generate-blueprint", "POST", data),

  generateDatabaseSchema: (data: any) =>
    fetchFromBackend("/api/idea/generate-database-schema", "POST", data),

  // AI completion now uses Next.js API route (not FastAPI)
  generateAICompletion: async (context: string, prompt?: string) => {
    const response = await fetch("/api/ai/editor-completion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context, prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to generate AI completion");
    }

    return response.json();
  },

  generateFlowchart: (projectId: string, projectContext: string) =>
    fetchFromBackend("/api/idea/generate-flowchart", "POST", {
      projectId,
      projectContext,
    }),

  getFlowchart: (projectId: string) =>
    fetchFromBackend(`/api/idea/flowchart/${projectId}`, "GET"),

  // Guide endpoints
  getGuide: (projectId: string, userId?: string) =>
    fetchFromBackend(
      `/api/guide/${projectId}${userId ? `?user_id=${userId}` : ""}`,
      "GET"
    ),

  generateGuide: (projectId: string, workbenchContent: string) =>
    fetchFromBackend(`/api/guide/generate/${projectId}`, "POST", {
      workbenchContent,
    }),

  updateTaskProgress: (
    taskId: string,
    projectId: string,
    isCompleted: boolean
  ) =>
    fetchFromBackend("/api/guide/progress", "POST", {
      taskId,
      projectId,
      isCompleted,
    }),
};

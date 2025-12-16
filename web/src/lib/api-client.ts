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

  generateAICompletion: (context: string, prompt?: string) =>
    fetchFromBackend("/api/ai/editor-completion", "POST", { context, prompt }),
};

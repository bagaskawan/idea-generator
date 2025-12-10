const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchFromBackend(
  endpoint: string,
  method: string,
  body?: any
) {
  const headers = {
    "Content-Type": "application/json",
  };

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
};

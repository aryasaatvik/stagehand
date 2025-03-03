import { LLMClient } from "@/lib/llm/LLMClient.js";
import { LLMProvider } from "@/lib/llm/LLMProvider.js";

export interface VerifyActCompletionParams {
  goal: string;
  steps: string;
  llmProvider: LLMProvider;
  llmClient: LLMClient;
  domElements?: string;
  logger: (message: { category?: string; message: string }) => void;
  requestId: string;
}

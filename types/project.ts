export interface ProjectSummary {
  id: string;
  title: string | null;
  firstPrompt: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

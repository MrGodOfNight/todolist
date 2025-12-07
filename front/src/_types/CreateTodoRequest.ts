export interface CreateTodoRequest {
  name: string;
  description?: string;
  isCompleted: boolean;
}
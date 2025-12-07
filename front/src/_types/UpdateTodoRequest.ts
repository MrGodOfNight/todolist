export interface UpdateTodoRequest {
  name: string;
  description?: string;
  isCompleted: boolean;
}
export interface TaskType {
  _id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

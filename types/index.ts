export interface TaskType {
  _id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  /** ID of the user who created this task */
  ownerId: string;
  /** Users assigned to this task */
  members?: UserType[];
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserType {
  _id: string;
  name: string;
  email: string;
}

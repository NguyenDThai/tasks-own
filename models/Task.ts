import mongoose, { Schema, Document } from "mongoose";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  userId: mongoose.Types.ObjectId | string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deadline: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

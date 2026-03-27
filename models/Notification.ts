import mongoose, { Schema, model, models } from "mongoose";

export interface INotification {
  _id: string;
  userId: mongoose.Types.ObjectId;
  type: "TASK_ASSIGNED" | "STATUS_UPDATED" | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  taskId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
      type: String, 
      enum: ["TASK_ASSIGNED", "STATUS_UPDATED", "SYSTEM"], 
      default: "SYSTEM" 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
  },
  { timestamps: true }
);

// Index to quickly fetch notifications for a specific user, sorted by date
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = models.Notification || model("Notification", notificationSchema);

export default Notification;

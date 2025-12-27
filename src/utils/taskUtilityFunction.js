import { useAuth } from "../context/AuthContext";
export const getStatusColor = (status, theme = null) => {
  if (!status || typeof status !== "string") {
    return "#6A1B9A"; // Default purple
  }

  switch (status.toLowerCase().trim()) {
    case "pending":
      return "#0D47A1"; // Light Orange
    case "in progress":
      return "#42A5F5"; // Sky Blue
    case "complete":
      return "#66BB6A"; // Light Green
    case "overdue":
      return "#E53935"; // Bright Red
    case "not started":
      return "#DA70D6"; // Light Grey
    case "planned":
      return "#AB47BC"; // Violet
    default:
      return "#6A1B9A"; // Default Purple
  }
};

export const getPriorityColor = (priority, theme = null) => {
  if (!priority || typeof priority !== "string") {
    return "#757575"; // Default grey
  }

  switch (priority.toLowerCase().trim()) {
    case "low":
      return "#4CAF50"; // Green
    case "medium":
      return "#FFC107"; // Amber / Yellow
    case "high":
      return "#F44336"; // Red
    case "urgent":
      return "#D32F2F"; // Darker red
    case "critical":
      return "#9C27B0"; // Purple
    default:
      return "#757575"; // Default grey
  }
};

export const getStatusIconName = (status) => {
  if (!status) return "help-circle-outline";
  // console.log('status',status);

  switch (status.toLowerCase()) {
    case "pending":
      return "clock-outline";
    case "in progress":
      return "progress-clock";
    case "complete":
      return "check-circle";
    case "overdue":
      return "alert-circle";
    case "not started":
      return "circle-outline";
    case "planned":
      return "calendar-outline";
    default:
      return "help-circle-outline";
  }
};

export const returnUserRole = (role) => {
  const { user } = useAuth();
  console.log("role", user?.task_role);
  if (user?.task_role === "Admin") {
    return true;
  }
  return false;
};

export interface TaskCompletionRecord {
  taskId: string;
  courseSlug: string;
  lessonSlug: string;
  completedAt: string;
  verifiedVia: "api" | "manual";
}

export interface CourseProgress {
  courseSlug: string;
  completed: number;
  total: number;
}

export interface ProgressResponse {
  completions: TaskCompletionRecord[];
  courseProgress: CourseProgress[];
}

export interface VerifyResponse {
  verified: boolean;
  message: string;
  taskId: string;
  completedAt?: string;
}

export interface Category {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  order: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  lessons: Lesson[];
}

export interface Lesson {
  slug: string;
  title: string;
  description: string;
  order: number;
  courseSlug: string;
  iframeStartPath: string;
  content: string; // raw MDX source
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  order: number;
  iframeHint?: string;
  verification: VerificationCriteria;
}

export interface VerificationCriteria {
  type: string;
  params: Record<string, unknown>;
}

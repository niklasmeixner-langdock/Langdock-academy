import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import matter from "gray-matter";
import type { Category, Course, Lesson, Task } from "@/types/content";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readYaml<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8");
  return yaml.load(raw) as T;
}

export function getCategories(): Category[] {
  const categoriesDir = path.join(CONTENT_DIR, "categories");
  if (!fs.existsSync(categoriesDir)) return [];

  const dirs = fs
    .readdirSync(categoriesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  const categories: Category[] = dirs
    .map((dir) => {
      const metaPath = path.join(categoriesDir, dir.name, "_meta.yaml");
      if (!fs.existsSync(metaPath)) return null;
      return readYaml<Category>(metaPath);
    })
    .filter((c): c is Category => c !== null);

  return categories.sort((a, b) => a.order - b.order);
}

export function getCategory(slug: string): Category | null {
  const categories = getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export function getCourses(): Course[] {
  const coursesDir = path.join(CONTENT_DIR, "courses");
  if (!fs.existsSync(coursesDir)) return [];

  const dirs = fs
    .readdirSync(coursesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  const courses: Course[] = dirs
    .map((dir) => {
      const metaPath = path.join(coursesDir, dir.name, "_meta.yaml");
      if (!fs.existsSync(metaPath)) return null;
      const meta = readYaml<Omit<Course, "lessons">>(metaPath);
      const lessons = getLessonsForCourse(dir.name);
      return { ...meta, lessons };
    })
    .filter((c): c is Course => c !== null);

  return courses.sort((a, b) => a.order - b.order);
}

export function getCoursesByCategory(categorySlug: string): Course[] {
  return getCourses().filter((c) => c.categorySlug === categorySlug);
}

export function getCourse(courseSlug: string): Course | null {
  return getCourses().find((c) => c.slug === courseSlug) ?? null;
}

function getLessonsForCourse(courseDir: string): Lesson[] {
  const lessonsDir = path.join(CONTENT_DIR, "courses", courseDir);
  const dirs = fs
    .readdirSync(lessonsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  const lessons: Lesson[] = dirs
    .map((dir) => {
      const metaPath = path.join(lessonsDir, dir.name, "_meta.yaml");
      if (!fs.existsSync(metaPath)) return null;

      const meta = readYaml<Omit<Lesson, "content" | "tasks">>(metaPath);

      // Load MDX content
      const mdxPath = path.join(lessonsDir, dir.name, "content.mdx");
      const content = fs.existsSync(mdxPath)
        ? fs.readFileSync(mdxPath, "utf-8")
        : "";

      // Load tasks
      const tasksPath = path.join(lessonsDir, dir.name, "tasks.yaml");
      const tasks = fs.existsSync(tasksPath)
        ? (readYaml<{ tasks: Task[] }>(tasksPath).tasks ?? [])
        : [];

      return { ...meta, content, tasks };
    })
    .filter((l): l is Lesson => l !== null);

  return lessons.sort((a, b) => a.order - b.order);
}

export function getLesson(
  courseSlug: string,
  lessonSlug: string
): Lesson | null {
  const course = getCourse(courseSlug);
  if (!course) return null;
  return course.lessons.find((l) => l.slug === lessonSlug) ?? null;
}

export function getTaskById(taskId: string): (Task & { courseSlug: string; lessonSlug: string }) | null {
  const courses = getCourses();
  for (const course of courses) {
    for (const lesson of course.lessons) {
      const task = lesson.tasks.find((t) => t.id === taskId);
      if (task) {
        return { ...task, courseSlug: course.slug, lessonSlug: lesson.slug };
      }
    }
  }
  return null;
}

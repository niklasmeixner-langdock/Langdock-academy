import { MDXRemote } from "next-mdx-remote/rsc";
import { Callout } from "../mdx/Callout";
import { Step } from "../mdx/Step";
import { Video } from "../mdx/Video";
import { Quiz } from "../mdx/Quiz";
import { Screenshot } from "../mdx/Screenshot";

const mdxComponents = {
  Callout,
  Step,
  Video,
  Quiz,
  Screenshot,
};

interface LessonContentProps {
  source: string;
}

export function LessonContent({ source }: LessonContentProps) {
  return (
    <div className="prose prose-sm max-w-none p-6">
      <MDXRemote source={source} components={mdxComponents} />
    </div>
  );
}

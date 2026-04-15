import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  prose?: boolean;
}

export function MarkdownRenderer({ content, className, prose = true }: MarkdownRendererProps) {
  return (
    <div className={cn(prose && "prose prose-sm max-w-none dark:prose-invert", className)}>
      <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </Markdown>
    </div>
  );
}

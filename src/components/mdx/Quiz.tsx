"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

interface QuizProps {
  question: string;
  options: string[];
  answer: number;
}

export function Quiz({ question, options: optionsProp, answer }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);

  // MDX can pass arrays as comma-separated strings — normalize
  const options = Array.isArray(optionsProp)
    ? optionsProp
    : typeof optionsProp === "string"
      ? (optionsProp as string).split(",").map((s: string) => s.trim())
      : [];

  const isCorrect = selected === answer;
  const hasAnswered = selected !== null;

  return (
    <div className="my-4 p-4 bg-gray-50 rounded-lg border border-gray-200 not-prose">
      <p className="text-sm font-medium text-gray-900 mb-3">{question}</p>
      <div className="space-y-2">
        {options.map((option, i) => {
          const isSelected = selected === i;
          const isAnswer = i === answer;

          let style = "border-gray-200 hover:border-blue-300";
          if (hasAnswered && isAnswer) style = "border-green-500 bg-green-50";
          else if (hasAnswered && isSelected && !isCorrect) style = "border-red-500 bg-red-50";

          return (
            <button
              key={i}
              onClick={() => !hasAnswered && setSelected(i)}
              disabled={hasAnswered}
              className={`w-full flex items-center gap-3 p-3 text-sm text-left rounded-lg border transition-colors ${style}`}
            >
              <span className="flex-1">{option}</span>
              {hasAnswered && isAnswer && <Check className="w-4 h-4 text-green-600" />}
              {hasAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-red-600" />}
            </button>
          );
        })}
      </div>
      {hasAnswered && (
        <p className={`mt-3 text-sm font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
          {isCorrect ? "Correct!" : "Not quite. Try reviewing the content above."}
        </p>
      )}
    </div>
  );
}

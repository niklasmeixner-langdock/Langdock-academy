interface StepProps {
  number: number;
  children: React.ReactNode;
}

export function Step({ number, children }: StepProps) {
  return (
    <div className="flex gap-3 my-4 not-prose">
      <div className="shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
        {number}
      </div>
      <div className="text-sm text-gray-700 pt-1">{children}</div>
    </div>
  );
}

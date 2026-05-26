import { Info, AlertTriangle, Lightbulb } from "lucide-react";

interface CalloutProps {
  type?: "info" | "warning" | "tip";
  children: React.ReactNode;
}

const styles = {
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: <Info className="w-5 h-5 text-blue-600" />,
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
  },
  tip: {
    bg: "bg-green-50 border-green-200",
    icon: <Lightbulb className="w-5 h-5 text-green-600" />,
  },
};

export function Callout({ type = "info", children }: CalloutProps) {
  const style = styles[type];

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${style.bg} not-prose my-4`}>
      <div className="shrink-0 mt-0.5">{style.icon}</div>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
}

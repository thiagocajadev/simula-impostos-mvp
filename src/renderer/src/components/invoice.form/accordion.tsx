import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type AccordionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  icon?: ReactNode;
  summary?: ReactNode;
  className?: string;
  children: ReactNode;
};

function Accordion({
  title,
  isOpen,
  onToggle,
  icon,
  summary,
  className = "",
  children,
}: AccordionProps) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="section-title">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {!isOpen && summary}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-slate-100 px-5 pt-4 pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export { Accordion };

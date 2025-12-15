import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { cva } from "class-variance-authority";
import { ChevronRight, ChevronUp } from "lucide-react";

import { cn } from "~/lib/utils";

const triggerVariants = cva(
  "flex w-full items-center justify-between cursor-pointer transition-all duration-200 px-4 py-3 bg-white/5 rounded border border-transparent",
  {
    variants: {
      state: {
        closed: "hover:bg-white/10",
        open: "bg-white/10",
        errors: "bg-foreground/50",
      },
    },
    defaultVariants: {
      state: "closed",
    },
  },
);

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full h-6 w-6 transition-all duration-200 bg-primary text-primary-foreground",
  {
    variants: {
      state: {
        closed: "hover:bg-secondary hover:scale-105",
        open: "bg-secondary",
        errors: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      state: "closed",
    },
  },
);

interface CollapsibleSectionProps {
  children: React.ReactElement;
  sectionTitle: string;
  openItem: boolean;
  sectionHasErrors: boolean;
}

function CollapsibleSection({
  children,
  sectionTitle,
  openItem,
  sectionHasErrors,
}: CollapsibleSectionProps) {
  const getState = () => {
    if (sectionHasErrors) return "errors";
    return openItem ? "open" : "closed";
  };

  return (
    <AccordionItem value={sectionTitle}>
      <AccordionTrigger
        className={cn(triggerVariants({ state: getState() }))}
        aria-label={`Toggle ${sectionTitle}`}
      >
        <span
          className={cn(
            "text-sm font-medium",
            sectionHasErrors ? "text-destructive" : "text-foreground",
          )}
        >
          {sectionTitle}
        </span>
        <span className={cn(iconButtonVariants({ state: getState() }))}>
          {openItem ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
        </span>
      </AccordionTrigger>
      <AccordionContent className={cn("px-4 pt-2 pb-4")}>
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

export { CollapsibleSection };

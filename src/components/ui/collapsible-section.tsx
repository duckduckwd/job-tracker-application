import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { cva } from "class-variance-authority";
import { ChevronRight, ChevronUp } from "lucide-react";

import { cn } from "~/lib/utils";

const triggerVariants = cva(
  "flex w-full items-center justify-between cursor-pointer transition-all duration-200 px-4 py-3 bg-white/5",
  {
    variants: {
      state: {
        closed: "hover:bg-white/10",
        open: "bg-white/10",
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
      },
    },
    defaultVariants: {
      state: "closed",
    },
  },
);

function CollapsibleSection({
  children,
  sectionTitle,
  openItem,
}: {
  children: React.ReactElement;
  sectionTitle: string;
  openItem: boolean;
}) {
  return (
    <AccordionItem value={sectionTitle}>
      <AccordionTrigger
        className={cn(triggerVariants({ state: openItem ? "open" : "closed" }))}
        aria-label={`Toggle ${sectionTitle}`}
      >
        <span className="text-foreground text-sm font-medium">
          {sectionTitle}
        </span>
        <span
          className={cn(
            iconButtonVariants({ state: openItem ? "open" : "closed" }),
          )}
        >
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

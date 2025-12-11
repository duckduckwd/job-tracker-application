import * as Collapsible from "@radix-ui/react-collapsible";
import { cva } from "class-variance-authority";
import { ChevronRight, ChevronUp } from "lucide-react";
import { useState } from "react";

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
  rootProps,
  triggerProps,
  contentProps,
}: {
  children: React.ReactElement;
  sectionTitle: string;
  rootProps?: React.ComponentProps<typeof Collapsible.Root>;
  triggerProps?: React.ComponentProps<typeof Collapsible.Trigger>;
  contentProps?: React.ComponentProps<typeof Collapsible.Content>;
}) {
  const [open, setOpen] = useState(rootProps?.defaultOpen);
  return (
    <Collapsible.Root
      {...rootProps}
      onOpenChange={setOpen}
      className="border-border rounded-md border bg-white/5"
    >
      <Collapsible.Trigger
        {...triggerProps}
        className={cn(
          triggerVariants({ state: open ? "open" : "closed" }),
          triggerProps?.className,
        )}
        aria-label={`Toggle ${sectionTitle}`}
      >
        <span className="text-foreground text-sm font-medium">
          {sectionTitle}
        </span>
        <span
          className={cn(
            iconButtonVariants({ state: open ? "open" : "closed" }),
          )}
        >
          {open ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
        </span>
      </Collapsible.Trigger>
      <Collapsible.Content
        className={cn("px-4 pt-2 pb-4", contentProps?.className)}
        {...contentProps}
      >
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export { CollapsibleSection };

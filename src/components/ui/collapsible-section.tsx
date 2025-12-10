import "~/styles/collapsible.css";

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

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
      className="collapsible-section"
    >
      <Collapsible.Trigger
        {...triggerProps}
        className={`trigger ${open ? "trigger-open" : ""} `}
        aria-label={`Toggle ${sectionTitle}`}
      >
        <span className="text">{sectionTitle}</span>
        <span className="icon-button">
          {open ? <ChevronUp /> : <ChevronDown />}
        </span>
      </Collapsible.Trigger>
      <div className={`${open ? "content" : ""}`}>
        <Collapsible.Content {...contentProps}>{children}</Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
}

export { CollapsibleSection };

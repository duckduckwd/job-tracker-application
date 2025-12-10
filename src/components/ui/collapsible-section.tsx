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
    <Collapsible.Root {...rootProps} onOpenChange={setOpen}>
      <div className="trigger">
        <span className="text">{sectionTitle}</span>
        <Collapsible.Trigger {...triggerProps} asChild>
          <button className="icon-button">
            {open ? <ChevronUp /> : <ChevronDown />}
          </button>
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content {...contentProps}>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}

export { CollapsibleSection };

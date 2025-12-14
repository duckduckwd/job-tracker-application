import { memo } from "react";

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links: SkipLink[];
}

export const SkipLinks = memo(({ links }: SkipLinksProps) => (
  <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-50">
    {links.map((link, index) => (
      <a
        key={link.href}
        href={link.href}
        className={`rounded bg-blue-600 px-4 py-2 text-white underline focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          index > 0 ? "ml-2" : ""
        }`}
      >
        {link.label}
      </a>
    ))}
  </div>
));

SkipLinks.displayName = "SkipLinks";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type FooterLink = {
  label: string;
  href: string;
};

export function FooterLinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="font-heading font-black text-xs sm:text-sm text-neutral-900 uppercase tracking-wider mb-1">
        {title}
      </h4>
      <div className="w-6 h-0.5 bg-[#FF6A00] rounded-full mb-4" />
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-neutral-600 hover:text-[#FF6A00] transition-colors flex items-center gap-1.5 group font-body"
            >
              <ChevronRight className="w-3 h-3 text-[#FF6A00] group-hover:translate-x-0.5 transition-transform shrink-0" />
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
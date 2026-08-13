"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Общее" },
  { href: "/filials", label: "Филиалы" },
  { href: "/departments", label: "Службы" },
  { href: "/combined", label: "Комбинированно" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-10 border-b backdrop-blur"
      style={{
        background: "color-mix(in srgb, var(--surface-1) 92%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 h-14 overflow-x-auto">
        <span
          className="text-sm font-semibold mr-4 shrink-0"
          style={{ color: "var(--text-primary)" }}
        >
          Скрининг здоровья сотрудников
        </span>
        {LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors"
              style={{
                background: active ? "var(--series-1)" : "transparent",
                color: active ? "#ffffff" : "var(--text-secondary)",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

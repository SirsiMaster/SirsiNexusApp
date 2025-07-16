'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const pathname = usePathname();

  const segments = React.useMemo(() => {
    if (!pathname) return [];
    return pathname
      .split('/')
      .filter(Boolean)
      .map((segment) => ({
        name: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: `/${segment}`,
      }));
  }, [pathname]);

  return (
    <nav className="mb-6">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/"
            className="flex items-center text-caption text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
          >
              <Home className="mr-1 h-4 w-4" />
            Home
          </Link>
        </li>
        {segments.map((segment, index) => (
          <React.Fragment key={segment.href}>
          <ChevronRight className="h-4 w-4 text-slate-400" />
            <li>
              <Link
                href={segment.href}
                className={`text-caption transition-colors ${
                  index === segments.length - 1
                    ? 'text-emerald-600 nav-item'
                    : 'text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400'
                }`}
              >
                {segment.name}
              </Link>
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

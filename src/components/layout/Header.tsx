"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { GraduationCap, LogOut, Settings, User } from "lucide-react";

interface HeaderProps {
  breadcrumbs?: { label: string; href: string }[];
}

export function Header({ breadcrumbs }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="h-14 border-b border-gray-200 bg-white px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <span>Langdock Academy</span>
        </Link>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm text-gray-500">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                <span>/</span>
                <Link href={crumb.href} className="hover:text-gray-900 transition-colors">
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
      </div>

      {session?.user && (
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <Link
            href="/progress"
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
            title="My Progress"
          >
            <User className="w-4 h-4" />
          </Link>
          <button
            onClick={() => signOut()}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? ""}
              className="w-8 h-8 rounded-full"
            />
          )}
        </div>
      )}
    </header>
  );
}

"use client";

import { signOut, useSession } from "next-auth/react";

interface AppHeaderProps {
  titulo: string;
}

export function AppHeader({ titulo }: AppHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            VISA Londrina
          </p>
          <h1 className="text-lg font-semibold text-gray-900">{titulo}</h1>
        </div>
        <div className="flex items-center gap-4">
          {session?.user && (
            <div className="text-right text-sm">
              <p className="font-medium text-gray-900">{session.user.name}</p>
              <p className="text-gray-500">{session.user.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}

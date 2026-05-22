"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

export default function HomePage() {
  const { password, logout } = useAuth();
  const router = useRouter();

  if (!password) {
    router.replace("/");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-10 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-primary">
          Gutschein Generator
        </h1>
        <p className="text-center text-sm text-gray-500">
          Was möchten Sie tun?
        </p>
        <div className="flex flex-col gap-3">
          <button
            className="w-full rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-primary/30 transition-opacity hover:opacity-90 active:scale-[0.97]"
            onClick={() => router.push("/generate")}
          >
            Gutschein erstellen
          </button>
          <button
            className="w-full rounded-full bg-gray-800 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90 active:scale-[0.97]"
            onClick={() => router.push("/verify")}
          >
            Gutschein prüfen
          </button>
        </div>
        <button
          className="rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100"
          onClick={logout}
        >
          Abmelden
        </button>
      </div>
    </div>
  );
}

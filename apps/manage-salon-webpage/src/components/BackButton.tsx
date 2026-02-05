"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  text: string;
}

export default function BackButton({ text }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="text-base text-fg-muted hover:text-fg-normal flex items-center gap-2 bg-bg-1 px-4 py-2 rounded-md hover:bg-bg-2 transition-colors cursor-pointer"
    >
      <ChevronLeft className="w-4 h-4" /> {text}
    </button>
  );
}

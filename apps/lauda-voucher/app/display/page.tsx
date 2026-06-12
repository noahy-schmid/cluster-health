"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../lib/auth-context";
import { useStopwatch } from "../stopwatch/use-stopwatch";
import { formatDuration } from "../stopwatch/format-duration";
import { StopwatchDisplay } from "../stopwatch/stopwatch-display";

export default function DisplayPage() {
  const { password } = useAuth();
  const router = useRouter();

  const { isRunning, isStopped, isIdle, elapsedMs, teamLabel } =
    useStopwatch(password);

  useEffect(() => {
    if (!password) {
      router.replace("/");
    }
  }, [password, router]);

  if (!password) {
    return null;
  }

  return (
    <div className="relative flex h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden bg-accent text-white">
      <div className="absolute left-[3vw] top-[3vh] flex items-center gap-[1.5vw]">
        <div className="flex items-center gap-[1.5vw] rounded-2xl border-2 border-white/15 bg-white p-[0.8vw] shadow-lg">
          <Image
            src="/lauda-logo.png"
            alt="Event Logo"
            width={120}
            height={120}
            className="h-[8vh] max-h-24 w-auto object-contain"
            priority
          />
          <p
            data-display="true"
            className="text-[3.5vh] uppercase tracking-[0.35em] text-primary [-webkit-text-stroke:0.5px_black] [text-stroke:0.5px_black]"
          >
            STAMMHEIMER SEIFENKISTENRENNEN
          </p>
        </div>
      </div>

      {isIdle ? (
        <div className="flex flex-col items-center gap-[3vh] px-[6vw] text-center">
          <p className="text-[4vw] uppercase tracking-[0.3em] text-primary">
            Bereit
          </p>
          <p className="text-[7vw] font-bold leading-[1.05] [text-wrap:balance]">
            Nächster Lauf folgt in Kürze
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-[2vh] px-[4vw] text-center">
          {isStopped ? (
            <p className="text-[3.5vw] uppercase tracking-[0.3em] text-primary">
              Zielzeit
            </p>
          ) : null}

          {teamLabel ? (
            <p className="max-w-[92vw] text-[clamp(2rem,9vw,11rem)] font-bold leading-[1] [text-wrap:balance] text-white">
              {teamLabel}
            </p>
          ) : null}

          <StopwatchDisplay
            value={formatDuration(elapsedMs)}
            className="font-mono text-[clamp(4rem,22vw,26rem)] font-bold leading-[0.95] tabular-nums text-white"
          />

          <p className="text-[2.6vw] uppercase tracking-[0.4em] text-white/45">
            {isRunning ? "Läuft" : "Gestoppt"}
          </p>
        </div>
      )}
    </div>
  );
}

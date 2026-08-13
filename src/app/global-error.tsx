"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error(error.message, { digest: error.digest, stack: error.stack, scope: "root-layout" });
  }, [error]);

  return (
    <html lang="en">
      <body style={{ padding: "3rem", textAlign: "center" }}>
        <h1>Application error</h1>
        <p>A critical error occurred. You can try again.</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}

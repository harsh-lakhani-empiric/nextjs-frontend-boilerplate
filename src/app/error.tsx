"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error(error.message, { digest: error.digest, stack: error.stack });
  }, [error]);

  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred. You can try again.</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

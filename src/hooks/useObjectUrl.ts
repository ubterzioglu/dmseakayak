import { useEffect, useState } from "react";

/**
 * Returns a stable object URL for a File and revokes the previous one whenever
 * the file changes or the component unmounts. Avoids the leak from calling
 * URL.createObjectURL() inline on every render. When `file` is null, falls back
 * to `fallbackUrl` (e.g. an already-uploaded image URL).
 */
export function useObjectUrl(file: File | null, fallbackUrl: string | null = null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return file ? url : fallbackUrl;
}

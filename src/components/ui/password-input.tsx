import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Accessible label for the show/hide toggle. */
  toggleLabel?: string;
}

/**
 * Password field with a built-in show/hide toggle so users can verify what
 * they typed. Forwards all native input props (value, onChange, id, etc.).
 */
export function PasswordInput({
  className,
  toggleLabel = "Şifreyi göster/gizle",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const fallbackId = useId();
  const inputId = props.id ?? fallbackId;

  return (
    <div className="relative">
      <input
        {...props}
        id={inputId}
        type={visible ? "text" : "password"}
        className={cn(
          "w-full rounded-2xl border border-teal/15 bg-[#fcfbf8] px-4 py-3 pr-12 text-base outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10",
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={toggleLabel}
        aria-pressed={visible}
        tabIndex={-1}
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-teal/55 transition hover:bg-foam hover:text-teal-deep"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

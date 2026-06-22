import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { friendlyAuthError } from "@/lib/authErrors";
import { Modal } from "@/components/ui/modal";
import { PasswordInput } from "@/components/ui/password-input";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const MIN_LENGTH = 8;

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setPassword("");
    setConfirm("");
    setError("");
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!supabase) return setError("Supabase yapılandırılmamış.");
    if (password.length < MIN_LENGTH) {
      return setError(`Şifre en az ${MIN_LENGTH} karakter olmalı.`);
    }
    if (password !== confirm) {
      return setError("Şifreler eşleşmiyor.");
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(friendlyAuthError(error));
      return;
    }
    setSuccess(true);
    setPassword("");
    setConfirm("");
    toast.success("Şifren başarıyla güncellendi.");
  };

  return (
    <Modal open={open} onClose={handleClose} labelledBy="change-pass-title" className="max-w-md">
      <div className="p-8">
        <div className="mb-4 inline-flex rounded-full border border-orange/20 bg-orange/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange">
          Güvenlik
        </div>
        <h2 id="change-pass-title" className="mb-1 font-serif text-3xl leading-none text-teal-deep">
          Şifre Değiştir
        </h2>
        <p className="mb-5 text-sm text-teal/60">
          Yeni şifreni belirle. En az {MIN_LENGTH} karakter olmalı.
        </p>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-teal/15 bg-teal/5 p-4 text-sm font-semibold text-teal-deep">
              ✓ Şifren başarıyla güncellendi.
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-full bg-teal py-3 font-semibold text-white transition-colors hover:bg-teal-light"
            >
              Kapat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep" htmlFor="new-pass">
                Yeni Şifre
              </label>
              <PasswordInput
                id="new-pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-teal-deep" htmlFor="confirm-pass">
                Yeni Şifre (tekrar)
              </label>
              <PasswordInput
                id="confirm-pass"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-orange py-3 font-semibold text-white transition-colors hover:bg-orange-soft disabled:opacity-50"
              >
                {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-teal/20 px-6 py-3 font-semibold text-teal hover:bg-foam"
              >
                Vazgeç
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

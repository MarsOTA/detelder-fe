import { useState } from "react";
import { ezystaffBEUrl } from "../../utils/baseUrl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";

const rememberedUsername = localStorage.getItem("rememberedUsername") || "";

export default function Login() {
  const [username, setUsername] = useState(rememberedUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedUsername));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const values = { username, password };

      const resp = await fetch(ezystaffBEUrl + "auth/login", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });

      const data = await resp.json();

      if (!data.success) {
        setError(data.message || "Credenziali non valide. Riprova.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("ruolo", data.dipendente.ruolo);
      localStorage.setItem("idOperatore", data.dipendente.id);
      localStorage.setItem(
        "operatoreLoggato",
        `${data.dipendente.nome} ${data.dipendente.cognome}`
      );

      const ruolo = data.dipendente.ruolo;

      if (ruolo === "ADMIN") {
        navigate("/admin/turni");
      } else if (ruolo === "OPERATORE") {
        navigate("/operator");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Impossibile accedere in questo momento. Riprova tra poco.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-black px-4 py-3 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src={logo}
          alt=""
          className="absolute left-1/2 top-1/2 w-[150vw] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.035] sm:w-[105vw] lg:w-[88vw]"
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col justify-center sm:min-h-[calc(100dvh-3rem)]">
        <section className="w-full">
          <div className="mb-4 flex justify-center sm:mb-5">
            <img
              src={logo}
              alt="Detelder"
              className="h-auto w-[176px] sm:w-[215px]"
            />
          </div>

          <div className="relative overflow-hidden rounded-[26px] border border-white/45 bg-white/[0.82] p-4 shadow-[0_28px_80px_-30px_rgba(0,0,0,0.95)] backdrop-blur-2xl backdrop-saturate-150 sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-white/35 blur-2xl"
            />

            <div className="relative mb-4 text-center sm:mb-5">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/50 bg-black/[0.88] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_22px_-10px_rgba(0,0,0,0.8)]">
                <LogIn className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </div>
              <h1 className="text-[27px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[29px]">
                Bentornato
              </h1>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500 sm:text-xs">
                Detelder · Workforce &amp; Event Management
              </p>
              <p className="mt-2 text-[13px] leading-5 text-slate-600 sm:text-sm">
                Accedi alla piattaforma per gestire turni, operatori ed eventi.
              </p>
            </div>

            <form onSubmit={submitLogin} className="relative space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-[13px] font-medium text-slate-700">
                  Username
                </Label>
                <div className="relative">
                  <UserRound
                    className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-500"
                    strokeWidth={1.8}
                  />
                  <Input
                    id="username"
                    type="text"
                    inputMode="text"
                    autoComplete="username"
                    placeholder="Inserisci il tuo username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 rounded-[13px] border-white/65 bg-white/55 pl-10 pr-4 text-[16px] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_1px_5px_rgba(15,23,42,0.06)] backdrop-blur-md transition placeholder:text-slate-400 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/70"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[13px] font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-500"
                    strokeWidth={1.8}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Inserisci la password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 rounded-[13px] border-white/65 bg-white/55 pl-10 pr-11 text-[16px] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_1px_5px_rgba(15,23,42,0.06)] backdrop-blur-md transition placeholder:text-slate-400 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/70"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[10px] text-slate-500 transition hover:bg-white/55 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[17px] w-[17px]" strokeWidth={1.8} />
                    ) : (
                      <Eye className="h-[17px] w-[17px]" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex min-h-7 cursor-pointer items-center gap-2.5 text-[13px] text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-slate-950"
                />
                <span>Remember me</span>
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200/70 bg-red-50/80 px-3.5 py-2.5 text-[13px] leading-5 text-red-700 backdrop-blur"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-[13px] bg-black/[0.9] text-[14px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_24px_-14px_rgba(0,0,0,0.9)] transition hover:bg-black active:scale-[0.99] disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Accesso in corso...
                  </span>
                ) : (
                  "Accedi"
                )}
              </Button>
            </form>
          </div>

          <p className="mt-3 text-center text-[11px] leading-5 text-white/45 sm:mt-4 sm:text-xs">
            Developed by <span className="font-medium text-white/75">OTA Digital</span>
          </p>
        </section>
      </div>
    </main>
  );
}

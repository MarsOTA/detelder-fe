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
    <main className="relative min-h-[100dvh] overflow-hidden bg-black px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src={logo}
          alt=""
          className="absolute left-1/2 top-1/2 w-[150vw] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.035] sm:w-[105vw] lg:w-[88vw]"
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-md flex-col justify-center sm:min-h-[calc(100dvh-5rem)]">
        <section className="w-full">
          <div className="mb-7 flex justify-center sm:mb-9">
            <img
              src={logo}
              alt="Detelder"
              className="h-auto w-[190px] sm:w-[230px]"
            />
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white p-5 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.9)] sm:p-8">
            <div className="mb-7 text-center sm:mb-8">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
                <LogIn className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
                Bentornato
              </h1>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-400 sm:text-[13px]">
                Detelder · Workforce &amp; Event Management
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-[15px]">
                Accedi alla piattaforma per gestire turni, operatori ed eventi.
              </p>
            </div>

            <form onSubmit={submitLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Username
                </Label>
                <div className="relative">
                  <UserRound
                    className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
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
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-4 text-[16px] text-slate-900 shadow-none transition focus-visible:border-slate-400 focus-visible:ring-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
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
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-12 text-[16px] text-slate-900 shadow-none transition focus-visible:border-slate-400 focus-visible:ring-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                    aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm text-slate-600">
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
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-1 h-12 w-full rounded-xl bg-slate-950 text-[15px] font-medium text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
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

          <p className="mt-6 text-center text-xs leading-5 text-white/45 sm:mt-7">
            Developed by <span className="font-medium text-white/70">OTA Digital</span>
          </p>
        </section>
      </div>
    </main>
  );
}

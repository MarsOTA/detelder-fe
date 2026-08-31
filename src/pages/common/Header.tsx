import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarSync,
  BookmarkCheck,
  Users,
  UserRoundCheck,
  Factory,
  ReceiptEuro,
  LogOut,
  CircleUserRound,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { ezystaffBEUrl } from "../../utils/baseUrl";

type AdminTheme = "light" | "dark";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const [adminTheme, setAdminTheme] = useState<AdminTheme>(() =>
    localStorage.getItem("adminTheme") === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("admin-dark", adminTheme === "dark");
    root.dataset.adminTheme = adminTheme;
    localStorage.setItem("adminTheme", adminTheme);

    return () => {
      root.classList.remove("admin-dark");
      delete root.dataset.adminTheme;
    };
  }, [adminTheme]);

  const logout = async () => {
    const resp = await fetch(ezystaffBEUrl + "auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });

    await resp.json();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAccountOpen(false);
    navigate("/login");
  };

  const isEventiActive =
    location.pathname === "/admin/eventi" ||
    location.pathname.includes("/admin/crea-evento") ||
    location.pathname.startsWith("/admin/gestione-turni/");

  const isOperatoriActive =
    location.pathname === "/admin/operatori" ||
    location.pathname.includes("/admin/dettaglio-operatore") ||
    location.pathname.includes("/admin/assegnaEvento-operatore") ||
    location.pathname.includes("/admin/timbrature-operatore");

  const navItems = [
    { label: "Turni", to: "/admin/turni", active: location.pathname === "/admin/turni", icon: CalendarSync },
    { label: "Eventi", to: "/admin/eventi", active: isEventiActive, icon: BookmarkCheck },
    { label: "Presenze", to: "/admin/presenze", active: location.pathname === "/admin/presenze", icon: UserRoundCheck },
    { label: "Operatori", to: "/admin/operatori", active: isOperatoriActive, icon: Users },
    { label: "Clienti", to: "/admin/clienti", active: location.pathname === "/admin/clienti", icon: Factory },
    { label: "Payroll", to: "/admin/payroll", active: location.pathname === "/admin/payroll", icon: ReceiptEuro },
  ];

  return (
    <header className="admin-header sticky top-0 z-50 border-b border-[#183642] bg-[#061821]/95 shadow-[0_8px_28px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="mx-auto flex h-[66px] max-w-[1760px] items-center justify-between gap-5 px-6">
        <Link to="/admin/turni" className="flex shrink-0 items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16f0c4]/60">
          <img src="/assets/logo.svg" alt="Detelder" className="h-[43px] w-[138px] object-contain" />
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1.5" style={{ fontFamily: "'Mulish', sans-serif" }}>
          {navItems.map(({ label, to, active, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className={`group relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[14px] font-bold tracking-[-0.01em] transition-all duration-200 ${
                active
                  ? "bg-[#12313c] text-[#16f0c4] shadow-[inset_0_0_0_1px_rgba(22,240,196,0.18)]"
                  : "text-[#b8c7cb] hover:bg-[#0c2631] hover:text-[#edf7f6]"
              }`}
            >
              <Icon
                strokeWidth={1.7}
                className={`h-[19px] w-[19px] transition-colors ${
                  active ? "text-[#16f0c4]" : "text-[#7f969e] group-hover:text-[#16f0c4]"
                }`}
              />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="relative shrink-0" style={{ fontFamily: "'Mulish', sans-serif" }}>
          <button
            type="button"
            onClick={() => setAccountOpen((open) => !open)}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[14px] font-bold transition-all focus:outline-none ${
              accountOpen
                ? "border-[#16f0c4]/30 bg-[#12313c] text-[#16f0c4]"
                : "border-transparent text-[#d6e1e3] hover:border-[#294653] hover:bg-[#0c2631] hover:text-white"
            }`}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
          >
            <CircleUserRound strokeWidth={1.6} className="h-5 w-5" />
            <span>Admin</span>
            <ChevronDown strokeWidth={1.6} className={`h-4 w-4 transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`} />
          </button>

          {accountOpen && (
            <div
              role="menu"
              className="admin-account-menu absolute right-0 top-[calc(100%+10px)] min-w-[248px] overflow-hidden rounded-2xl border border-[#dfe8e5] bg-white p-1.5 shadow-[0_20px_48px_rgba(0,0,0,0.28)]"
            >
              <div className="admin-account-heading border-b border-[#edf1ef] px-3 py-3">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8d9b97]">Account</div>
                <div className="mt-1 text-sm font-extrabold text-[#313131]">Amministratore</div>
              </div>

              <div className="px-3 py-3">
                <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8d9b97]">Aspetto</div>
                <div className="admin-theme-switch grid grid-cols-2 gap-1 rounded-xl bg-[#eef3f1] p-1">
                  <button
                    type="button"
                    onClick={() => setAdminTheme("light")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold transition-all ${
                      adminTheme === "light"
                        ? "bg-white text-[#007a55] shadow-sm"
                        : "text-[#66736e] hover:text-[#007a55]"
                    }`}
                    aria-pressed={adminTheme === "light"}
                  >
                    <Sun className="h-4 w-4" strokeWidth={1.8} />
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTheme("dark")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold transition-all ${
                      adminTheme === "dark"
                        ? "bg-[#102934] text-[#16f0c4] shadow-sm"
                        : "text-[#66736e] hover:text-[#007a55]"
                    }`}
                    aria-pressed={adminTheme === "dark"}
                  >
                    <Moon className="h-4 w-4" strokeWidth={1.8} />
                    Dark
                  </button>
                </div>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="admin-logout mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[#4d4d4d] transition-colors duration-150 hover:bg-[#f2f6f4] hover:text-[#007a55]"
              >
                <LogOut strokeWidth={1.6} className="h-[18px] w-[18px]" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

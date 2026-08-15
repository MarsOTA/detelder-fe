import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarSync,
  Calendars,
  Users,
  UserRoundCheck,
  Factory,
  ReceiptEuro,
  LogOut,
  CircleUserRound,
  ChevronDown,
} from "lucide-react";
import { ezystaffBEUrl } from "../../utils/baseUrl";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);

  const logout = async () => {
    const resp = await fetch(ezystaffBEUrl + "auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });

    const data = await resp.json();
    console.log(data);

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
    {
      label: "Turni",
      to: "/admin/turni",
      active: location.pathname === "/admin/turni",
      icon: CalendarSync,
    },
    {
      label: "Eventi",
      to: "/admin/eventi",
      active: isEventiActive,
      icon: Calendars,
    },
    {
      label: "Presenze",
      to: "/admin/presenze",
      active: location.pathname === "/admin/presenze",
      icon: UserRoundCheck,
    },
    {
      label: "Operatori",
      to: "/admin/operatori",
      active: isOperatoriActive,
      icon: Users,
    },
    {
      label: "Clienti",
      to: "/admin/clienti",
      active: location.pathname === "/admin/clienti",
      icon: Factory,
    },
    {
      label: "Payroll",
      to: "/admin/payroll",
      active: location.pathname === "/admin/payroll",
      icon: ReceiptEuro,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#2f3130]/95 shadow-[0_4px_18px_rgba(0,0,0,0.12)] backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-[1600px] items-center justify-between gap-6 px-6">
        <Link to="/admin/turni" className="flex shrink-0 items-center">
          <img
            src="/assets/logo.svg"
            alt="Detelder"
            className="h-[42px] w-[132px] object-contain"
          />
        </Link>

        <nav
          className="flex flex-1 items-center justify-center gap-1"
          style={{ fontFamily: "'Mulish', sans-serif" }}
        >
          {navItems.map(({ label, to, active, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-bold tracking-[-0.01em] transition-all duration-200 ease-out ${
                active
                  ? "bg-white/[0.08] text-[#a5e8cf] shadow-[inset_0_0_0_1px_rgba(165,232,207,0.08)]"
                  : "text-white/80 hover:text-[#a5e8cf]"
              }`}
            >
              <Icon
                strokeWidth={1}
                className={`h-4 w-4 transition-colors duration-200 ${
                  active ? "text-[#a5e8cf]" : "text-white/55 group-hover:text-[#a5e8cf]"
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
            className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[14px] font-bold transition-all duration-200 focus:outline-none ${
              accountOpen
                ? "bg-white/[0.08] text-[#a5e8cf]"
                : "text-white/85 hover:text-[#a5e8cf]"
            }`}
            aria-expanded={accountOpen}
            aria-haspopup="menu"
          >
            <CircleUserRound strokeWidth={1} className="h-[18px] w-[18px]" />
            <span>Admin</span>
            <ChevronDown
              strokeWidth={1}
              className={`h-3.5 w-3.5 transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`}
            />
          </button>

          {accountOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+10px)] min-w-[180px] overflow-hidden rounded-2xl border border-[#dfe8e5] bg-white p-1.5 shadow-[0_16px_38px_rgba(0,0,0,0.2)]"
            >
              <div className="border-b border-[#edf1ef] px-3 py-2.5">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#9a9a9a]">Account</div>
                <div className="mt-0.5 text-sm font-extrabold text-[#313131]">Admin</div>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[#4d4d4d] transition-colors duration-150 hover:text-[#007a55]"
              >
                <LogOut strokeWidth={1} className="h-4 w-4" />
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

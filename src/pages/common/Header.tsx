import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Building2, LogOut, Calendar, CircleUserRound, ChevronDown } from "lucide-react";
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

  const navButtonClass = (active: boolean) => `
    cursor-pointer border border-[#a5e8cf] bg-[#313131]
    hover:border-[#a5e8cf] hover:bg-[#313131]
    ${active
      ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
      : "text-white hover:text-[#a5e8cf]"
    }
  `;

  return (
    <header className="border-b sticky top-0 z-50 bg-[#313131]">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="w-44 h-16">
          <img
            src="/assets/logo.svg"
            alt="Logo"
            className="w-full h-full object-contain block"
          />
        </div>

        <div className="flex gap-4">
          <Link to="/admin/turni">
            <Button
              variant={location.pathname === "/admin/turni" ? "default" : "outline"}
              className={navButtonClass(location.pathname === "/admin/turni")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Turni
            </Button>
          </Link>

          <Link to="/admin/eventi">
            <Button
              variant={
                location.pathname === "/admin/eventi" ||
                location.pathname.startsWith("/admin/gestione-turni/")
                  ? "default"
                  : "outline"
              }
              className={navButtonClass(
                location.pathname === "/admin/eventi" ||
                location.pathname.includes("/admin/crea-evento") ||
                location.pathname.startsWith("/admin/gestione-turni/")
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Eventi
            </Button>
          </Link>

          <Link to="/admin/presenze">
            <Button
              variant={location.pathname === "/admin/presenze" ? "default" : "outline"}
              className={navButtonClass(location.pathname === "/admin/presenze")}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Presenze
            </Button>
          </Link>

          <Link to="/admin/operatori">
            <Button
              variant={
                location.pathname === "/admin/operatori" ||
                location.pathname.includes("/admin/dettaglio-operatore") ||
                location.pathname.includes("/admin/assegnaEvento-operatore") ||
                location.pathname.includes("/admin/timbrature-operatore")
                  ? "default"
                  : "outline"
              }
              className={navButtonClass(
                location.pathname === "/admin/operatori" ||
                location.pathname.includes("/admin/dettaglio-operatore") ||
                location.pathname.includes("/admin/assegnaEvento-operatore") ||
                location.pathname.includes("/admin/timbrature-operatore")
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Operatori
            </Button>
          </Link>

          <Link to="/admin/clienti">
            <Button
              variant={location.pathname === "/admin/clienti" ? "default" : "outline"}
              className={navButtonClass(location.pathname === "/admin/clienti")}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Clienti
            </Button>
          </Link>

          <Link to="/admin/payroll">
            <Button
              variant={location.pathname === "/admin/payroll" ? "default" : "outline"}
              className={navButtonClass(location.pathname === "/admin/payroll")}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Payroll
            </Button>
          </Link>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setAccountOpen((open) => !open)}
            className="group flex items-center gap-2 rounded-full px-3 py-2 text-[#a5e8cf] transition-colors duration-200 hover:text-white focus:outline-none"
            aria-expanded={accountOpen}
            aria-haspopup="menu"
          >
            <CircleUserRound className="h-5 w-5" />
            <span className="font-semibold">Admin</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`}
            />
          </button>

          {accountOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] min-w-[170px] overflow-hidden rounded-xl border border-[#dfe8e5] bg-white p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#4d4d4d] transition-colors duration-150 hover:bg-[#edf3f1] hover:text-[#007a55]"
              >
                <LogOut className="h-4 w-4" />
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

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Briefcase, Menu, X, CalendarClock, UserCheck, Clock3 } from "lucide-react";
import { ezystaffBEUrl } from "../../utils/baseUrl";
import { useState } from "react";

const HeaderOperatore = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const operatoreLoggato = localStorage.getItem('operatoreLoggato');
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    try {
      await fetch(ezystaffBEUrl + 'auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          accept: 'application/json'
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('ruolo');
      localStorage.removeItem('idOperatore');
      localStorage.removeItem('operatoreLoggato');
      navigate("/login");
    }
  }

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const navItems = [
    { to: '/operator', label: 'Turni di oggi', icon: Briefcase },
    { to: '/operator/turniFuturi', label: 'Prossimi turni', icon: CalendarClock },
    { to: '/operator/presenze', label: 'Presenze', icon: Clock3 },
    { to: '/operator/rendicontazione', label: 'Rendicontazione', icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#173342] bg-[#031522]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-5">
        <Link to="/operator" className="flex h-14 items-center">
          <img
            src="/assets/logo.svg"
            alt="Detelder"
            className="h-10 w-auto max-w-[170px] object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}>
                <Button
                  variant="ghost"
                  className={`h-10 rounded-xl px-3 text-sm hover:bg-[#0c2b3b] hover:text-[#08efbd] ${active ? 'bg-[#0b2d39] text-[#08efbd]' : 'text-[#c2d0d7]'}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </Button>
              </Link>
            )
          })}

          {operatoreLoggato && (
            <div className="ml-2 rounded-full border border-[#1b4a4a] bg-[#0a3434] px-3 py-2 text-xs font-semibold text-[#9ce3d2]">
              {operatoreLoggato}
            </div>
          )}

          <Button variant="ghost" onClick={logout} className="ml-1 text-[#c2d0d7] hover:bg-[#2b1d20] hover:text-[#ff9b9b]">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          className="text-[#08efbd] hover:bg-[#0b2d39] hover:text-[#08efbd] lg:hidden"
          aria-label="Apri menu"
        >
          {menuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
        </Button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#173342] bg-[#061a28] px-4 pb-4 pt-3 lg:hidden">
          <div className="mx-auto w-full max-w-[430px] space-y-1.5">
            {operatoreLoggato && (
              <div className="mb-3 rounded-xl border border-[#1b4a4a] bg-[#0a3434] px-3 py-2 text-sm font-semibold text-[#9ce3d2]">
                {operatoreLoggato}
              </div>
            )}

            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} onClick={toggleMenu}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl ${active ? 'bg-[#0b2d39] text-[#08efbd]' : 'text-[#d6e0e5] hover:bg-[#0b2d39] hover:text-[#08efbd]'}`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {label}
                  </Button>
                </Link>
              )
            })}

            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start rounded-xl text-[#ffb0b0] hover:bg-[#2b1d20] hover:text-[#ffb0b0]"
            >
              <LogOut className="mr-3 h-5 w-5" /> Logout
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

export default HeaderOperatore;
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Briefcase, Menu, X, CalendarClock, UserCheck } from "lucide-react";
import { ezystaffBEUrl } from "../../utils/baseUrl";
import { useState } from "react";


const HeaderOperatore = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const operatoreLoggato = localStorage.getItem('operatoreLoggato');

  const logout = async () => {
    // window.location.reload();

    const resp = await fetch(ezystaffBEUrl + 'auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      }
    });

    const data = await resp.json();

    console.log(data);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/login");

  }
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(prev => !prev);


  const content = (
    <header className="border-b sticky top-0 z-50 bg-[#313131]">
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-center">
        {/* Titolo e menu hamburger (mobile) */}
        <div className="flex justify-between items-center w-full md:w-auto">
          {/*<div className="text-2xl font-bold">Security Operator</div> */}
          <div className="w-44 h-16">
            <img
              src="/assets/logo.svg"
              alt="Logo"
              className="w-full h-full object-contain block"
            />
          </div>

          {/* Mobile: bottone menu */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-[#3AE3A4]">
              {menuOpen ? (<X className="size-8" />) : (<Menu className="size-8" />)}
            </Button>
          </div>
        </div>

        <nav className="hidden md:flex gap-4 items-center mt-4 md:mt-0">
          <div className="bg-[#A5E8CF] text-[#00533A] px-3 py-2 rounded-xl font-medium  self-start">
            {operatoreLoggato}
          </div>
          <Link to="/operator">
            <Button
              variant={location.pathname === "/operator" ? "default" : "outline"}
              className={`cursor-pointer 
                          bg-[#313131] 
                          border-0
                          hover:bg-[#313131]
                          ${location.pathname === "/operator"
                  ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                  : "text-white hover:text-[#a5e8cf]"
                }`}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Tasks
            </Button>
          </Link>
          <Link to="/operator/turniFuturi">
            <Button variant={location.pathname === "/operator/turniFuturi" ? "default" : "outline"}
              className={`cursor-pointer bg-[#313131] border-0 hover:bg-[#313131]
                ${location.pathname === "/operator/turniFuturi"
                  ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                  : "text-white hover:text-[#a5e8cf]"
                }`}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Turni Futuri
            </Button>
          </Link>
          <Link to="/operator/presenze">
            <Button variant={location.pathname === "/operator/presenze" ? "default" : "outline"}
              className={`cursor-pointer bg-[#313131] border-0 hover:bg-[#313131]
                ${location.pathname === "/operator/presenze"
                  ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                  : "text-white hover:text-[#a5e8cf]"
                }`}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Presenze
            </Button>
          </Link>
          <Link to="/operator/rendicontazione">
            <Button variant={location.pathname === "/operator/rendicontazione" ? "default" : "outline"}
              className={`cursor-pointer bg-[#313131] border-0 hover:bg-[#313131]
                ${location.pathname === "/operator/rendicontazione"
                  ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                  : "text-white hover:text-[#a5e8cf]"
                }`}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Rendicontazione
            </Button>
          </Link>
          <Button variant="outline" onClick={logout}
            className={`cursor-pointer 
                  bg-[#313131]  border-0
                  text-white hover:bg-[#313131] hover:text-[#a5e8cf]
                  "
                `}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>


        {/* Menu mobile (sotto il titolo) */}
        {menuOpen && (
          <nav className="flex flex-col gap-2 mt-4 md:hidden">
            <div className="bg-[#A5E8CF] text-[#00533A] px-3 py-2 rounded-xl font-medium  self-start">
              {operatoreLoggato}
            </div>
            <Link to="/operator" onClick={toggleMenu}>
              <Button
                className={`cursor-pointer w-full justify-start
                    bg-[#313131] 
                    border-0
                    hover:bg-[#313131]
                    ${location.pathname === "/operator"
                    ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                    : "text-white hover:text-[#a5e8cf]"
                  }`}
                variant={location.pathname === "/operator" ? "default" : "outline"}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Task
              </Button>
            </Link>
            <Link to="/operator/turniFuturi" onClick={toggleMenu}>
              <Button
                className={`cursor-pointer w-full justify-start
                    bg-[#313131] 
                    border-0
                    hover:bg-[#313131]
                    ${location.pathname === "/operator/turniFuturi"
                    ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                    : "text-white hover:text-[#a5e8cf]"
                  }`}
                variant={location.pathname === "/operator/turniFuturi" ? "default" : "outline"}
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                Turni Futuri
              </Button>
            </Link>
            <Link to="/operator/presenze" onClick={toggleMenu}>
              <Button
                className={`cursor-pointer w-full justify-start
                    bg-[#313131] 
                    border-0
                    hover:bg-[#313131]
                    ${location.pathname === "/operator/presenze"
                    ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                    : "text-white hover:text-[#a5e8cf]"
                  }`}
                variant={location.pathname === "/operator/presenze" ? "default" : "outline"}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Presenze
              </Button>
            </Link>
            <Link to="/operator/rendicontazione" onClick={toggleMenu}>
              <Button
                className={`cursor-pointer w-full justify-start
                    bg-[#313131] 
                    border-0
                    hover:bg-[#313131]
                    ${location.pathname === "/operator/rendicontazione"
                    ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                    : "text-white hover:text-[#a5e8cf]"
                  }`}
                variant={location.pathname === "/operator/rendicontazione" ? "default" : "outline"}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Rendicontazione
              </Button>
            </Link>
            <Button
              className={`cursor-pointer  w-full justify-start
                bg-[#313131]  border-0
                text-white hover:bg-[#313131] hover:text-[#a5e8cf]
                "
              `}
              variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
        )}

      </div>
    </header>
  )

  return content
}

export default HeaderOperatore
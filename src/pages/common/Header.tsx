import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Building2, LogOut, Calendar, CircleUserRound } from "lucide-react";
import { ezystaffBEUrl } from "../../utils/baseUrl";

const Header = () => {

  const location = useLocation();
  const navigate = useNavigate();

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


  const content = (
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
            <Button variant={(location.pathname === "/admin/turni") ? "default" : "outline"}
              className={`cursor-pointer border border-[#a5e8cf] bg-[#313131] hover:border-[#a5e8cf] hover:bg-[#313131] 
                ${location.pathname === "/admin/turni"
                  ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                  : "text-white hover:text-[#a5e8cf]"
                }`}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Turni
            </Button>
          </Link>
          <Link to="/admin/eventi">
            <Button variant={(location.pathname === "/admin/eventi"
              || location.pathname.startsWith("/admin/gestione-turni/")
            ) ? "default" : "outline"}
              className={`cursor-pointer border border-[#a5e8cf] bg-[#313131] hover:border-[#a5e8cf] hover:bg-[#313131] 
                ${(location.pathname === "/admin/eventi"
                  || location.pathname.includes("/admin/crea-evento")
                  || location.pathname.startsWith("/admin/gestione-turni/")
                )
                  ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                  : "text-white hover:text-[#a5e8cf]"
                }`}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Eventi
            </Button>
          </Link>
          <Link to="/admin/presenze">
            <Button variant={(location.pathname === "/admin/presenze") ? "default" : "outline"}
              className={`cursor-pointer border border-[#a5e8cf] bg-[#313131] hover:border-[#a5e8cf] hover:bg-[#313131] 
                ${location.pathname === "/admin/presenze"
                  ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                  : "text-white hover:text-[#a5e8cf]"
                }`}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Presenze
            </Button>
          </Link>
          <Link to="/admin/operatori">
            <Button variant={(location.pathname === "/admin/operatori"
              || location.pathname.includes("/admin/dettaglio-operatore")
              || location.pathname.includes("/admin/assegnaEvento-operatore")
              || location.pathname.includes("/admin/timbrature-operatore")
            ) ? "default" : "outline"}
              className={`cursor-pointer border border-[#a5e8cf] bg-[#313131] hover:border-[#a5e8cf] hover:bg-[#313131] 
                ${(location.pathname === "/admin/operatori"
                  || location.pathname.includes("/admin/dettaglio-operatore")
                  || location.pathname.includes("/admin/assegnaEvento-operatore")
                  || location.pathname.includes("/admin/timbrature-operatore")
                )
                  ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                  : "text-white hover:text-[#a5e8cf]"
                }`}
            >
              <Users className="mr-2 h-4 w-4" />
              Operatori
            </Button>
          </Link>
          <Link to="/admin/clienti">
            <Button variant={(location.pathname === "/admin/clienti") ? "default" : "outline"}
              className={`cursor-pointer border border-[#a5e8cf] bg-[#313131] hover:border-[#a5e8cf] hover:bg-[#313131] 
                ${location.pathname === "/admin/clienti"
                  ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                  : "text-white hover:text-[#a5e8cf]"
                }`}
            >

              <Building2 className="mr-2 h-4 w-4" />
              Clienti
            </Button>
          </Link>         
          <Link to="/admin/payroll">
            <Button variant={(location.pathname === "/admin/payroll") ? "default" : "outline"}
              className={`cursor-pointer border border-[#a5e8cf] bg-[#313131] hover:border-[#a5e8cf] hover:bg-[#313131] 
                ${location.pathname === "/admin/payroll"
                  ? "text-[#a5e8cf] hover:text-[#a5e8cf]"
                  : "text-white hover:text-[#a5e8cf]"
                }`}
            >

              <Building2 className="mr-2 h-4 w-4" />
              Payroll
            </Button>
          </Link>          
          <Button variant="outline" onClick={logout}
            className={`cursor-pointer 
                border 
                border-[#a5e8cf] 
                bg-[#313131] hover:border-[#a5e8cf] 
                hover:bg-[#313131] text-white 
                hover:text-[#a5e8cf]"
              `}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="flex items-center text-[#a5e8cf]">
          <CircleUserRound className="mr-2 h-4 w-4" />
          Admin
        </div>

      </div>
    </header>
  )

  return content
}

export default Header
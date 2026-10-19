import { Link,useNavigate } from "react-router-dom";
import { LogOut,ClipboardCheck } from "lucide-react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
export default function HeaderHR(){
 const navigate=useNavigate();
 const logout=async()=>{
  await fetch(ezystaffBEUrl+"auth/logout",{method:"POST",credentials:"include"}).catch(()=>null);
  ["token","ruolo","idOperatore","operatoreLoggato"].forEach(x=>localStorage.removeItem(x));
  navigate("/login",{replace:true});
 };
 return <header className="sticky top-0 z-50 border-b bg-[#313131] text-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3"><Link to="/hr" className="flex items-center gap-2 font-bold"><ClipboardCheck className="h-5 w-5 text-[#a5e8cf]"/>DETELDER · HR</Link><div className="flex items-center gap-4"><Link className="inline-flex items-center gap-2 rounded-md border border-[#a5e8cf] px-3 py-2 text-sm font-semibold text-[#a5e8cf] hover:bg-[#3c4c47]" to="/hr"><ClipboardCheck className="h-4 w-4"/>HR</Link><button className="flex items-center gap-1 text-sm hover:text-[#a5e8cf]" onClick={()=>void logout()}><LogOut className="h-4 w-4"/>Esci</button></div></div></header>;
}

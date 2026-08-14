
import { TimbratureComponent } from "../components/timbratureComponent";

const timbrature = () => {
    const idOperatore = localStorage.getItem("idOperatore") ?? ""
    console.log("id: " + idOperatore);    
    return <TimbratureComponent idOperatore={idOperatore} />
}

export default timbrature


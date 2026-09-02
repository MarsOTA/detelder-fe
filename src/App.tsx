import { Routes, Route, Navigate } from "react-router";
import TaskOperatore from "./pages/operatore/taskOperatore";
import TurniFuturi from "./pages/operatore/turniFuturi";
import Presenze from "./pages/operatore/timbrature";
import Rendicontazione from "./pages/operatore/rendicontazione";
import { ProtectedRoute } from "@/ProtectedRoute";
import Login from "./pages/auth/login";

import Dashboard from "./pages/admin/dashboard";
import Operatori from "./pages/admin/operatoriRuntime";
import Clienti from "./pages/admin/clienti";
import Eventi from "./pages/admin/eventi";
import Turni from "./pages/admin/turni";
import CreaCliente from "./pages/admin/creaCliente";
import PresenzeTotali from "./pages/admin/presenze";
import GetsioneTurni from "./pages/admin/getsioneTurniRuntime";
import DettaglioOperatore from "./pages/admin/dettaglioOperatore";
import AssegnaOperatore from "./pages/admin/assegnaOperatore";
import ProgrammazioneEvento from "./pages/admin/programmazioneEvento";
import Timbrature from "./pages/admin/timbrature";
import Payroll from "./pages/admin/payroll";

import Unauthorized from "./pages/Unauthorized";

function App() {

  return (
    <div>

      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/presenze" element={<PresenzeTotali />} /> 
          <Route path="/admin/operatori" element={<Operatori />} />                  
          <Route path="/admin/clienti" element={<Clienti />} />                   
          <Route path="/admin/eventi" element={<Eventi />} />
          <Route path="/admin/turni" element={<Turni />} />          
          <Route path="/admin/crea-cliente" element={<CreaCliente />} />
          <Route path="/admin/payroll" element={<Payroll />} />  
          <Route path="/admin/gestione-turni/:id" element={<GetsioneTurni />} />
          <Route path="/admin/gestione-turni/:id/:dataTurno" element={<GetsioneTurni />} />
          <Route path="/admin/dettaglio-operatore/:id" element={<DettaglioOperatore />} />
          <Route path="/admin/assegnaEvento-operatore/:id" element={<AssegnaOperatore />} />
          <Route path="/admin/timbrature-operatore/:id" element={<Timbrature />} />
          <Route path="/admin/programmazione-evento/:id" element={<ProgrammazioneEvento />} />
        </Route>

        <Route element={<ProtectedRoute allowedRole="OPERATORE" />}>
          <Route path="/operator/" element={<TaskOperatore />} />
          <Route path="/operator/turniFuturi" element={<TurniFuturi />} />
          <Route path="/operator/presenze" element={<Presenze />} />
          <Route path="/operator/rendicontazione" element={<Rendicontazione />} />          
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

    </div>


  )

}

export default App

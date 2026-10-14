import { useState, useEffect } from "react";
import { ezystaffBEUrl } from "../../utils/baseUrl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
//import { useAuth } from "@/AuthContext";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  //const { checkAuth, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log("Init login");
//    console.log("isAuthenticated: " + isAuthenticated);
  //  console.log("isLoading: " + isLoading);
//    if (!isLoading && isAuthenticated) 

/*
      const ruolo = localStorage.getItem('ruolo');
      console.log("ruolo: " + ruolo);
      if (ruolo === 'ADMIN') {
        navigate('/admin/eventi');
      } else {
        navigate('/operator');
      }
*/


 //   }
  }, []);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setSubmitting(true);

    try {
      const resp = await fetch(ezystaffBEUrl + 'auth/login', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });

      if (!resp.ok) {
        // Un HTTP 404 sul login può indicare un account assente dal database, non una rotta mancante.
        if (resp.status === 404) {
          setLoginError('Utente non trovato nel database di test. Verifica lo username utilizzato.');
          return;
        }
        if (resp.status === 401) {
          setLoginError('Credenziali non valide.');
          return;
        }
        throw new Error(`Errore del server (HTTP ${resp.status}).`);
      }

      const data = await resp.json();
      if (!data.success) {
        setLoginError(data.message || 'Accesso non riuscito.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('ruolo', data.dipendente.ruolo);
      localStorage.setItem('idOperatore', String(data.dipendente.id));
      localStorage.setItem('operatoreLoggato', `${data.dipendente.nome} ${data.dipendente.cognome}`);

      if (data.dipendente.ruolo === 'ADMIN') {
        navigate('/admin/turni');
      } else if (data.dipendente.ruolo === 'OPERATORE') {
        navigate('/operator');
      } else {
        setLoginError('Ruolo utente non riconosciuto.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setLoginError(message === 'Failed to fetch' || message === 'NetworkError when attempting to fetch resource.'
        ? 'Connessione al server non riuscita. Verifica che questo indirizzo Preview sia autorizzato sul backend (CORS).'
        : message || 'Errore di connessione al server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Accedi al Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>

            <form onSubmit={submitLogin} className="space-y-4">
              {loginError && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{loginError}</p>}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="tel"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              //  disabled={isLoading}
              >
                {submitting ? "Accesso in corso…" : "Accedi"}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>
    </>






  )
}
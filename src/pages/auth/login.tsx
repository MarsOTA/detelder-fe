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

    const values = { "username": username, "password": password }
    console.log(JSON.stringify(values));

    const resp = await fetch(ezystaffBEUrl + 'auth/login', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      }
    });

    const data = await resp.json();

    console.log(data);

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('ruolo', data.dipendente.ruolo);
      localStorage.setItem('idOperatore', data.dipendente.id);
      localStorage.setItem(
        'operatoreLoggato',
        `${data.dipendente.nome} ${data.dipendente.cognome}`
      );

      const ruolo = localStorage.getItem('ruolo');
      console.log("ruolo: " + ruolo);
      if (ruolo === 'ADMIN') {
        navigate('/admin/turni');
      } else if (ruolo === 'OPERATORE') {
        navigate('/operator');
      }      

      // Aspetta che checkAuth aggiorni il context
    //  await checkAuth();

    } else {
      alert(data.message);
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
                className="w-full"
              //  disabled={isLoading}
              >
                {"Accedi"}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>
    </>






  )
}
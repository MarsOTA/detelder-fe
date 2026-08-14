import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { toast } from "sonner";
import { ChevronLeft, Save } from "lucide-react";

const creaCliente = () => {

    const [formDatiCliente, setFormDatiCliente] = useState({
        ragioneSociale: "",
        piva_cfiscale: "",
        email: "",
        telefono: ""
    });

    const navigate = useNavigate();

    const crea = () => {
        if (!validateForm()) {
            return;
        }
        inserisciCliente();
    }

    const tornaAllaLista = () => {
        navigate("/admin/clienti");
    };


    const validateForm = (): boolean => {
        if (!formDatiCliente.ragioneSociale.trim()) {
            toast.error("La ragione sociale è obbligatoria");
            alert("La ragione sociale è obbligatoria");
            return false;
        }

        if (!formDatiCliente.piva_cfiscale.trim()) {
            toast.error("La P.IVA/C.F. è obbligatoria");
            alert("La P.IVA/C.F. è obbligatoria");
            return false;
        }

        if (!formDatiCliente.email.trim() || !formDatiCliente.email.includes("@")) {
            toast.error("Inserire una email valida");
            alert("Inserire una email valida");
            return false;
        }

        if (!formDatiCliente.telefono.trim()) {
            toast.error("Il numero di telefono è obbligatorio");
            alert("Il numero di telefono è obbligatorio");
            return false;
        }

        return true;
    };



    const inserisciCliente = async () => {
        const resp = await fetch(ezystaffBEUrl + 'clienti', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(formDatiCliente)
        });
        const data = await resp.json();
        console.log(data);
        navigate("/admin/clienti");
    }

    return (


        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={tornaAllaLista}
                    className="mb-4"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Torna alla lista
                </Button>
                <Button onClick={crea}>
                    <Save className="mr-2 h-4 w-4" />
                    {"Crea cliente"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{"Nuovo Cliente"}</CardTitle>
                    <CardDescription>
                        {"Inserisci i dati per creare un nuovo cliente"}
                    </CardDescription>
                </CardHeader>
                <CardContent>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Ragione Sociale *</Label>
                                    <Input
                                        value={formDatiCliente.ragioneSociale}
                                        onChange={(e) => setFormDatiCliente({ ...formDatiCliente, ragioneSociale: e.target.value })}
                                        required />
                                </div>

                                <div className="space-y-2">
                                    <Label>P.IVA/C.F. *</Label>
                                    <Input
                                        value={formDatiCliente.piva_cfiscale}
                                        onChange={(e) => setFormDatiCliente({ ...formDatiCliente, piva_cfiscale: e.target.value })}
                                        required />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email *</Label>
                                    <Input
                                        value={formDatiCliente.email}
                                        onChange={(e) => setFormDatiCliente({ ...formDatiCliente, email: e.target.value })}
                                        required />
                                </div>

                                <div className="space-y-2">
                                    <Label>Telefono *</Label>
                                    <Input
                                        value={formDatiCliente.telefono}
                                        onChange={(e) => setFormDatiCliente({ ...formDatiCliente, telefono: e.target.value })}
                                        required />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default creaCliente
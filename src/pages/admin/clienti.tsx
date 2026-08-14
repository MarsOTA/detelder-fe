import { Card, CardContent } from "@/components/ui/card";
import { Building2, Trash2, Users, Edit2, MapPin, Plus, Mail, Phone, ArrowUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { CreaClienteDialog } from "@/pages/admin/dialog/creaClienteDialog";
import { ReferenteDialog } from "./dialog/referenteDialog";
import { BrendDialog } from "./dialog/brandDialog";
import { IndirizziBrendDialog } from "./dialog/IndirizziBrendDialog";
import { Input } from "@/components/ui/input";
const clienti = () => {


    interface Cliente {
        idCliente: number;
        ragioneSociale: string;
        shortName: string;
        piva_cfiscale: string;
    }

    interface Referente {
        idReferente: number;
        nome: string;
        email: string;
        telefono: string;
    }

    interface IndirizzoBrand {
        idIndirizzo: number;
        via: string;
    }

    interface Brand {
        idBrand: number;
        nome: string;
        shortName: string;
        listaIndirizzi: IndirizzoBrand[];
    }


    const [formDatiCliente, setFormDatiCliente] = useState({
        ragioneSociale: "",
        shortName: "",
        piva_cfiscale: ""
    });
    const [clientDialogOpen, setClientDialogOpen] = useState(false);
    const [clienti, setClienti] = useState<Cliente[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const clienteSelezionato = selectedClientId ? clienti.find(c => c.idCliente === selectedClientId) : null;
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);


    const [formDatiReferente, setFormDatiReferente] = useState({
        nome: "",
        email: "",
        telefono: ""
    });
    const [referenteDialogOpen, setReferenteDialogOpen] = useState(false);
    const [referenti, setReferenti] = useState<Referente[]>([]);
    const [editingReferente, setEditingReferente] = useState<Referente | null>(null);


    const [formDatiBrand, setFormDatiBrand] = useState({
        nome: "",
        shortName: ""
    });
    const [brandDialogOpen, setBrandDialogOpen] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [brandSelezionato, setBrandSelezionato] = useState<number | null>(null);


    const [formDatiIndirizzo, setFormDatiIndirizzo] = useState({
        via: ""
    });
    const [indirizzoDialogOpen, setIndirizzoDialogOpen] = useState(false);

    const [search, setSearch] = useState<string>("");
    const [sortAsc, setSortAsc] = useState<boolean>(true);



    useEffect(() => {
        cercaListaClienti();
    }, [])

    const handleNewOperator = () => {
        setFormDatiCliente({
            ragioneSociale: "",
            shortName: "",
            piva_cfiscale: "",
        });

        setClientDialogOpen(true);
    };

    const creaNuovoReferente = () => {
        setFormDatiReferente({
            nome: "",
            email: "",
            telefono: ""
        });

        setReferenteDialogOpen(true);
        setEditingReferente(null);
    };

    const creaNuovoBrand = () => {
        setEditingBrand(null);
        setFormDatiBrand({
            nome: "",
            shortName: ""
        });

        setBrandDialogOpen(true);
    };

    const creaNuovoIndirizzo = () => {
        setFormDatiIndirizzo({
            via: ""
        });

        setIndirizzoDialogOpen(true);
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

        if (!resp.ok) {
            // gestione errore
            if (resp.status === 409) {
                alert(data.message || "Cliente già esistente");
            } else {
                alert(data.message || "Errore durante la creazione");
            }
            return; // IMPORTANTISSIMO: fermarsi qui
        }

        setClientDialogOpen(false);
        cercaListaClienti();
    }

    const cancellaCliente = async (idCliente: number) => {
        const resp = await fetch(ezystaffBEUrl + `clienti/disabilita/${idCliente}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PATCH",
            credentials: 'include'
        });
        const data = await resp.json();
        console.log(data);
        cercaListaClienti();
    }

    const handleSubmitReferente = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingReferente) {
            await modificaReferente();
        } else {
            await inserisciReferente();
        }
    };

    const handleSubmitBrand = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingBrand) {
            await modificaBrand();
        } else {
            await inserisciBrand();
        }
    };

    const handleSubmitCliente = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCliente) {
            await modificaCliente();
        } else {
            await inserisciCliente();
        }
    };

    const handleSubmitIndirizzo = async (e: React.FormEvent) => {
        e.preventDefault();
        await inserisciIndirizzo();
    };

    const inserisciReferente = async () => {

        const nuovoRefrente = {
            ...formDatiReferente,
            idCliente: selectedClientId
        };

        const resp = await fetch(ezystaffBEUrl + 'clienti/referente', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(nuovoRefrente)
        });
        const data = await resp.json();
        console.log(data);
        setReferenteDialogOpen(false);
        caricaListaReferentiCliente(selectedClientId);
    }

    const inserisciBrand = async () => {

        const nuovoBrand = {
            ...formDatiBrand,
            idCliente: selectedClientId
        };

        const resp = await fetch(ezystaffBEUrl + 'clienti/brand', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(nuovoBrand)
        });
        const data = await resp.json();
        console.log(data);
        setBrandDialogOpen(false);
        caricaListaBrandsCliente(selectedClientId);
    }

    const inserisciIndirizzo = async () => {

        const nuovoIndirizzo = {
            ...formDatiIndirizzo,
            idBrand: brandSelezionato
        };

        console.log("***********nuovoIndirizzo********: " + JSON.stringify(nuovoIndirizzo));

        const resp = await fetch(ezystaffBEUrl + 'clienti/brand/indirizzo', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(nuovoIndirizzo)
        });
        const data = await resp.json();
        console.log(data);
        setIndirizzoDialogOpen(false);
        caricaListaBrandsCliente(selectedClientId);
    };



    const modificaReferente = async () => {
        if (!editingReferente) return;

        const referenteAggiornato = {
            ...formDatiReferente,
            idCliente: selectedClientId
        };

        const resp = await fetch(ezystaffBEUrl + `clienti/referente/${editingReferente.idReferente}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PUT",
            credentials: 'include',
            body: JSON.stringify(referenteAggiornato)
        });

        const data = await resp.json();
        console.log("Modificato:", data);
        setReferenteDialogOpen(false);
        caricaListaReferentiCliente(selectedClientId);
    };


    const modificaBrand = async () => {
        if (!editingBrand) return;

        const brandAggiornato = {
            ...formDatiBrand,
            idCliente: selectedClientId
        };

        const resp = await fetch(ezystaffBEUrl + `clienti/brand/${editingBrand.idBrand}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PUT",
            credentials: 'include',
            body: JSON.stringify(brandAggiornato)
        });

        const data = await resp.json();
        console.log("Modificato:", data);
        setBrandDialogOpen(false);
        caricaListaBrandsCliente(selectedClientId);
    };

    const modificaCliente = async () => {

        if (!editingCliente) return;

        const clienteAggiornato = {
            ...formDatiCliente,
            idCliente: selectedClientId
        };

        const resp = await fetch(ezystaffBEUrl + `clienti/${selectedClientId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PUT",
            credentials: 'include',
            body: JSON.stringify(clienteAggiornato)
        });

        const data = await resp.json();
        console.log("Modificato:", data);
        setClientDialogOpen(false);
        cercaListaClienti();
    }


    const handleDeleteReferenti = (idReferente: number) => {
        if (!selectedClientId) return;
        if (confirm("Sei sicuro di voler eliminare questo referente?")) {
            cancellaReferente(idReferente);
        }
    };

    const handleDeleteBrand = (idBrand: number) => {
        if (!selectedClientId) return;
        if (confirm("Sei sicuro di voler eliminare questo brand?")) {
            cancellaBrand(idBrand);
        }
    };

    const handleDeleteIndirizzoBrand = (idIndirizzo: number) => {
        if (!selectedClientId) return;
        if (confirm("Sei sicuro di voler eliminare questo indirizzo?")) {
            cancellaIndirizzoBrand(idIndirizzo);
        }
    };

    const handleModificaCliente = (idCliente: number) => {

        const cliente = clienti.find((r) => r.idCliente === idCliente);
        if (cliente) {
            setFormDatiCliente(cliente);
            setEditingCliente(cliente);
        }

        setClientDialogOpen(true);
    }

    const handleModificheReferente = (idReferente: number) => {
        const referente = referenti.find((r) => r.idReferente === idReferente);
        if (referente) {
            setFormDatiReferente({
                nome: referente.nome,
                email: referente.email,
                telefono: referente.telefono
            });
            setEditingReferente(referente);
        }

        setReferenteDialogOpen(true);
    };

    const handleModificheBrand = (idBrand: number) => {
        const brand = brands.find((r) => r.idBrand === idBrand);
        if (brand) {
            setFormDatiBrand({
                nome: brand.nome,
                shortName: brand.shortName
            });
            setEditingBrand(brand);
        }

        setBrandDialogOpen(true);
    };


    const cancellaReferente = async (idReferente: number) => {
        const resp = await fetch(ezystaffBEUrl + `clienti/referente/disabilita/${idReferente}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PATCH",
            credentials: 'include'
        });
        const data = await resp.json();
        console.log(data);
        caricaListaReferentiCliente(selectedClientId);
    }

    const cancellaBrand = async (idBrand: number) => {
        const resp = await fetch(ezystaffBEUrl + `clienti/brand/disabilita/${idBrand}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PATCH",
            credentials: 'include'
        });
        const data = await resp.json();
        console.log(data);
        caricaListaBrandsCliente(selectedClientId);
    }

    const cancellaIndirizzoBrand = async (idIndirizzo: number) => {
        const resp = await fetch(ezystaffBEUrl + `clienti/brand/indirizzo/disabilita/${idIndirizzo}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PATCH",
            credentials: 'include'
        });
        const data = await resp.json();
        console.log(data);
        caricaListaBrandsCliente(selectedClientId);
    }

    const cercaListaClienti = async () => {
        const resp = await fetch(ezystaffBEUrl + 'clienti', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);
        setClienti(data);
    }

    const caricaListaReferentiCliente = async (id: number | null) => {
        const resp = await fetch(ezystaffBEUrl + `clienti/referenti/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);
        setReferenti(data);
    }

    const caricaListaBrandsCliente = async (id: number | null) => {
        const resp = await fetch(ezystaffBEUrl + `clienti/brands/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);
        setBrands(data);
    }

    const handleDeleteClient = (idCliente: number) => {
        if (confirm("Sei sicuro di voler eliminare questo cliente e tutti i suoi brand?")) {
            cancellaCliente(idCliente);
            if (selectedClientId === clienteSelezionato) setSelectedClientId(null);
        }
    };

    const handleSelectClient = async (id: number) => {
        setSelectedClientId(id);
        caricaListaReferentiCliente(id);
        caricaListaBrandsCliente(id);
    };

    const filteredClienti = useMemo(() => {
        const filtered = clienti.filter((cliente) =>
            cliente.ragioneSociale.toLowerCase().includes(search.toLowerCase()) ||
            cliente.piva_cfiscale?.toLowerCase().includes(search.toLowerCase())
        );

        return filtered.sort((a, b) => {
            const comparison = a.ragioneSociale.localeCompare(b.ragioneSociale);
            return sortAsc ? comparison : -comparison;
        });
    }, [clienti, search, sortAsc]);


    return (

        <section className="m-8">
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                    <div className="text-[32px] font-extrabold text-[#007a55] text-center my-4">
                        GESTIONE CLIENTI
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                    <div className="p-3 border border-[#e7e7e7] bg-[#ecf3f1] transition-colors rounded-t-md">

                        <div className="flex gap-2 mb-3">
                            <Input
                                type="text"
                                placeholder="Ricerca per keyword"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white"
                            />

                            <Button
                                variant="outline"
                                onClick={() => setSortAsc(prev => !prev)}
                            >
                                {sortAsc ? <ArrowUpDown className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4" />}
                            </Button>

                        </div>
                        <Button
                            className="w-full cursor-pointer rounded-[18px] bg-[#007a55] text-[16px] font-bold text-white hover:bg-[#006847]"
                            onClick={() => {
                                setEditingCliente(null);
                                handleNewOperator(); // se ti serve
                                setClientDialogOpen(true);
                            }}
                        >
                            NUOVO CLIENTE
                        </Button>

                        <CreaClienteDialog
                            open={clientDialogOpen}
                            setOpen={setClientDialogOpen}
                            formDatiCliente={formDatiCliente}
                            setFormDatiCliente={setFormDatiCliente}
                            onSubmit={handleSubmitCliente}
                            isEditing={!!editingCliente}
                        />

                    </div>


                    {filteredClienti.map((cliente) => (
                        <div
                            key={cliente.idCliente}
                            className={`p-3 border border-t-0 cursor-pointer transition-colors ${selectedClientId === cliente.idCliente
                                ? "bg-[#ecf3f1] border-[#d8d8d8]"
                                : "hover:bg-muted/50"
                                }`}
                            onClick={() => handleSelectClient(cliente.idCliente)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="ml-4">
                                    <div className="font-medium">{cliente.ragioneSociale.toUpperCase()} {cliente.shortName && `| ${cliente.shortName.toUpperCase()}`}</div>
                                    <div className="text-sm text-muted-foreground">P.IVA: {cliente.piva_cfiscale}</div>
                                </div>


                                <div className="flex items-center rounded-[29px] border border-[#007a55]">
                                    <div className="border-r border-r-[#007a55]">
                                        <Button
                                            variant="ghost"
                                            className="hover:bg-transparent hover:shadow-none cursor-pointer"
                                            size="sm"
                                            onClick={() => {
                                                handleModificaCliente(cliente.idCliente);
                                            }}
                                        >
                                            <Edit2 className="w-4 h-4 text-[#007a55]" />
                                        </Button>
                                    </div>
                                    <div className="border-l border-l-[#007a55]">
                                        <Button
                                            variant="ghost"
                                            className="hover:bg-transparent hover:shadow-none cursor-pointer"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClient(cliente.idCliente);
                                            }}

                                        >
                                            <Trash2 className="w-4 h-4 text-[#007a55]" />
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}

                </div>

                <div className="lg:col-span-2 space-y-6">
                    {clienteSelezionato ? (
                        <>
                            <div className="border border-[#e7e7e7] bg-[#326455] rounded-t-xl transition-colors">
                                <div className="text-white p-4 px-8 flex justify-between items-center">
                                    <span className="text-[25px] font-bold text-white">
                                        {clienteSelezionato.ragioneSociale}
                                    </span>
                                    <span className="text-[16px] font-semibold text-white">
                                        P.IVA: {clienteSelezionato.piva_cfiscale}
                                    </span>
                                </div>

                                <div className="flex items-center px-8 border-b justify-between bg-[#ecf3f1] p-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-6 h-6  text-[#007a55]" />
                                        <span className="text-[26px] font-bold text-[#007a55]">
                                            Referenti
                                        </span>
                                    </div>

                                    <ReferenteDialog
                                        open={referenteDialogOpen}
                                        setOpen={setReferenteDialogOpen}
                                        formDatiReferente={formDatiReferente}
                                        setFormDatiReferente={setFormDatiReferente}
                                        onSubmit={handleSubmitReferente}
                                        onClickNuovo={creaNuovoReferente}
                                        isEditing={!!editingReferente}
                                    />
                                </div>

                                {referenti.map((referente) => (
                                    <div className="p-4 border-b bg-[#fff]">
                                        <div className="flex items-center px-4 justify-between mb-3">
                                            <span className="text-[20px] font-bold text-[#747474]">
                                                {referente.nome}
                                            </span>

                                            <div className="flex items-center rounded-[29px] border border-[#007a55]">
                                                <div className="border-r border-r-[#007a55]">
                                                    <Button
                                                        className="hover:bg-transparent hover:shadow-none cursor-pointer"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleModificheReferente(referente.idReferente)}
                                                    >
                                                        <Edit2 className="w-4 h-4 text-[#007a55]" />
                                                    </Button>
                                                </div>
                                                <div className="border-l border-l-[#007a55]">
                                                    <Button
                                                        className="hover:bg-transparent hover:shadow-none cursor-pointer"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteReferenti(referente.idReferente)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-[#007a55]" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center px-4 justify-between">

                                            <span className="flex items-center gap-2 text-[18px] font-normal text-[#747474]">
                                                <Mail className="w-4 h-4" />
                                                {referente.email}
                                            </span>

                                            <span className="flex items-center gap-2 text-[18px] font-normal text-[#747474]">
                                                <Phone className="w-4 h-4" />
                                                {referente.telefono}
                                            </span>

                                        </div>

                                    </div>
                                ))}


                                <div className="flex items-center px-8 border-b justify-between bg-[#ecf3f1] p-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-6 h-6 text-[#007a55]" />
                                        <span className="text-[26px] font-bold text-[#007a55]">
                                            Brand e Indirizzi
                                        </span>
                                    </div>

                                    <BrendDialog
                                        open={brandDialogOpen}
                                        setOpen={setBrandDialogOpen}
                                        formDatiBrand={formDatiBrand}
                                        setFormDatiBrand={setFormDatiBrand}
                                        onSubmit={handleSubmitBrand}
                                        onClickNuovo={creaNuovoBrand}
                                        isEditing={!!editingBrand} />

                                </div>

                                {brands.map((brand) => (
                                    <div className="p-4 border-b bg-[#fff]">
                                        <div className="flex items-center justify-between mx-4">
                                            <div>
                                                <h4 className="text-[20px] font-bold text-[#747474]">{brand.nome.toUpperCase()} {brand.shortName && `| ${brand.shortName.toUpperCase()}`}</h4>
                                            </div>
                                            <div className="flex items-center rounded-[29px] border border-[#007a55]">
                                                <div className="border-r border-r-[#007a55]">
                                                    <Button
                                                        variant="ghost"
                                                        className="hover:bg-transparent hover:shadow-none cursor-pointer"
                                                        size="sm"
                                                        onClick={() => handleModificheBrand(brand.idBrand)}
                                                    >
                                                        <Edit2 className="w-4 h-4 text-[#007a55]" />
                                                    </Button>
                                                </div>
                                                <div className="border-l border-l-[#007a55]">
                                                    <Button
                                                        variant="ghost"
                                                        className="hover:bg-transparent hover:shadow-none cursor-pointer"
                                                        size="sm"
                                                        onClick={() => handleDeleteBrand(brand.idBrand)}

                                                    >
                                                        <Trash2 className="w-4 h-4 text-[#007a55]" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>


                                        <div className="space-y-2 mx-4">
                                            <p className="text-[18px] font-normal text-[#747474]">Indirizzi:</p>
                                            {brand.listaIndirizzi?.map((indirizzo) => (
                                                <div key={indirizzo.idIndirizzo} className="flex justify-between items-center gap-2 text-sm bg-muted/50 p-2 rounded">

                                                    <span>{indirizzo.via}</span>
                                                    <Button
                                                        className="hover:bg-transparent hover:shadow-none cursor-pointer"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteIndirizzoBrand(indirizzo.idIndirizzo)}
                                                    >
                                                        <Trash2 className="w-3 h-3 text-[#007a55]" />
                                                    </Button>
                                                </div>
                                            ))}

                                            <Button
                                                className="cursor-pointer rounded-[18px] bg-[#007a55] text-[16px] font-bold text-white hover:bg-[#006847]"
                                                onClick={() => {
                                                    setBrandSelezionato(brand.idBrand);
                                                    creaNuovoIndirizzo();
                                                    setIndirizzoDialogOpen(true);
                                                }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Aggiungi Indirizzo
                                            </Button>


                                            <IndirizziBrendDialog
                                                open={indirizzoDialogOpen}
                                                setOpen={setIndirizzoDialogOpen}
                                                formDatiIndirizzo={formDatiIndirizzo}
                                                setFormDatiIndirizzo={setFormDatiIndirizzo}
                                                onSubmit={handleSubmitIndirizzo}
                                            />

                                        </div>

                                    </div>

                                ))}
                            </div>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Seleziona un cliente dalla lista per visualizzare i dettagli
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div >
        </section>
    )
}

export default clienti
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { CircleSmall } from "lucide-react";

type Operatori = {
  idOperatore: number;
  nomeOperatore: string;
  cognomeOperatore: string;
  nicknameOperatore: string;
  disponibilita: string;
  turno: string;
  nomeEvento: string;
  indirizzoEvento: string;
};

interface assegnaOperatoreDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  listaOperatori: Operatori[];
  idTurno: number;
  handleOperatoreClick: (idTurno: number, idOperatore: number | undefined, nomeOperatore: string, cognomeOperatore: string, nicknameOperatore: string) => void;
}

export const AssegnaOperatoreDialog = ({
  open,
  setOpen,
  idTurno,
  listaOperatori,
  handleOperatoreClick
}: assegnaOperatoreDialogProps) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return listaOperatori.filter((o) =>
      o.nomeOperatore.toLowerCase().includes(q) || o.cognomeOperatore.toLowerCase().includes(q)
    );
  }, [listaOperatori, query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="admin-assign-operator-dialog w-full md:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="text-[#edf7f6]">Assegna operatori</DialogTitle>
          <p className="mt-2 text-sm text-[#a9bbc2]">
            Seleziona uno o più operatori da assegnare al turno. Puoi selezionare fino al numero di operatori richiesti.
          </p>
        </DialogHeader>

        <Input
          placeholder="Cerca nome operatore"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="admin-assign-operator-search"
        />

        <div className="admin-assign-operator-table rounded-lg border overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stato</TableHead>
                  <TableHead>Nome Operatore</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>H. Turno</TableHead>
                  <TableHead>Ruolo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((operatore) => {
                    const isDisponibile = operatore.disponibilita === "DISPONIBILE";
                    return (
                      <TableRow
                        key={operatore.idOperatore}
                        onClick={() => {
                          handleOperatoreClick(
                            idTurno,
                            operatore.idOperatore,
                            operatore.nomeOperatore,
                            operatore.cognomeOperatore,
                            operatore.nicknameOperatore
                          );
                        }}
                        className={
                          isDisponibile
                            ? "cursor-pointer transition-colors"
                            : "cursor-default opacity-50"
                        }
                      >
                        <TableCell>
                          {isDisponibile ? <CircleSmall className="mr-2 h-4 w-4 fill-green-500 text-green-500" /> : <CircleSmall className="mr-2 h-4 w-4 fill-red-500 text-red-500" />}
                        </TableCell>
                        <TableCell className="text-[#edf7f6]">
                          {operatore.nomeOperatore} {operatore.cognomeOperatore}
                        </TableCell>
                        <TableCell className="text-[#edf7f6]">
                          <div>{operatore.nomeEvento}</div>
                          <div className="text-[#a9bbc2]">{operatore.indirizzoEvento}</div>
                        </TableCell>
                        <TableCell className="text-[#edf7f6]">{operatore.turno}</TableCell>
                        <TableCell className="text-[#edf7f6]">OPERATORE</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[#a9bbc2]">
                      Nessun operatore disponibile
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} className="admin-assign-operator-cancel">
            Annulla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

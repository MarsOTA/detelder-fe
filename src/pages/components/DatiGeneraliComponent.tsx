import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import type { Dipendente } from "@/entity";

interface FormDatiGenerali {
  altezza: number | null;
  peso: number | null;
  numeroScarpe: number | null;
  tagliaVestiti: string;
  livelloIstruzione: string;
  tesserino: string;
}

interface DatiAnagraficiProps {
  editDatiGenerali: boolean;
  disabilitaDatiGenerali: boolean;
  formDatiGenerali: FormDatiGenerali;
  dipendente?: Dipendente;
  editaDatiGenerali: () => void;
  aggiornaDatiGenerici: () => void;
  handleChangeDatiGenerali: (
    field: keyof FormDatiGenerali,
    value: any
  ) => void;
}

export const DatiGeneraliComponent = ({
  editDatiGenerali,
  disabilitaDatiGenerali,
  formDatiGenerali,
  dipendente,
  editaDatiGenerali,
  aggiornaDatiGenerici,
  handleChangeDatiGenerali,
}: DatiAnagraficiProps) => {
  return (
    <div
      className="flex-1 space-y-4"
      style={{
        color: "#5e5d5d",
        backgroundColor: "#eaeff4",
        borderRadius: 9,
        padding: 14,
        fontSize: 16,
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 border-b border-[#d8d8d8]  pb-2">
        <h3 className="text-[24px] font-extrabold text-[#007a55]">
          Dati generali
        </h3>

        {editDatiGenerali ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={disabilitaDatiGenerali}
            onClick={aggiornaDatiGenerici}
          >
            <LockKeyholeOpen className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled={disabilitaDatiGenerali}
            onClick={editaDatiGenerali}
          >
            <LockKeyhole className="h-4 w-4" />
          </Button>
        )}
      </div>

      {editDatiGenerali ? (
        <div className="grid grid-cols-2 gap-y-4">
          <div className="col-span-2 grid grid-cols-2 gap-x-4">
            <span className="text-[14px] font-normal text-[#747474]">Altezza</span>
            <span className="text-[14px] font-normal text-[#747474]">Peso</span>

            <Input
              type="number"
              min={1.3}
              max={2.2}
              step={0.01}
              value={formDatiGenerali.altezza ?? ""}
              onChange={(e) =>
                handleChangeDatiGenerali(
                  "altezza",
                  Number(e.target.value)
                )
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
              autoFocus
            />

            <Input
              type="number"
              min={30}
              max={250}
              step={1}
              value={formDatiGenerali.peso ?? ""}
              onChange={(e) =>
                handleChangeDatiGenerali(
                  "peso",
                  Number(e.target.value)
                )
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
            />
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-x-4">
            <span className="text-[14px] font-normal text-[#747474]">N.scarpe</span>
            <span className="text-[14px] font-normal text-[#747474]">Taglia vestiti</span>

            <Input
              value={formDatiGenerali.numeroScarpe ?? ""}
              onChange={(e) =>
                handleChangeDatiGenerali("numeroScarpe", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
            />

            <Input
              value={formDatiGenerali.tagliaVestiti ?? ""}
              onChange={(e) =>
                handleChangeDatiGenerali("tagliaVestiti", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
            />
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-x-4">
            <span className="text-[14px] font-normal text-[#747474]">Liv.istruzione</span>
            <span className="text-[14px] font-normal text-[#747474]">Tesserino</span>

            <Select
              value={formDatiGenerali.livelloIstruzione}
              onValueChange={(value) =>
                handleChangeDatiGenerali("livelloIstruzione", value)
              }
            >
              <SelectTrigger className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Licenza elementare">Licenza elementare</SelectItem>
                <SelectItem value="Licenza media">Licenza media</SelectItem>
                <SelectItem value="Diploma di scuola superiore">Diploma di scuola superiore</SelectItem>
                <SelectItem value="Laurea triennale">Laurea triennale</SelectItem>
                <SelectItem value="Laurea Specialistica / Vecchio ordinamento">Laurea Specialistica / Vecchio ordinamento</SelectItem>
                <SelectItem value="Master / Post-laurea">Master / Post-laurea</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={formDatiGenerali.tesserino}
              onValueChange={(value) =>
                handleChangeDatiGenerali("tesserino", value)
              }
            >
              <SelectTrigger className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="DA FARE">DA FARE</SelectItem>
                <SelectItem value="FATTO">FATTO</SelectItem>
                <SelectItem value="CONSEGNATO">CONSEGNATO</SelectItem>
              </SelectContent>
            </Select>

          </div>

        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-4">
          <div className="col-span-2 grid grid-cols-2">
            <span className="text-[14px] font-normal text-[#747474]">Altezza</span>
            <span className="text-[14px] font-normal text-[#747474]">Peso</span>

            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.altezza} m</span>
            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.peso} kg</span>
          </div>
          <div className="col-span-2 grid grid-cols-2">
            <span className="text-[14px] font-normal text-[#747474]">N.scarpe</span>
            <span className="text-[14px] font-normal text-[#747474]">Taglia vestiti</span>

            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.numeroScarpe} </span>
            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.tagliaVestiti} </span>
          </div>
          <div className="col-span-2 grid grid-cols-2">
            <span className="text-[14px] font-normal text-[#747474]">Liv.istruzione</span>
            <span className="text-[14px] font-normal text-[#747474]">Tesserino</span>

            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.livelloIstruzione} </span>
            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.tesserino} </span>
          </div>
        </div>
      )}
    </div>
  );
};

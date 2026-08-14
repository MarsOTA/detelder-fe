import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Dipendente } from "@/entity";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatiAnagraficiForm {
  nickname: string;
  nome: string;
  cognome: string;
  matricola: string;
  email: string;
  prefisso: string;
  telefono: string;
  codiceFiscale: string;
  sesso: string;
  dataNascita: Date | null;
  luogoNascita: string;
  provinciaNascita: string;
  statoNascita: string;
  cittadinanza: string;
}

interface DatiAnagraficiProps {
  editDatiAnagrafici: boolean;
  disabilitaDatiAnagrafici: boolean;
  formDatiAnagrafici: DatiAnagraficiForm;
  dipendente?: Dipendente;
  editaDatiAnagrafici: () => void;
  aggiornaDatiAnagrafici: () => void;
  handleChangeDatiAnagrafici: (
    field: keyof DatiAnagraficiForm,
    value: any
  ) => void;
}

export const DatiAnagraficiComponent = ({
  editDatiAnagrafici,
  disabilitaDatiAnagrafici,
  formDatiAnagrafici,
  dipendente,
  editaDatiAnagrafici,
  aggiornaDatiAnagrafici,
  handleChangeDatiAnagrafici,
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
          Dati Anagrafici
        </h3>

        {editDatiAnagrafici ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={disabilitaDatiAnagrafici}
            onClick={aggiornaDatiAnagrafici}
          >
            <LockKeyholeOpen className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled={disabilitaDatiAnagrafici}
            onClick={editaDatiAnagrafici}
          >
            <LockKeyhole className="h-4 w-4" />
          </Button>
        )}
      </div>

      {editDatiAnagrafici ? (
        <div className="grid grid-cols-2 gap-y-4">
          <div className="col-span-2 grid grid-cols-2 gap-x-4">
            <span className="text-[14px] font-normal text-[#747474]">Nome</span>
            <span className="text-[14px] font-normal text-[#747474]">Cognome</span>

            <Input
              value={formDatiAnagrafici.nome}
              onChange={(e) =>
                handleChangeDatiAnagrafici("nome", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
              autoFocus
            />

            <Input
              value={formDatiAnagrafici.cognome}
              onChange={(e) =>
                handleChangeDatiAnagrafici("cognome", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-x-4">
            <span className="text-[14px] font-normal text-[#747474]">Cellulare</span>
            <span className="text-[14px] font-normal text-[#747474]">Email</span>

            <div className="grid grid-cols-[80px_1fr] gap-x-2">
              <Input
                value={formDatiAnagrafici.prefisso}
                onChange={(e) =>
                  handleChangeDatiAnagrafici("prefisso", e.target.value)
                }
                className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
              />

              <Input
                value={formDatiAnagrafici.telefono}
                onChange={(e) =>
                  handleChangeDatiAnagrafici("telefono", e.target.value)
                }
                className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
              />
            </div>

            <Input
              value={formDatiAnagrafici.email}
              onChange={(e) =>
                handleChangeDatiAnagrafici("email", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
            />
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-x-4">
            <span className="text-[14px] font-normal text-[#747474]">Nickname</span>
            <span className="text-[14px] font-normal text-[#747474]">Matricola</span>

            <Input
              value={formDatiAnagrafici.nickname}
              onChange={(e) =>
                handleChangeDatiAnagrafici("nickname", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
            />
            <Input
              value={formDatiAnagrafici.matricola}
              onChange={(e) =>
                handleChangeDatiAnagrafici("matricola", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-x-4">
            <span className="text-[14px] font-normal text-[#747474]">Codice Fiscale</span>
            <span className="text-[14px] font-normal text-[#747474]">Sesso</span>

            <Input
              value={formDatiAnagrafici.codiceFiscale}
              onChange={(e) =>
                handleChangeDatiAnagrafici("codiceFiscale", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
            />
            <Select
              value={formDatiAnagrafici.sesso ?? ""}
              onValueChange={(value) =>
                handleChangeDatiAnagrafici("sesso", value)
              }
            >
              <SelectTrigger className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="F">F</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-x-4">

            <span className="text-[14px] font-normal text-[#747474]">Data Nascita</span>
            <span className="text-[14px] font-normal text-[#747474]">Coumune di nascita</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full rounded-none">
                  {formDatiAnagrafici.dataNascita
                    ? format(formDatiAnagrafici.dataNascita, "dd/MM/yyyy")
                    : "Seleziona data"}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  defaultMonth={
                    formDatiAnagrafici.dataNascita ?? new Date()
                  }
                  selected={formDatiAnagrafici.dataNascita ?? undefined}
                  onSelect={(date) => handleChangeDatiAnagrafici("dataNascita", date ?? null)}
                  locale={it}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Input
              value={formDatiAnagrafici.luogoNascita}
              onChange={(e) =>
                handleChangeDatiAnagrafici("luogoNascita", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
              placeholder="Comune di Nascita"
            />

          </div>

          <div className="col-span-2 grid grid-cols-2 gap-x-4">

            <span className="text-[14px] font-normal text-[#747474]">Provincia di Nascita</span>
            <span className="text-[14px] font-normal text-[#747474]">Nazione di Nascita</span>

            <Input
              value={formDatiAnagrafici.provinciaNascita}
              onChange={(e) =>
                handleChangeDatiAnagrafici("provinciaNascita", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
              placeholder="Provincia di Nascita"
            />
            <Input
              value={formDatiAnagrafici.statoNascita}
              onChange={(e) =>
                handleChangeDatiAnagrafici("statoNascita", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
              placeholder="Stato di Nascita"
            />

          </div>

          <div className="col-span-2 grid grid-cols-2 gap-x-4">
            <span className="text-[14px] font-normal text-[#747474]">Cittadinanza</span>
            <span />
            <Input
              value={formDatiAnagrafici.cittadinanza}
              onChange={(e) =>
                handleChangeDatiAnagrafici("cittadinanza", e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
              placeholder="cittadinanza"
            />
            <span />
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-4">
          <div className="col-span-2 grid grid-cols-2">
            <span className="text-[14px] font-normal text-[#747474]">Nome</span>
            <span className="text-[14px] font-normal text-[#747474]">Cognome</span>

            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.nome}</span>
            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.cognome}</span>
          </div>
          <div className="col-span-2 grid grid-cols-2">
            <span className="text-[14px] font-normal text-[#747474]">Cellulare</span>
            <span className="text-[14px] font-normal text-[#747474]">Email</span>

            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.prefisso}/{dipendente?.telefono}</span>
            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.email}</span>
          </div>
          <div className="col-span-2 grid grid-cols-2">
            <span className="text-[14px] font-normal text-[#747474]">Nickname</span>
            <span className="text-[14px] font-normal text-[#747474]">Matricola</span>

            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.nickname}</span>
            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.matricola}</span>
          </div>
          <div className="col-span-2 grid grid-cols-2">
            <span className="text-[14px] font-normal text-[#747474]">Codice Fiscale</span>
            <span className="text-[14px] font-normal text-[#747474]">Sesso</span>

            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.codiceFiscale}</span>
            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.sesso}</span>
          </div>
          <div className="col-span-2 grid grid-cols-2">
            <span className="text-[14px] font-normal text-[#747474]">Data nascita</span>
            <span className="text-[14px] font-normal text-[#747474]">Comune di nascita</span>
            
            <span className="text-[18px] font-medium text-[#4c4a4a]">
                {dipendente?.dataNascita ? format(dipendente?.dataNascita, "dd/MM/yyyy") : ""}
            </span>            
            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.luogoNascita}</span>
          </div>
          <div className="col-span-2 grid grid-cols-2">
            <span className="text-[14px] font-normal text-[#747474]">Provincia di nascita</span>
            <span className="text-[14px] font-normal text-[#747474]">Nazione di nascita</span>

            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.provinciaNascita}</span>
            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.statoNascita}</span>
          </div>
          <div className="grid grid-cols-1">
            <span className="text-[14px] font-normal text-[#747474]">Cittadinanza</span>
            <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.cittadinanza}</span>
          </div>
        </div>
      )}
    </div>
  );
};

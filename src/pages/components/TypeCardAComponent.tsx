import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, FileCheck } from "lucide-react"
import { it } from "date-fns/locale"

interface TypeCardAComponentProps {
  editAllegati: boolean

  numeroDocumento?: string
  dataScadenza?: Date | null
  imgFronte?: any
  imgRetro?: any

  // Nuovi parametri per il form
  numdocumentoKey?: string
  numdocumentoValue?: string
  dataScadenzaKey?: string
  dataScadenzaValue?: Date | null

  handleChangeFormAllegati: (key: string, value: any) => void

  caricaDocumento: (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => void
  eliminaDocumento: (tipo: string) => void
  dowloadAllegato: (tipo: string) => void

  tipoFronte: string
  tipoRetro: string

  // Nuovo titolo
  titoloDocumento: string
}

export function TypeCardAComponent({
  editAllegati,
  numeroDocumento,
  dataScadenza,
  imgFronte,
  imgRetro,
  numdocumentoKey = "",
  numdocumentoValue = "",
  dataScadenzaKey = "",
  dataScadenzaValue = null,
  handleChangeFormAllegati,
  caricaDocumento,
  eliminaDocumento,
  dowloadAllegato,
  tipoFronte,
  tipoRetro,
  titoloDocumento,
}: TypeCardAComponentProps) {
  return (
    <div className="border rounded-[10px]">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-[#ecf3f1] rounded-t-[10px] py-3 pl-6">
        <span className="text-[20px] font-bold text-[#007a55]">
          {titoloDocumento}
        </span>
      </div>

      {editAllegati ? (
        <div>
          {/* DATI DOCUMENTO */}
          <div className="grid grid-cols-4 p-4 items-center">
            <span className="text-[16px] font-normal text-[#007a55] justify-self-end mr-3">
              N° Documento
            </span>
            <Input
              value={numdocumentoValue}
              onChange={(e) =>
                handleChangeFormAllegati(numdocumentoKey, e.target.value)
              }
              className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
            />

            <span className="text-[16px] font-normal text-[#007a55] justify-self-end mr-3">
              Scadenza
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full rounded-none">
                  {dataScadenzaValue
                    ? format(dataScadenzaValue, "dd/MM/yyyy")
                    : "Seleziona data"}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataScadenzaValue ?? undefined}
                  onSelect={(date) =>
                    handleChangeFormAllegati(dataScadenzaKey, date ?? null)
                  }
                  locale={it}
                  // AGGIUNGI QUESTE
                  captionLayout="dropdown"
                  startMonth={new Date(1950, 0)}
                  endMonth={new Date(2100, 11)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="border-t border-gray-200" />

          {/* DOCUMENTI */}
          <div className="grid grid-cols-5 items-center p-6">
            <span className="text-[16px] font-normal text-[#007a55] col-start-2">
              Doc. Fronte
            </span>

            <span className="text-[16px] font-normal text-[#007a55] col-start-4 justify-self-end">
              Doc. Retro
            </span>

            {/* FRONTE */}
            <div className="col-start-2">
              <label className="cursor-pointer text-[#007a55] font-semibold hover:underline">
                Carica
                <input
                  type="file"
                  className="hidden"
                  accept="*/*"
                  onChange={(e) => caricaDocumento(e, tipoFronte)}
                />
              </label>

              {imgFronte && (
                <>
                  <button
                    onClick={() => dowloadAllegato(tipoFronte)}
                    className="cursor-pointer text-[#007a55] ml-2"
                  >
                    <FileCheck className="h-8 w-8" />
                  </button>
                  <button
                    onClick={() => eliminaDocumento(tipoFronte)}
                    className="cursor-pointer text-[#007a55] ml-2"
                  >
                    X
                  </button>
                </>
              )}
            </div>

            {/* RETRO */}
            <div className="col-start-4 justify-self-end">
              <label className="cursor-pointer text-[#007a55] font-semibold hover:underline">
                Carica
                <input
                  type="file"
                  className="hidden"
                  accept="*/*"
                  onChange={(e) => caricaDocumento(e, tipoRetro)}
                />
              </label>

              {imgRetro && (
                <>
                  <button
                    onClick={() => dowloadAllegato(tipoRetro)}
                    className="cursor-pointer text-[#007a55] ml-2"
                  >
                    <FileCheck className="h-8 w-8" />
                  </button>
                  <button
                    onClick={() => eliminaDocumento(tipoRetro)}
                    className="cursor-pointer text-[#007a55] ml-2"
                  >
                    X
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* READ ONLY */}
          <div className="grid grid-cols-4 p-4 items-center">
            <span className="text-[16px] font-normal text-[#007a55] justify-self-end mr-3">
              N° Documento
            </span>
            <span className="text-[14px] font-normal text-[#2e2e2e]">
              {numeroDocumento}
            </span>

            <span className="text-[16px] font-normal text-[#007a55] justify-self-end mr-3">
              Scadenza
            </span>
            <span className="text-[14px] font-normal text-[#2e2e2e]">
              {dataScadenza ? format(dataScadenza, "dd/MM/yyyy") : ""}
            </span>
          </div>

          <div className="border-t border-gray-200" />

          <div className="grid grid-cols-5 items-center p-6">
            <span className="text-[16px] font-normal text-[#007a55] col-start-2 justify-self-center">
              Doc. Fronte
            </span>

            <span className="text-[16px] font-normal text-[#007a55] col-start-4 justify-self-center">
              Doc. Retro
            </span>

            <div className="col-start-2 justify-self-center">
              {imgFronte ? (
                <button
                  onClick={() => dowloadAllegato(tipoFronte)}
                  className="cursor-pointer text-[#007a55]">
                  <FileCheck className="h-8 w-8" />
                </button>
              ) : (
                <div className="rounded-[14px] bg-[#ffe5d1] text-[14px] text-[#a45418] py-1 px-4">
                  Da caricare
                </div>
              )}
            </div>

            <div className="col-start-4 justify-self-center">
              {imgRetro ? (
                <button
                  onClick={() => dowloadAllegato(tipoRetro)}
                  className="cursor-pointer text-[#007a55]">
                  <FileCheck className="h-8 w-8" />
                </button>
              ) : (
                <div className="rounded-[14px] bg-[#ffe5d1] text-[14px] text-[#a45418] py-1 px-4">
                  Da caricare
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

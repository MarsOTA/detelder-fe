import { FileCheck } from "lucide-react"

interface TypeCardDComponentProps {
  editAllegati: boolean

  imgFronte?: any

  handleChangeFormAllegati: (key: string, value: any) => void

  caricaDocumento: (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => void
  eliminaDocumento: (tipo: string) => void
  dowloadAllegato: (tipo: string) => void

  tipoFronte: string
  // Nuovo titolo
  titoloDocumento: string
}

export function TypeCardDComponent({
  editAllegati,
  imgFronte,
  caricaDocumento,
  eliminaDocumento,
  dowloadAllegato,
  tipoFronte,
  titoloDocumento,
}: TypeCardDComponentProps) {
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
          {/*
          <div className="grid grid-cols-[auto_1.5fr_auto_1fr] p-4 pl-[10%] items-center gap-x-2">
            <span className="text-[16px] font-normal text-[#007a55] justify-self-end mr-3">
              Scadenza
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full rounded-none">
                  {dataConseguimentoValue
                    ? format(dataConseguimentoValue, "dd/MM/yyyy")
                    : "Seleziona data"}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataConseguimentoValue ?? undefined}
                  onSelect={(date) =>
                    handleChangeFormAllegati(dataConseguimentoKey, date ?? null)
                  }
                  locale={it}
                  captionLayout="dropdown"
                  startMonth={new Date(1950, 0)}
                  endMonth={new Date(2100, 11)}
                />
              </PopoverContent>
            </Popover>
          </div>
          

          <div className="border-t border-gray-200" />
          */}

          {/* DOCUMENTI */}
          <div className="grid place-items-center p-6">
            <span className="text-[16px] font-normal text-[#007a55]">
              Doc. Fronte
            </span>
            {/* FRONTE */}
            <div className="mt-3">
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
          </div>
        </div>
      ) : (
        <div>
          {/* READ ONLY */}
          {/*
          <div className="grid grid-cols-[auto_1.5fr_auto_1fr] p-4 pl-[10%] items-center gap-x-2">

            <span className="text-[16px] font-normal text-[#007a55]">
              Scadenza
            </span>
            <span className="text-[14px] font-normal text-[#2e2e2e]">
              {dataConseguimento ? format(dataConseguimento, "dd/MM/yyyy") : ""}
            </span>
          </div>
          

          <div className="border-t border-gray-200" />
          */}

          <div className="grid place-items-center p-6">
            <span className="text-[16px] font-normal text-[#007a55]">
              Doc. Fronte
            </span>
            <div className="mt-3">
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
          </div>
        </div>
      )}
    </div>
  )
}

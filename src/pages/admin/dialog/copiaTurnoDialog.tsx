import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyCheck, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";
import { useState, useEffect } from "react";

interface copiaTurnoDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (data: { inizio?: Date; fine?: Date }) => void;
  onClickNuovo: () => void;
  filtroData: Date | undefined; // nuova prop
  disabled: boolean
}

export const CopiaTurnoDialog = ({
  open,
  setOpen,
  onSubmit,
  onClickNuovo,
  filtroData,
  disabled,
}: copiaTurnoDialogProps) => {

  const [dataCopiaInizio, setDataCopiaInizio] = useState<Date | undefined>();
  const [dataCopiaFine, setDataCopiaFine] = useState<Date | undefined>();

  useEffect(() => {
    if (open) {
      setDataCopiaInizio(undefined);
      setDataCopiaFine(undefined);
    }
  }, [open]);

  const handleDataCopiaInizio = (date: Date | undefined) => {
    setDataCopiaInizio(date);
    setDataCopiaFine(date);
  };

  const handleDataCopiaFine = (date: Date | undefined) => {
    setDataCopiaFine(date);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={onClickNuovo}
          className="flex items-center gap-2 rounded-[18px] border border-[#5e8a7a] bg-white hover:bg-gray-100 px-3 py-2 cursor-pointer"
          disabled={disabled}
        >
          <CopyCheck className="w-5 h-5 text-[#007a55]" />
          <span className="text-[14px] font-semibold text-[#007a55]">
            Copia turno
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent showCloseButton={false}>
        <div className="flex flex-col gap-2 items-center">
          <DialogHeader>
            <div className="text-[#007A55] text-[29px] font-extrabold flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 mb-2">
                <img src="/assets/octagon.svg" alt="Logo" className="w-full h-full" />
              </div>
              COPIA TURNO
            </div>
            <p className="text-[16px] font-medium text-[#333333]">
              <span className="font-medium text-[#333333]">
                Stai per copiare tutti i turni filtrati del:{" "}
              </span>
              <span className="font-bold text-[#007A55]">
                {filtroData ? filtroData.toLocaleDateString() : "-"}
              </span>
            </p>
          </DialogHeader>
        </div>

        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault(); // previene il refresh
          onSubmit({ inizio: dataCopiaInizio, fine: dataCopiaFine });
        }}>
          <div className="w-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  {dataCopiaInizio
                    ? dataCopiaInizio.toLocaleDateString()
                    : "Seleziona data"}
                  <CalendarIcon className="mr-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataCopiaInizio}
                  onSelect={handleDataCopiaInizio}
                  locale={it}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  {dataCopiaFine
                    ? dataCopiaFine.toLocaleDateString()
                    : "Seleziona data"}
                  <CalendarIcon className="mr-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataCopiaFine}
                  onSelect={handleDataCopiaFine}
                  locale={it}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ANNULLA
            </Button>

            <Button
              type="submit"
              className="bg-[#007A55] text-white hover:bg-[#006644]">
              CONFERMA
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

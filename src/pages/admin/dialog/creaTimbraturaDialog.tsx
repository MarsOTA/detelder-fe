import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { it } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input";

type FormDatiTimbratura = {
    dataCheckIn: Date | undefined;
    oraCheckIn: string;
    dataCheckOut: Date | undefined;
    oraCheckOut: string;
    creaTimbratura: boolean;
    idCheckIn: number | undefined;
    idCheckOut: number | undefined;
};

interface creaTimbraturaDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  formDatiTimbratura: FormDatiTimbratura;
  setFormDatiTimbratura: (data: FormDatiTimbratura) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreaTimbraturaDialog = ({
  open,
  setOpen,
  formDatiTimbratura,
  setFormDatiTimbratura,
  onSubmit
}: creaTimbraturaDialogProps) => {

  const setDataCheckIn = (date: Date | undefined) => {
    setFormDatiTimbratura({
      ...formDatiTimbratura,
      dataCheckIn: date,
    });
  };


  const setOraCheckIn = (ora: string) => {
    setFormDatiTimbratura({
      ...formDatiTimbratura,
      oraCheckIn: ora,
    });
  };

  const setDataCheckOut = (date: Date | undefined) => {
    setFormDatiTimbratura({
      ...formDatiTimbratura,
      dataCheckOut: date,
    });
  };

  const setOraCheckOut = (ora: string) => {
    setFormDatiTimbratura({
      ...formDatiTimbratura,
      oraCheckOut: ora,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {formDatiTimbratura.creaTimbratura
              ? "Aggiungi timbratura"
              : "Modifica timbratura"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Inserisci CheckIn(Obbligatorio)</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {formDatiTimbratura.dataCheckIn
                      ? formDatiTimbratura.dataCheckIn.toLocaleDateString()
                      : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formDatiTimbratura.dataCheckIn}
                    onSelect={setDataCheckIn}
                    locale={it}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                value={formDatiTimbratura.oraCheckIn}
                onChange={(e) => setOraCheckIn(e.target.value)}
                className="bg-white  w-24"
              />
            </div>

          </div>

          <div className="space-y-2">
            <Label>Inserisci CheckOut</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {formDatiTimbratura.dataCheckOut
                      ? formDatiTimbratura.dataCheckOut.toLocaleDateString()
                      : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formDatiTimbratura.dataCheckOut}
                    onSelect={setDataCheckOut}
                    locale={it}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                value={formDatiTimbratura.oraCheckOut}
                onChange={(e) => setOraCheckOut(e.target.value)}
                className="bg-white w-24"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {formDatiTimbratura.creaTimbratura
                ? "Crea timbratura"
                : "Modifica timbratura"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

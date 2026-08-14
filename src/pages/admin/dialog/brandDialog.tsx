import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookmarkPlus } from "lucide-react";

interface brendDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  formDatiBrand: {
    nome: string;
    shortName: string;
  };
  setFormDatiBrand: (data: { nome: string; shortName: string;}) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClickNuovo: () => void;
  isEditing: boolean;
}

export const BrendDialog = ({
  open,
  setOpen,
  formDatiBrand,
  setFormDatiBrand,
  onSubmit,
  onClickNuovo,
  isEditing
}: brendDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={onClickNuovo}
          className="rounded-full bg-[#019165] hover:bg-[#019165] p-2 cursor-pointer">
          <BookmarkPlus className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#007A55]">{isEditing ? "Modifica Brand" : "Nuovo Brand"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label className="text-[#007A55]">Nome Brand</Label>
            <Input
              value={formDatiBrand.nome}
              placeholder="Inserisci nome brand"
              onChange={(e) =>
                setFormDatiBrand({
                  ...formDatiBrand,
                  nome: e.target.value,
                })
              }
              required
            />
            <Label className="text-[#007A55]">Short Name Brand</Label>
            <Input
              value={formDatiBrand.shortName}
              placeholder="Inserisci short name brand"
              onChange={(e) =>
                setFormDatiBrand({
                  ...formDatiBrand,
                  shortName: e.target.value,
                })
              }              
            />            
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>

            <Button 
              type="submit"
              className="bg-[#007A55] text-white hover:bg-[#006644]">
              {isEditing ? "Modifica Brand" : "Salva Brand"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

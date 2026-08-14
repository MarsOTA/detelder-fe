import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LocalitaEvento from "@/utils/LocalitaEvento";
import { Button } from "@/components/ui/button";

interface IndirizziBrendDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    formDatiIndirizzo: {
        via: string;
    };
    setFormDatiIndirizzo: (data: { via: string }) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const IndirizziBrendDialog = ({
    open,
    setOpen,
    formDatiIndirizzo,
    setFormDatiIndirizzo,
    onSubmit,
}: IndirizziBrendDialogProps) => {

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-[#007A55]">
                            Crea nuovo indirizzo.
                        </DialogTitle>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={onSubmit}>
                        <div className="space-y-2">
                            <LocalitaEvento
                                localitaEventoValue={formDatiIndirizzo.via}
                                onValueChange={(val) =>
                                    setFormDatiIndirizzo({
                                        ...formDatiIndirizzo,
                                        via: val,
                                    })
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Annulla
                            </Button>

                            <Button
                                type="submit"
                                className="bg-[#007A55] text-white hover:bg-[#006644]">
                                Salva Indirizzo
                            </Button>
                        </div>

                    </form>

                </DialogContent>
            </Dialog>
        </>
    );
}

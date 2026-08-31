import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, UserRound } from "lucide-react";

interface ReferenteEventoDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    nomeCognomeReferente?: string;
    telefonoReferente?: string;
}

export const ReferenteEventoDialog = ({
    open,
    setOpen,
    nomeCognomeReferente,
    telefonoReferente
}: ReferenteEventoDialogProps) => {
    const telefono = telefonoReferente?.trim() || "";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="top-auto bottom-0 translate-y-0 w-full max-w-md rounded-t-[28px] rounded-b-none border-[#0b6d5c] bg-[#061e28] p-0 text-white shadow-2xl sm:rounded-t-[28px] sm:rounded-b-none [&>button]:text-white [&>button]:opacity-100">
                <div className="font-['Mulish'] px-5 pb-6 pt-5">
                    <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-[#5b7f82]/60" />

                    <DialogHeader className="text-left">
                        <DialogTitle className="text-[26px] font-extrabold leading-none text-white">
                            Referente evento
                        </DialogTitle>
                        <p className="text-[15px] font-normal text-[#9db7b6]">
                            Contatto principale collegato al turno
                        </p>
                    </DialogHeader>

                    <div className="mt-6 rounded-[18px] border border-[#0b6d5c]/70 bg-[#072b31] p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b3b38] text-[#19e6b3]">
                                <UserRound className="h-5 w-5" strokeWidth={1.8} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="text-[19px] font-extrabold leading-tight text-white">
                                    {nomeCognomeReferente || "Referente non indicato"}
                                </div>
                                <div className="mt-1 text-[13px] font-normal text-[#9db7b6]">
                                    Referente evento
                                </div>
                            </div>
                        </div>

                        <a
                            href={telefono ? `tel:${telefono}` : undefined}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-[15px] border border-[#19e6b3]/35 bg-[#083a36] px-4 py-3 text-[16px] font-bold text-[#19e6b3]"
                        >
                            <Phone className="h-4 w-4" strokeWidth={2} />
                            <span>{telefono || "Telefono non disponibile"}</span>
                        </a>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

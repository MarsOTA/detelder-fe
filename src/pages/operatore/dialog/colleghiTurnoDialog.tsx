import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Phone } from "lucide-react";

export type CollegaTurno = {
    nome: string;
    cognome: string;
    telefono: string;
    oraInizio: string;
    oraFine: string;
    teamLeader: boolean;
    gpg: boolean;
}

interface ColleghiTurnoDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    colleghi: CollegaTurno[];
}

export const ColleghiTurnoDialog = ({
    open,
    setOpen,
    colleghi
}: ColleghiTurnoDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="top-auto bottom-0 translate-y-0 w-full max-w-md rounded-t-[28px] rounded-b-none border-[#0b6d5c] bg-[#061e28] p-0 text-white shadow-2xl sm:rounded-t-[28px] sm:rounded-b-none [&>button]:text-white [&>button]:opacity-100">
                <div className="font-['Mulish'] px-5 pb-6 pt-5">
                    <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-[#5b7f82]/60" />

                    <DialogHeader className="text-left">
                        <DialogTitle className="text-[26px] font-extrabold leading-none text-white">
                            Colleghi
                        </DialogTitle>
                        <p className="text-[15px] font-normal text-[#9db7b6]">
                            Persone collegate al turno
                        </p>
                    </DialogHeader>

                    <div className="mt-6 space-y-3">
                        {colleghi.length === 0 ? (
                            <div className="rounded-[18px] border border-[#0b6d5c]/60 bg-[#071f2c] p-4 text-[15px] text-[#9db7b6]">
                                Nessun collega collegato al turno.
                            </div>
                        ) : (
                            colleghi.map((collega, index) => {
                                const nomeCompleto = `${collega.nome} ${collega.cognome}`.trim();
                                const mansione = collega.gpg ? "GPG" : "Doorman";
                                const telefono = collega.telefono?.trim() || "";

                                return (
                                    <div
                                        key={`${nomeCompleto}-${index}`}
                                        className="rounded-[18px] border border-[#16464d] bg-[#071f2c] p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[18px] font-extrabold leading-tight text-white">
                                                    {nomeCompleto || "Nome non disponibile"}
                                                </div>
                                                <div className="mt-1 text-[13px] font-normal text-[#9db7b6]">
                                                    {mansione} · {collega.oraInizio} - {collega.oraFine}
                                                </div>
                                                {collega.teamLeader ? (
                                                    <div className="mt-2 flex items-center gap-1.5 text-[13px] font-bold text-[#19e6b3]">
                                                        <Crown className="h-3.5 w-3.5" strokeWidth={2} />
                                                        Team Leader evento
                                                    </div>
                                                ) : null}
                                            </div>

                                            <a
                                                href={telefono ? `tel:${telefono}` : undefined}
                                                className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#19e6b3]/25 bg-[#083a36] px-3 py-2 text-[12px] font-bold text-[#19e6b3]"
                                            >
                                                <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                                                <span>{telefono || "N/D"}</span>
                                            </a>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

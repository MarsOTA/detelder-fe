import { Crown, Phone, UsersRound } from "lucide-react";
import { OperatorBottomSheet } from "./OperatorBottomSheet";

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
        <OperatorBottomSheet
            open={open}
            setOpen={setOpen}
            title="Colleghi"
            subtitle="Persone collegate al turno"
            icon={<UsersRound className="h-5 w-5" strokeWidth={1.8} />}
        >
            <div className="space-y-3">
                {colleghi.length === 0 ? (
                    <div className="rounded-[18px] border border-[#2b4457] bg-[#102536] p-4 text-[15px] text-[#9db2bf]">
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
                                className="rounded-[18px] border border-[#2b4457] bg-[#102536] p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[18px] font-extrabold leading-tight text-white">
                                            {nomeCompleto || "Nome non disponibile"}
                                        </div>
                                        <div className="mt-1 text-[13px] text-[#9db2bf]">
                                            {mansione} · {collega.oraInizio} - {collega.oraFine}
                                        </div>
                                        {collega.teamLeader ? (
                                            <div className="mt-2 flex items-center gap-1.5 text-[13px] font-bold text-[#16f0c4]">
                                                <Crown className="h-3.5 w-3.5" strokeWidth={2} />
                                                Team Leader evento
                                            </div>
                                        ) : null}
                                    </div>

                                    <a
                                        href={telefono ? `tel:${telefono}` : undefined}
                                        className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#16f0c4]/25 bg-[#103b3d] px-3 py-2 text-[12px] font-bold text-[#16f0c4]"
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
        </OperatorBottomSheet>
    );
};

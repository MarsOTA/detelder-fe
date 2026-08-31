import { Phone, UserRound } from "lucide-react";
import { OperatorBottomSheet } from "./OperatorBottomSheet";

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
        <OperatorBottomSheet
            open={open}
            setOpen={setOpen}
            title="Referente evento"
            subtitle="Contatto principale collegato al turno"
            icon={<UserRound className="h-5 w-5" strokeWidth={1.8} />}
        >
            <div className="rounded-[18px] border border-[#2b4457] bg-[#102536] p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#103b3d] text-[#16f0c4]">
                        <UserRound className="h-5 w-5" strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="text-[19px] font-extrabold leading-tight text-white">
                            {nomeCognomeReferente || "Referente non indicato"}
                        </div>
                        <div className="mt-1 text-[13px] text-[#9db2bf]">
                            Referente evento
                        </div>
                    </div>
                </div>

                <a
                    href={telefono ? `tel:${telefono}` : undefined}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-[15px] border border-[#16f0c4]/30 bg-[#103b3d] px-4 py-3 text-[16px] font-bold text-[#16f0c4]"
                >
                    <Phone className="h-4 w-4" strokeWidth={2} />
                    <span>{telefono || "Telefono non disponibile"}</span>
                </a>
            </div>
        </OperatorBottomSheet>
    );
};

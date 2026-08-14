import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import type { Dipendente } from "@/entity";
import { Checkbox } from "@/components/ui/checkbox";

interface DatiNascitaResidenzaForm {

  indirizzoResidenza: string;
  numeroCivicoResidenza: string;
  comuneResidenza: string;
  provinciaResidenza: string;
  capResidenza: string;

  residenzaUgualeDomicilio: boolean;

  indirizzoDomicilio: string;
  numeroCivicoDomicilio: string;
  comuneDomicilio: string;
  provinciaDomicilio: string;
  capDomicilio: string;
}

interface NascitaResidenzaProps {
  editNascitaResidenza: boolean;
  disabilitaNascitaResidenza: boolean;
  formDatiNascitaResidenza: DatiNascitaResidenzaForm;
  dipendente?: Dipendente;
  editaNascitaReidenza: () => void;
  aggiornaNascitaResidenza: () => void;
  handleChangeDatiNascitaResidenza: (
    field: keyof DatiNascitaResidenzaForm,
    value: any
  ) => void;
}

export const NascitaResidenzaComponent = ({
  editNascitaResidenza,
  disabilitaNascitaResidenza,
  formDatiNascitaResidenza,
  dipendente,
  editaNascitaReidenza,
  aggiornaNascitaResidenza,
  handleChangeDatiNascitaResidenza,
}: NascitaResidenzaProps) => {
  return (
    <div
      className="flex-1 space-y-4"
      style={{
        color: "#5e5d5d",
        backgroundColor: "#eaeff4",
        borderRadius: 9,
        padding: 14,
        fontSize: 16,
      }}
    >


      <div className="flex items-center justify-between mb-4 border-b border-[#d8d8d8]  pb-2">
        <h3 className="text-[24px] font-extrabold text-[#007a55]">
          Residenza
        </h3>
        {editNascitaResidenza ? (
          <>
            <Button variant="ghost" 
                    size="sm" 
                    disabled={disabilitaNascitaResidenza} 
                    onClick={() => aggiornaNascitaResidenza()} >
              <LockKeyholeOpen className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" 
                    size="sm" 
                    disabled={disabilitaNascitaResidenza} 
                    onClick={editaNascitaReidenza}>
              <LockKeyhole className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <div>
        {editNascitaResidenza ? (
          <>
            <div className="grid grid-cols-2 gap-y-4">
              <div className="col-span-2 grid grid-cols-2 gap-x-4">
                <span className="text-[14px] font-normal text-[#747474]">Indirizzo Residenza</span>
                <span className="text-[14px] font-normal text-[#747474]">N. Civico</span>

                <Input
                  value={formDatiNascitaResidenza.indirizzoResidenza}
                  onChange={(e) =>
                    handleChangeDatiNascitaResidenza("indirizzoResidenza", e.target.value)
                  }
                  className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
                  placeholder="Indirizzo Residenza"
                />

                <Input
                  value={formDatiNascitaResidenza.numeroCivicoResidenza}
                  onChange={(e) =>
                    handleChangeDatiNascitaResidenza("numeroCivicoResidenza", e.target.value)
                  }
                  className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
                  placeholder="N. Civico"
                />
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-x-4">
                <span className="text-[14px] font-normal text-[#747474]">Città di residenza</span>
                <span className="text-[14px] font-normal text-[#747474]">Provincia</span>

                <Input
                  value={formDatiNascitaResidenza.comuneResidenza}
                  onChange={(e) =>
                    handleChangeDatiNascitaResidenza("comuneResidenza", e.target.value)
                  }
                  className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
                  placeholder="Comune"
                />

                <Input
                  value={formDatiNascitaResidenza.provinciaResidenza}
                  onChange={(e) =>
                    handleChangeDatiNascitaResidenza("provinciaResidenza", e.target.value)
                  }
                  className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
                  placeholder="Provincia"
                />
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-x-4">
              <span className="text-[14px] font-normal text-[#747474]">CAP</span>
              <span />
              <Input
                value={formDatiNascitaResidenza.capResidenza}
                onChange={(e) =>
                  handleChangeDatiNascitaResidenza("capResidenza", e.target.value)
                }
                className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
                placeholder="CAP"
              />
              <span />
            </div>

          </>

        ) : (
          <>
            <div className="grid grid-cols-2 gap-y-4">
              <div className="col-span-2 grid grid-cols-2">
                <span className="text-[14px] font-normal text-[#747474]">Indirizzo Residenza</span>
                <span className="text-[14px] font-normal text-[#747474]">N. Civico</span>
                <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.indirizzoResidenza}</span>
                <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.numeroCivicoResidenza}</span>
              </div>
              <div className="col-span-2 grid grid-cols-2">
                <span className="text-[14px] font-normal text-[#747474]">Città di residenza</span>
                <span className="text-[14px] font-normal text-[#747474]">Provincia</span>
                <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.comuneResidenza}</span>
                <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.provinciaResidenza}</span>
              </div>
              <div className="grid grid-cols-1">
                <span className="text-[14px] font-normal text-[#747474]">CAP</span>
                <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.capResidenza}</span>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="border-t pt-2">
        <span>Domicilio</span>
      </div>

      <div>

        {editNascitaResidenza ? (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={!!formDatiNascitaResidenza.residenzaUgualeDomicilio}
              onCheckedChange={(checked) =>
                handleChangeDatiNascitaResidenza(
                  "residenzaUgualeDomicilio",
                  checked === true
                )
              }
            />
            <span>Domicilio diverso dalla residenza </span>
          </div>
        ) : (
          <>
            <span>Domicilio diverso dalla residenza:</span>
            <span>
              {dipendente?.residenzaUgualeDomicilio
                ? " Si"
                : " No"}
            </span>
          </>
        )}

      </div>

      <div>
        {editNascitaResidenza ? (
          <>
            <div className="grid grid-cols-2 gap-y-4" style={{ display: !!formDatiNascitaResidenza.residenzaUgualeDomicilio ? "block" : "none" }}>
              <div className="col-span-2 grid grid-cols-2 gap-x-4">
                <span className="text-[14px] font-normal text-[#747474]">Indirizzo Domicilio</span>
                <span className="text-[14px] font-normal text-[#747474]">N. Civico</span>
                <Input
                  value={formDatiNascitaResidenza.indirizzoDomicilio}
                  onChange={(e) =>
                    handleChangeDatiNascitaResidenza("indirizzoDomicilio", e.target.value)
                  }
                  className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
                  placeholder="Indirizzo Domicilio"
                />
                <Input
                  value={formDatiNascitaResidenza.numeroCivicoDomicilio}
                  onChange={(e) =>
                    handleChangeDatiNascitaResidenza("numeroCivicoDomicilio", e.target.value)
                  }
                  className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
                  placeholder="N. Civico"
                />
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-x-4">
                <span className="text-[14px] font-normal text-[#747474]">Citta domicilio</span>
                <span className="text-[14px] font-normal text-[#747474]">Provincia</span>
                <Input
                  value={formDatiNascitaResidenza.comuneDomicilio}
                  onChange={(e) =>
                    handleChangeDatiNascitaResidenza("comuneDomicilio", e.target.value)
                  }
                  className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
                  placeholder="Comune"
                />
                <Input
                  value={formDatiNascitaResidenza.provinciaDomicilio}
                  onChange={(e) =>
                    handleChangeDatiNascitaResidenza("provinciaDomicilio", e.target.value)
                  }
                  className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
                  placeholder="Provincia"
                />
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-x-4">
                <span className="text-[14px] font-normal text-[#747474]">CAP</span>
                <span />
                <Input
                  value={formDatiNascitaResidenza.capDomicilio}
                  onChange={(e) =>
                    handleChangeDatiNascitaResidenza("capDomicilio", e.target.value)
                  }
                  className="rounded-[3px] bg-[#fff] !text-[18px] text-[#4c4a4a]"
                  placeholder="CAP"
                />
                <span />
              </div>
            </div>
          </>

        ) : (
            <div className="grid grid-cols-2 gap-y-4" style={{ display: !!dipendente?.residenzaUgualeDomicilio ? "block" : "none" }}>
              <div className="col-span-2 grid grid-cols-2">
                <span className="text-[14px] font-normal text-[#747474]">Indirizzo Domicilio</span>
                <span className="text-[14px] font-normal text-[#747474]">N. Civico</span>
                <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.indirizzoDomicilio}</span>
                <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.numeroCivicoDomicilio}</span>
              </div>
              <div className="col-span-2 grid grid-cols-2">
                <span className="text-[14px] font-normal text-[#747474]">Comune</span>
                <span className="text-[14px] font-normal text-[#747474]">Provincia</span>
                <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.comuneDomicilio}</span>
                <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.provinciaDomicilio}</span>
              </div>
              <div className="grid grid-cols-1">
                <span className="text-[14px] font-normal text-[#747474]">CAP</span>
                <span className="text-[18px] font-medium text-[#4c4a4a]">{dipendente?.capDomicilio}</span>
              </div>              
            </div>
        )}
      </div>

    </div>
  );
};

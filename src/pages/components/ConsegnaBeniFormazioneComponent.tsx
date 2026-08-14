import { Textarea } from "@/components/ui/textarea";

interface FormConsegnaBeniFormazione {
    elencoContenutiFormazione: string;
    elencoBeniStrumentali: string;
}

interface ContrattoChiamataProps {
  formConsegnaBeniFormazione: FormConsegnaBeniFormazione;
  handleChangeConsegnaBeniFormazione: <
    K extends keyof FormConsegnaBeniFormazione
  >(
    field: K,
    value: FormConsegnaBeniFormazione[K]
  ) => void;
}

export const ConsegnaBeniFormazioneComponent = ({
  formConsegnaBeniFormazione,
  handleChangeConsegnaBeniFormazione,
}: ContrattoChiamataProps) => {

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

      <div className="grid grid-cols-1">
        <span>Elenco abbigliamento consegnato</span>

        <Textarea
          placeholder="Inserisci il testo..."
          value={formConsegnaBeniFormazione.elencoContenutiFormazione}
          onChange={(e) =>
            handleChangeConsegnaBeniFormazione(
              "elencoContenutiFormazione",
              e.target.value
            )
          }
          className="bg-white"
        />

      </div>

      <div className="grid grid-cols-1">
        <span>Elenco Beni Strumentali</span>

        <Textarea
          placeholder="Inserisci il testo..."
          value={formConsegnaBeniFormazione.elencoBeniStrumentali}
          onChange={(e) =>
            handleChangeConsegnaBeniFormazione(
              "elencoBeniStrumentali",
              e.target.value
            )
          }
          className="bg-white"
        />

      </div>      

    </div>
  );
};

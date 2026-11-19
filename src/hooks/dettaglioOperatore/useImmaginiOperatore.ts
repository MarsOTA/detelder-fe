import {useState} from "react";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import type {ImageData} from "@/pages/admin/dettaglioOperatore.types";

// Operator profile images: download/upload and preview state are isolated.
export function useImmaginiOperatore(id:string|undefined,caricaListaContratti:()=>Promise<unknown>){
    const [imgPrimoPiano, setImgPrimoPiano] = useState<ImageData | undefined>();
    const [imgFiguraIntera, setImgFiguraIntera] = useState<ImageData | undefined>();
    const [imgMezzoBusto, setImgMezzoBusto] = useState<ImageData | undefined>();
    const caricaImmagine = async (
        e: React.ChangeEvent<HTMLInputElement>,
        tipoImmagine: string
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;


        const formData = new FormData();
        formData.append("file", file);
        formData.append("tipoImmagine", tipoImmagine);

        try {

            const response = await fetch(ezystaffBEUrl + `upload/immagineProfilo/${id}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        //"Content-Type": "application/json",
                        accept: "application/json",
                    },
                    credentials: "include",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error(`Errore nel caricamento: ${response.statusText}`);
            }

            await response.json();
            await fetchImage(tipoImmagine);
            await caricaListaContratti();
            // Qui puoi aggiornare lo stato o mostrare un messaggio di successo
        } catch (error) {
            console.error("Errore durante l'upload:", error);
            // Qui puoi gestire l'errore (es. mostrare alert)
        }
    };

    const fetchImage = async (tipoImmagine: string) => {
        const response = await fetch(
            `${ezystaffBEUrl}upload/mostraImmagineProfilo/${id}?tipoImmagine=${tipoImmagine}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                credentials: "include",
            }
        );

        let imageUrl: string | null = null;
        let extension: string | null = null;

        if (response.status !== 204) {
            const blob = await response.blob();

            // sicurezza aggiuntiva
            if (blob.size > 0) {
                imageUrl = URL.createObjectURL(blob);
                extension = blob.type.split("/")[1] ?? null;
            }
        }


        switch (tipoImmagine) {
            case 'primoPiano':
                setImgPrimoPiano({
                    url: imageUrl,
                    extension
                });
                break;

            case 'mezzoBusto':
                setImgMezzoBusto({
                    url: imageUrl,
                    extension
                });
                break;

            case 'figuraIntera':
                setImgFiguraIntera({
                    url: imageUrl,
                    extension
                });
                break;
        }
    };



  const {editAllegati,allegati,formAllegati,editaAllegati,aggiornaAllegati,handleChangeFormAllegati,caricaAllegati,dowloadAllegato,caricaDocumento,eliminaDocumento}=useAllegatiOperatore(id,aggiornaDipendente);

 return {imgPrimoPiano,imgFiguraIntera,imgMezzoBusto,caricaImmagine,fetchImage};
}


import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, } from "@/components/ui/command";
import { Label } from "@radix-ui/react-label";
import {
    LockKeyhole,
    LockKeyholeOpen,
    Check, ImageUp
} from "lucide-react";

interface Dipendente {
    nome?: string;
    cognome?: string;
    listaMansioni?: string[] | string;
}

interface ImageData {
    url: string | null;
    extension: string | null;
}


interface HeaderDipendenteComponentProps {
    editHeader: boolean;
    disabilitaHeader: boolean;
    dipendente?: Dipendente;

    imgPrimoPiano?: ImageData;
    imgFiguraIntera?: ImageData;
    imgMezzoBusto?: ImageData;

    listaMansioniHeader: string[];
    formHeader: {
        listaMansioni: string[];
    };

    editaHeader: () => void;
    aggiornaHeader: () => void;

    handleChangeFormHeader: (
        field: "listaMansioni",
        value: string[]
    ) => void;

    caricaImmagine: (
        e: React.ChangeEvent<HTMLInputElement>,
        tipo: "primoPiano" | "figuraIntera" | "mezzoBusto"
    ) => void;
}

export function HeaderDipendenteComponent({
    editHeader,
    disabilitaHeader,
    dipendente,
    imgPrimoPiano,
    imgFiguraIntera,
    imgMezzoBusto,
    listaMansioniHeader,
    formHeader,
    editaHeader,
    aggiornaHeader,
    handleChangeFormHeader,
    caricaImmagine,
}: HeaderDipendenteComponentProps) {


    const handleDownload = (nomeImmagine: String, image?: ImageData) => {
        if (!image?.url || !image?.extension) return;

        const a = document.createElement("a");
        a.href = image.url;
        a.download = `${nomeImmagine}.${image.extension}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    return (
        <div className="rounded-[9px] bg-[#eff5f3] shadow-[0_2px_4px_0_rgba(168,166,166,0.5)] p-6 mb-6">
            {/* ACTION BUTTON */}
            <div className="flex items-center justify-end">
                {editHeader ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={disabilitaHeader}
                        className="cursor-pointer"
                        onClick={aggiornaHeader}
                    >
                        <LockKeyholeOpen className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={disabilitaHeader}
                        className="cursor-pointer"
                        onClick={editaHeader}
                    >
                        <LockKeyhole className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* HEADER CONTENT */}
            <div className="flex flex-row items-center gap-4">
                {
                    imgPrimoPiano?.url ? (
                        <img
                            src={imgPrimoPiano.url}
                            alt="Profilo"
                            className="w-[70px] h-[70px] object-cover rounded-full"
                        />
                    ) : (
                        <div className="w-[70px] h-[70px] rounded-[9px] bg-[#d8d8d8] flex items-center justify-center">
                            <ImageUp
                                className="w-12 h-12"
                                color="#007a55"
                                strokeWidth={1}
                            />
                        </div>
                    )
                }

                {/* CONTENUTO CONDIZIONALE */}
                {editHeader ? (
                    <>
                        <label className="cursor-pointer text-[#007a55] font-semibold hover:underline">
                            Carica
                            <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/gif"
                                onChange={(e) => caricaImmagine(e, "primoPiano")}
                            />
                        </label>

                        <div>
                            <div className="text-[32px] font-extrabold text-[#007a55]">
                                {dipendente?.nome} {dipendente?.cognome}
                            </div>

                            <div className="grid grid-cols-1">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between bg-white"
                                        >
                                            Seleziona mansioni
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandEmpty>Nessuna mansione</CommandEmpty>
                                            <CommandGroup>
                                                {listaMansioniHeader.map((mansione) => {
                                                    const selected =
                                                        formHeader.listaMansioni.includes(mansione);

                                                    return (
                                                        <CommandItem
                                                            key={mansione}
                                                            onSelect={() => {
                                                                const newValue = selected
                                                                    ? formHeader.listaMansioni.filter(
                                                                        (m) => m !== mansione
                                                                    )
                                                                    : [...formHeader.listaMansioni, mansione];

                                                                handleChangeFormHeader(
                                                                    "listaMansioni",
                                                                    newValue
                                                                );
                                                            }}
                                                        >
                                                            <Check
                                                                className={`mr-2 h-4 w-4 ${selected ? "opacity-100" : "opacity-0"
                                                                    }`}
                                                            />
                                                            {mansione}
                                                        </CommandItem>
                                                    );
                                                })}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <div className="text-[32px] font-extrabold text-[#007a55]">
                            {dipendente?.nome} {dipendente?.cognome}
                        </div>

                        <div className="text-[16px] font-normal text-[#5a5a5a]">
                            {Array.isArray(dipendente?.listaMansioni)
                                ? dipendente?.listaMansioni.join(", ")
                                : dipendente?.listaMansioni}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 ml-auto">
                    <div className="text-center">
                        <div className="relative group w-[50px] h-[50px]">

                            {
                                imgPrimoPiano?.url ? (
                                    <img
                                        src={imgPrimoPiano.url}
                                        alt="Primo Pian"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-[9px] bg-[#d8d8d8] flex items-center justify-center">
                                        <ImageUp
                                            className="w-8 h-8"
                                            color="#007a55"
                                            strokeWidth={1}
                                        />
                                    </div>
                                )
                            }

                            {!editHeader && imgPrimoPiano?.url &&(
                                <div className="absolute hidden group-hover:block z-50 top-0 right-0 p-2 shadow-lg rounded  translate-x-[25px] -translate-y-[25px]">
                                    <img
                                        src={imgPrimoPiano?.url}
                                        alt="Preview"
                                        className="max-w-[200px] max-h-[200px] object-contain cursor-pointer  hover:scale-200 "
                                        onClick={() => handleDownload('primo-piano', imgPrimoPiano)}
                                    />
                                </div>
                            )}
                        </div>
                        <Label>P.Piano</Label>
                    </div>


                    <div className="text-center">

                        <div className="relative group w-[50px] h-[50px]">

                            {
                                imgFiguraIntera?.url ? (
                                    <img
                                        src={imgFiguraIntera.url}
                                        alt="Figura Interan"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-[9px] bg-[#d8d8d8] flex items-center justify-center">
                                        <ImageUp
                                            className="w-8 h-8"
                                            color="#007a55"
                                            strokeWidth={1}
                                        />
                                    </div>
                                )
                            }
                            {!editHeader && imgFiguraIntera?.url && (
                                <div className="absolute hidden group-hover:block z-50 top-0 right-0 p-2 shadow-lg rounded  translate-x-[25px] -translate-y-[25px]">
                                    <img
                                        src={imgFiguraIntera?.url}
                                        alt="Preview"
                                        className="max-w-[200px] max-h-[200px] object-contain cursor-pointer hover:scale-200 "
                                        onClick={() => handleDownload('figura-intera', imgFiguraIntera)}
                                    />
                                </div>
                            )}
                        </div>

                        <Label>F.Intera</Label>

                        {editHeader && (
                            <div className="text-center">
                                <label className="cursor-pointer text-[#007a55] font-semibold hover:underline">
                                    Carica F.Int
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/gif"
                                        onChange={(e) => caricaImmagine(e, "figuraIntera")}
                                    />
                                </label>
                            </div>
                        )}
                    </div>


                    <div className="text-center">

                        <div className="relative group w-[50px] h-[50px]">

                            {
                                imgMezzoBusto?.url ? (
                                    <img
                                        src={imgMezzoBusto.url}
                                        alt="Mezzo Busto"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-[9px] bg-[#d8d8d8] flex items-center justify-center">
                                        <ImageUp
                                            className="w-8 h-8"
                                            color="#007a55"
                                            strokeWidth={1}
                                        />
                                    </div>
                                )
                            }

                            {!editHeader && imgMezzoBusto?.url && (
                                <div className="absolute hidden group-hover:block z-50 top-0 right-0 p-2 shadow-lg rounded  translate-x-[25px] -translate-y-[25px]">
                                    <img
                                        src={imgMezzoBusto?.url}
                                        alt="Preview"
                                        className="max-w-[200px] max-h-[200px] object-contain cursor-pointer  hover:scale-200 "
                                        onClick={() => handleDownload('mezzo-busto', imgMezzoBusto)}
                                    />
                                </div>
                            )}
                        </div>

                        <Label>M.Busto</Label>

                        {editHeader && (
                            <div className="text-center">
                                <label className="cursor-pointer text-[#007a55] font-semibold hover:underline">
                                    Carica M.Bust
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/gif"
                                        onChange={(e) => caricaImmagine(e, "mezzoBusto")}
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

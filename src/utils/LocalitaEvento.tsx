import { useEffect, useState, type ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { autocomplete } from "./googlePlaces";

interface ChildProps {
    onValueChange: (value: string) => void;
    localitaEventoValue: string;
}

interface Suggestion {
    placeId: string;
    text: string;
}

const LocalitaEvento: React.FC<ChildProps> = ({
    onValueChange,
    localitaEventoValue,
}) => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (!showSuggestions || localitaEventoValue.length < 3) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const predictions = await autocomplete(localitaEventoValue);
                setSuggestions(predictions);
            } catch (err) {
                console.error(err);
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localitaEventoValue, showSuggestions]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onValueChange(e.target.value);
        setShowSuggestions(true);
    };

    const handleSelect = (suggestion: Suggestion) => {
        onValueChange(suggestion.text);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <div className="space-y-2 admin-event-location">
            <Label htmlFor="eventLocation" className="text-[#007a55]">
                Località evento (indirizzo completo) *
            </Label>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MapPin className="w-4 h-4 text-gray-400" />
                </div>

                <Input
                    id="eventLocation"
                    name="eventLocation"
                    placeholder="Inserisci località evento (città)"
                    value={localitaEventoValue}
                    onChange={handleChange}
                    className="pl-10"
                    autoComplete="off"
                    required
                />

                {showSuggestions && suggestions.length > 0 && (
                    <div className="admin-address-suggestions absolute z-10 w-full mt-2 rounded-xl shadow-lg max-h-60 overflow-auto">
                        <ul className="py-1">
                            {suggestions.map((s) => (
                                <li
                                    key={s.placeId}
                                    className="admin-address-suggestion px-4 py-3 text-sm cursor-pointer"
                                    onClick={() => handleSelect(s)}
                                >
                                    {s.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <p className="text-sm text-muted-foreground">
                Inizia a digitare per vedere i suggerimenti (minimo 3 caratteri)
            </p>
        </div>
    );
};

export default LocalitaEvento;

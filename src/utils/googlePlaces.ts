export interface Suggestion {
    placeId: string;
    text: string;
}

export async function autocomplete(
    query: string
): Promise<Suggestion[]> {
    if (!query) return [];

    const response = await fetch(
        "https://places.googleapis.com/v1/places:autocomplete",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key":
                    import.meta.env.VITE_GOOGLE_API_KEY,
            },
            body: JSON.stringify({
                input: query,
                languageCode: "it",
                regionCode: "IT",
            }),
        }
    );

    const json = await response.json();

    const suggestions = json.suggestions ?? [];

    const results = await Promise.all(
        suggestions.map(async (s: any) => {
            const placeId = s.placePrediction.placeId;

            const place = await getPlace(placeId);

            const displayName = place.displayName?.text ?? "";
            const formattedAddress = place.formattedAddress ?? "";

            const textWithoutCountry = formattedAddress.replace(
                / ([A-Z]{2}), [^,]+$/,
                ""
            );

            const text = textWithoutCountry.startsWith(displayName)
                ? textWithoutCountry
                : [displayName, textWithoutCountry]
                    .filter(Boolean)
                    .join(", ");

            return {
                placeId,
                text,
            };
        })
    );

    return results;
}

export async function getPlace(placeId: string) {
    const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
            headers: {
                "X-Goog-Api-Key":
                    import.meta.env.VITE_GOOGLE_API_KEY,
                "X-Goog-FieldMask":
                    "id,displayName,formattedAddress,location,addressComponents",
            },
        }
    );

    return response.json();
}
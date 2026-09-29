import { useEffect, useRef, useState } from "react";

interface DistrictMapProps {
    districts: any[];
}

const DISTRICT_COORDS: Record<string, {lat: number, lng: number}> = {
    "Alwar": { lat: 27.55, lng: 76.63 },
    "Jaipur": { lat: 26.91, lng: 75.78 },
    "Jodhpur": { lat: 26.23, lng: 73.02 },
    "Udaipur": { lat: 24.58, lng: 73.68 },
    "Bikaner": { lat: 28.02, lng: 73.31 },
    "Ajmer": { lat: 26.44, lng: 74.63 },
    "Kota": { lat: 25.18, lng: 75.83 },
    "Bhilwara": { lat: 25.32, lng: 74.58 },
    "Sikar": { lat: 27.60, lng: 75.13 },
    "Pali": { lat: 25.77, lng: 73.33 }
};

export function DistrictMap({ districts }: DistrictMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState(false);
    
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!apiKey) {
            setError(true);
            return;
        }

        const initMap = () => {
            if (!mapRef.current) return;
            const google = (window as any).google;
            if (!google) return;

            const map = new google.maps.Map(mapRef.current, {
                center: { lat: 26.5, lng: 74.0 }, 
                zoom: 6,
                disableDefaultUI: true,
            });

            districts.forEach(d => {
                let color = "22C55E"; // LOW (green)
                if (d.riskBandCounts?.CRITICAL > 0) color = "EF4444"; // CRITICAL (red)
                else if (d.riskBandCounts?.HIGH > 0) color = "F97316"; // HIGH (orange)
                else if (d.riskBandCounts?.MEDIUM > 0) color = "EAB308"; // MEDIUM (yellow)

                const coords = DISTRICT_COORDS[d.district];
                if (!coords) return;

                new google.maps.Marker({
                    position: coords,
                    map,
                    title: d.district,
                    icon: `http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${color}`
                });
            });
        };

        if (!(window as any).google) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            script.onerror = () => setError(true);
            document.head.appendChild(script);
        } else {
            initMap();
        }
    }, [apiKey, districts]);

    if (!apiKey || error) {
        return (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg border border-gray-300">
                <div className="text-center">
                    <p className="text-gray-500 font-medium">Map Unavailable</p>
                    <p className="text-xs text-gray-400">Missing or invalid Google Maps API key</p>
                </div>
            </div>
        );
    }

    return <div ref={mapRef} className="w-full h-48 rounded-lg overflow-hidden border border-gray-300 shadow-sm" />;
}

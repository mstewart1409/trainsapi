// src/components/LocationComponent.js
import { useEffect, useState } from "react";

export default function useLocation() {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                console.log("Latitude is :", position.coords.latitude);
                console.log("Longitude is :", position.coords.longitude);
                setPosition(position.coords);
            },
            (err) => {
                console.error("Unable to retrieve location: " + err.message);
            }
        );
    }, []);

    return position;
}

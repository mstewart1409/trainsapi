// src/components/ClockComponent.js
import { useEffect, useState } from "react";

export default function useClock(showSeconds = true) { // Parameter to toggle seconds
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Update time every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const formattedDate = currentTime.toLocaleDateString("de-DE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = currentTime.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: showSeconds ? "2-digit" : undefined, // Optional seconds
    });

    return { formattedDate, formattedTime };
}

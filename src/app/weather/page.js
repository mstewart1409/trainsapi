"use client";
import { useState, useEffect } from 'react';
import useClock from '@/components/ClockComponent';
import useLocation from '@/components/LocationComponent';


const WeatherPage = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const position = useLocation();

    useEffect(() => {
        if (position !== null) {  // Check if position is available
            const getWeather = async () => {
                setError(null);

                try {
                    const response = await fetch(`/api/weather?lat=${position.latitude}&long=${position.longitude}`);
                    const data = await response.json();
                    console.log(data);
                    setWeather(data);
                } catch (err) {
                    setError("Error fetching weather data.");
                } finally {
                    setLoading(false);
                }
            };

            getWeather(); // Fetch immediately when position is available

            const interval = setInterval(getWeather, 60000); // Refresh weather every 60 seconds

            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [position]); // Re-run whenever position changes

    const roundedTemperature = weather ? Math.round(weather.main?.temp || null) : null;

    const { formattedDate, formattedTime } = useClock(false);
    return (
        <div>
            {/* Clock Display */}
            <div style={{ textAlign: "center", fontSize: "18px", marginBottom: "20px" }}>
                <p><strong>{formattedDate}</strong></p>
                <p style={{ fontSize: "60px", fontWeight: "bold" }}>{formattedTime}</p>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {weather && roundedTemperature !== null && (
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    {/* Weather Icon */}
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        <img
                            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                            alt={weather.weather[0].description}
                            style={{ width: "150px", height: "150px" }}
                        />
                    </div>
                    <p><strong>{weather.name}, {weather.sys.country}</strong></p>
                    <p>Temperature: {roundedTemperature}°C</p>
                    <p>Weather: {weather.weather[0].main}</p>
                </div>
            )}
        </div>
    );
};

export default WeatherPage;

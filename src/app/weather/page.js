"use client";
import { useState, useEffect } from 'react';

const WeatherPage = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getWeather = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/weather');
                const data = await response.json();
                setWeather(data);
            } catch (err) {
                setError("Error fetching weather data.");
            } finally {
                setLoading(false);
            }
        };

        getWeather();
    }, []);

    const roundedTemperature = weather ? Math.round(weather.main.temp) : null;

    return (
        <div>
            {loading && <p>Loading...</p>}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {weather && (
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    {/* Weather Icon */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <img
                            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                            alt={weather.weather[0].description}
                            style={{ width: '150px', height: '150px' }}
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

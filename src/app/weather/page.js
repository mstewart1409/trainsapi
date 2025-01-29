"use client";
import { useState, useEffect } from 'react';
import Link from "next/link";
import { fetchWeather } from "@/lib/weather";

const WeatherPage = () => {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);

    // Fetch the weather data when the component mounts
    useEffect(() => {
        const getWeather = async () => {
            try {
                const data = await fetchWeather();
                setWeather(data);
            } catch (err) {
                setError(err.message);
            }
        };

        getWeather();
    }, []);

    return (
        <div>
            {error ? (
                <p className="text-red-500">Error: {error}</p>
            ) : weather ? (
                <div>
                    <p>{weather.name}, {weather.name}</p>
                    <p>Temperature: {weather.main.temp}°C</p>
                    <p>Weather: {weather.weather[0].description}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default WeatherPage;

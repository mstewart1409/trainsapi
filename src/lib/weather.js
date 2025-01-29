// src/lib/weather.js
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const apiKey = process.env.OWM_API_KEY;

function getUrl(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
}

export async function fetchWeather(lat, lon) {
    try {
        const response = await fetch(getUrl(lat, lon));

        if (!response.ok) {
            return { error: `HTTP error! Status: ${response.status}` };
        }
        const data = await response.json();

        if (!data) {
            return { error: "Invalid API response format" };
        }
        return data;
    } catch (error) {
        console.error("Error fetching Weather data:", {
            message: error.message,
            stack: error.stack,
        });
        return { error: "Failed to fetch weather data" };
    }
}

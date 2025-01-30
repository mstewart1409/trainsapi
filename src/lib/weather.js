// src/lib/weather.js
import dotenv from 'dotenv';
import { retryDecorator } from './common';

// Load environment variables from the .env file
dotenv.config();

const apiKey = process.env.OWM_API_KEY;
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);


function getUrl(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
}

async function fetchWeatherBase(lat, lon) {
    try {
        const response = await fetch(getUrl(lat, lon), { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return { error: `HTTP error! Status: ${response.status}` };
        }
        const data = await response.json();

        if (!data) {
            return { error: "Invalid API response format" };
        }
        return {result: data};
    } catch (error) {
        console.error("Error fetching Weather data:", {
            message: error.message,
            stack: error.stack,
        });
        return { error: "Failed to fetch weather data" };
    }
}

export const fetchWeather = retryDecorator(fetchWeatherBase, 3, 0);
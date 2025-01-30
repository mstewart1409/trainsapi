// src/lib/weather.js
import dotenv from 'dotenv';
import { retryDecorator, baseHandler } from './common';

// Load environment variables from the .env file
dotenv.config();

const apiKey = process.env.OWM_API_KEY;


function getUrl(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
}

async function fetchWeatherBase(lat, long) {
    try {
        return await baseHandler(getUrl(lat, long));
    } catch (error) {
        console.error("Error fetching Weather data:", {
            message: error.message,
            stack: error.stack,
        });
        throw Error("Failed to fetch weather data");
    }
}

export const fetchWeather = retryDecorator(fetchWeatherBase, 3, 1000);
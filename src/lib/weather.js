// src/lib/weather.js

const apiKey = '17d8b2d05c2d4d75d37e93f365cbcefb'; // Use your own API key
const city = "Duesseldorf"

function getUrl(city) {
    return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
}

export async function fetchWeather() {
    try {
        const response = await fetch(getUrl(city));

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

// /api/weather/route.js
import { fetchWeather } from "@/lib/weather";
import { getCache } from "@/lib/cache";

// Fetch data from the external API and store it in the cache
const fetchDataFromAPI = async () => {
    try {
        const cache = await getCache();
        const response = await fetchWeather()
        console.log('Fetched new data from OpenWeatherMap');
        // Save the data to the cache
        cache.set('weather', response);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};

// Start a background worker that fetches data from the API every 2 minutes
const startBackgroundWorker = () => {
    // Fetch data right away
    //fetchDataFromAPI();
    setInterval(fetchDataFromAPI, 2 * 60 * 1000); // Every 2 minutes
};

// Call the function to start the worker
startBackgroundWorker();

export async function GET() {
    try {
        const cache = await getCache();
        const cachedWeather = cache.get('weather');
        if (cachedWeather) {
            return Response.json(cachedWeather, { status: 200 });
        } else {
            // If no cache data, fetch it from the API
            console.log('No cache data for weather');
            await fetchDataFromAPI();
            const newWeatherData = cache.get('weather');
            return Response.json(newWeatherData, { status: 200 });
        }
    } catch (error) {
        console.error("Unexpected server error:", {
            message: error.message,
            stack: error.stack,
        });
        return Response.json({ error: "Unexpected server error" }, { status: 500 });
    }
}

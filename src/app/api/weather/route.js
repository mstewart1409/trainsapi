// /api/weather/route.js
import { fetchWeather } from "@/lib/weather";
import { getCache } from "@/lib/cache";

// Fetch data from the external API and store it in the cache
const fetchDataFromAPI = async (lat, long) => {
    try {
        const cache = await getCache();
        const response = await fetchWeather(lat, long)
        console.log('Fetched new data from OpenWeatherMap');
        // Save the data to the cache
        cache.set('weather_' + lat + '_' + long, response);
        await addWeatherKey(lat + '_' + long);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};

const addWeatherKey = async (key) => {
    try {
        const cache = await getCache();
        const cachedKeys = cache.get('weatherKeys');
        if (cachedKeys) {
            if (!cachedKeys.includes(key)) {
                cachedKeys.push(key);
                cache.set('weatherKeys', cachedKeys);
                console.log('Added new weather key to cache:', key);
            }
        } else {
            cache.set('weatherKeys', [key]);
            console.log('Added new weather key to cache:', key);
        }
    } catch (error) {
        console.error('Error adding new weather key:', error);
    }
};

const fetchDataFromAPIMultiple = async () => {
    try {
        const cache = await getCache();
        const cachedKeys = cache.get('weatherKeys');
        if (cachedKeys) {
            for (const key of cachedKeys) {
                const [lat, long] = key.split('_');
                await fetchDataFromAPI(lat, long);
            }
        }
    } catch (error) {
        console.error('Error fetching weather data for multiple keys:', error);
    }
};

// Start a background worker that fetches data from the API every 2 minutes
const startBackgroundWorker = () => {
    // Fetch data right away
    //fetchDataFromAPI();
    setInterval(fetchDataFromAPIMultiple, 2 * 60 * 1000); // Every 2 minutes
};

// Call the function to start the worker
startBackgroundWorker();

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const long = searchParams.get('long');

    try {
        const cache = await getCache();
        const cachedWeather = cache.get('weather_' + lat + '_' + long);
        if (cachedWeather) {
            return Response.json(cachedWeather, { status: 200 });
        } else {
            // If no cache data, fetch it from the API
            console.log('No cache data for weather');
            await fetchDataFromAPI(lat, long);
            const newWeatherData = cache.get('weather_' + lat + '_' + long);
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

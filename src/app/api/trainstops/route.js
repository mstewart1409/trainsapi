// src/app/api/trainstops/route.js
import { getTrainStops, options } from '@/lib/trains';
import { getCache } from "@/lib/cache";


// Fetch data from the external API and store it in the cache
const fetchDataFromAPI = async (key) => {
    try {
        const cache = await getCache();
        const response = await getTrainStops(key);

        if(response.error) {
            console.error('Error fetching VRR data:', response.error);
            throw new Error(response.error);
        }
        console.log('Fetched new data from VRR for key:', key);
        // Save the data to the cache
        cache.set('vrr_' + key, response.result);
    } catch (error) {
        console.error('Error fetching VRR data', error);
        throw error;
    }
};


// Start a background worker that fetches data from the API every 2 minutes
const startBackgroundWorker = () => {
    const keys = Object.keys(options);
    // Fetch data right away
    //keys.forEach(key => fetchDataFromAPI(key));
    setInterval(() => {
        keys.forEach(key => fetchDataFromAPI(key));
    }, 10 * 1000); // Every 10 seconds
};

// Call the function to start the worker
startBackgroundWorker();

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    try {
        const cache = await getCache();
        const cachedVRR = cache.get('vrr_' + key);
        if (cachedVRR) {
            return Response.json(cachedVRR, { status: 200 });
        } else {
            // If no cache data, fetch it from the API
            console.log('No cache data on VRR for key:', key);
            await fetchDataFromAPI(key);
            const newCachedVRR = cache.get('vrr_' + key);
            return Response.json(newCachedVRR, { status: 200 });
        }
    } catch (error) {
        console.error("Unexpected server error:", {
            message: error.message,
            stack: error.stack,
        });
        return Response.json({ error: "Unexpected server error" }, { status: 500 });
    }
}

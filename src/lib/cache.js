// src/lib/cache.js
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 * 60 }); // Cache with 60-minute expiration time

export async function getCache() {
    try {
        return cache;
    } catch (error) {
        console.error("Error fetching cache: ", {
            message: error.message,
            stack: error.stack,
        });
        return { error: "Failed to fetch cache" };
    }
}

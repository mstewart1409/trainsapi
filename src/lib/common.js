// src/lib/common.js

export function retryDecorator(fn, retries = 3, delay = 1000) {
    return async function(...args) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn(...args);
            } catch (error) {
                if (i < retries - 1) {
                    console.warn(`Retrying function ${fn.name} after error... (${i + 1}/${retries})`);
                    await new Promise(res => setTimeout(res, delay));
                } else {
                    throw error;
                }
            }
        }
    };
}
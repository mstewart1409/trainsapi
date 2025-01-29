// src/app/api/trainstops/route.js
import { vrr } from '@/lib/vrr';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    try {
        const result = await vrr(key);

        if (result.error) {
            return Response.json({ error: result.error }, { status: 500 });
        }
        return Response.json(result, { status: 200 });
    } catch (error) {
        console.error("Unexpected server error:", {
            message: error.message,
            stack: error.stack,
        });
        return Response.json({ error: "Unexpected server error" }, { status: 500 });
    }
}

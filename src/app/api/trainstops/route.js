// src/app/api/trainstops/route.js
import { vrr } from '@/lib/vrr';

export async function GET() {
    try {
        const result = await vrr();

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

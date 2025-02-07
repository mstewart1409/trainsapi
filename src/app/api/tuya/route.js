// /api/tuya/route.js
import { getAccessToken, getStatus, controlDevice } from '@/lib/tuya';

export async function GET() {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Failed to get access token' }), { status: 500 });
        }

        const result = await getStatus(accessToken);
        if (!result) {
            return new Response(JSON.stringify({ error: 'Failed to control device' }), { status: 500 });
        }

        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json(); // Parse request body

        const accessToken = await getAccessToken();
        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Failed to get access token' }), { status: 500 });
        }

        const result = await controlDevice(accessToken, data);
        if (!result) {
            return new Response(JSON.stringify({ error: 'Failed to control device' }), { status: 500 });
        }

        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}

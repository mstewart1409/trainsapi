// src/app/api/session/route.js
import { withSession } from '@/lib/session';

// This GET request is for fetching the session data
export const GET = withSession(async (req) => {
    try {
        // Access the session data from req.session
        const session = req.session.get('user');

        if (session) {
            return new Response(JSON.stringify(session), { status: 200 });
        } else {
            // If no session exists, send a default response
            return new Response(
                JSON.stringify({ score: 0, usedSentences: [] }),
                { status: 200 }
            );
        }
    } catch (error) {
        console.error('Error fetching session:', error);
        return new Response(JSON.stringify({ error: 'Server error fetching session' }), { status: 500 });
    }
});

// This POST request is for updating the session data
export const POST = withSession(async (req) => {
    try {
        const { score, usedSentences } = await req.json();

        if (score === undefined || usedSentences === undefined) {
            return new Response(
                JSON.stringify({ error: 'Invalid input: missing score or usedSentences' }),
                { status: 400 }
            );
        }

        // Set session data using req.session.set
        req.session.set('user', { score, usedSentences });
        await req.session.save();

        return new Response(
            JSON.stringify({ message: 'Session updated successfully!' }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error saving session:', error);
        return new Response(
            JSON.stringify({ error: 'Server error saving session' }),
            { status: 500 }
        );
    }
});

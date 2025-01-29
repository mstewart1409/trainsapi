import { withIronSession } from 'next-iron-session';

export const withSession = (handler) => {
    return withIronSession(handler, {
        password: process.env.SESSION_SECRET,
        cookieName: 'game-session',
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production', // Ensure cookies are secure in production
        },
    });
};

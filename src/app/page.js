// app/page.js
"use client";
import Link from 'next/link';
import WeatherPage from "@/app/weather/page";

export default function Home() {
    return (
        <div>
            <WeatherPage />
            <Link href="/trains">
                <button>Go to Trains App</button>
            </Link>
        </div>
    );
}

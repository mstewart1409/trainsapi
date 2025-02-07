"use client";
import Link from 'next/link';
import WeatherPage from "@/app/weather/page";

export default function Home() {
    return (
        <div className="p-4">
            <WeatherPage />
            <div className="flex gap-4 mt-4 mb-4 flex-wrap">
                <Link href="/lights">
                    <button>
                        Lights Control
                    </button>
                </Link>
                <Link href="/trains">
                    <button>
                        Trains App
                    </button>
                </Link>
            </div>
        </div>
    );
}
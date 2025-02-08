"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({ children }) {
    useEffect(() => {
        async function loadManifest() {
            try {
                const response = await fetch("/api/manifest", {
                    credentials: "include", // Use browser-stored credentials
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to load manifest: ${response.status}`);
                }

                const manifest = await response.json();
                const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
                const manifestURL = URL.createObjectURL(blob);

                const link = document.createElement("link");
                link.rel = "manifest";
                link.href = manifestURL;
                document.head.appendChild(link);
            } catch (error) {
                console.error("Error loading manifest:", error);
            }
        }

        loadManifest();
    }, []);

    return (
        <html lang="en">
        <head>
            <meta name="theme-color" content="#000000" />
            <meta name="description" content="My Progressive Web App built with Next.js" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        </body>
        </html>
    );
}

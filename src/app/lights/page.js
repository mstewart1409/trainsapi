'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";

const LightControl = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tempBrightness, setTempBrightness] = useState(10); // UI for smooth brightness change


    // Fetch device status on load
    useEffect(() => {
        fetch('/api/tuya')
            .then(res => res.json())
            .then((data) => {
                setStatus(data);
                setTempBrightness(data.brightness || 10); // Set initial brightness
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching device status:', err);
                setLoading(false);
            });
    }, []);

    // Toggle device power
    const toggleDevice = async () => {
        if (!status) return;

        const action = status.on ? 'turn_off' : 'turn_on';
        setLoading(true);

        try {
            const response = await fetch('/api/tuya', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            const data = await response.json();
            setStatus(data);
        } catch (error) {
            console.error('Error controlling device:', error);
        } finally {
            setLoading(false);
        }
    };

    // Change brightness
    const changeBrightness = async (brightness) => {
        if (!status) return;

        setTempBrightness(brightness); // Update UI instantly
        setLoading(true);

        try {
            const response = await fetch('/api/tuya', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'set_brightness', brightness }),
            });

            const data = await response.json();
            setStatus(data);
        } catch (error) {
            console.error('Error setting brightness:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow-md max-w-sm mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4">Balkony Light Control</h2>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <button
                    onClick={toggleDevice}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg shadow-md transition ${
                        status?.on ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    } text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {status?.on ? 'Turn Off' : 'Turn On'}
                </button>
            )}

            {/* Brightness Slider */}
            {!loading && (
                <div className="mt-4">
                    <label className="block text-sm font-medium">Brightness: {tempBrightness}</label>
                    <input
                        type="range"
                        min="10"
                        max="1000"
                        value={tempBrightness}
                        onChange={(e) => setTempBrightness(Number(e.target.value))} // Update UI instantly
                        onMouseUp={() => changeBrightness(tempBrightness)} // Apply change on release
                        onTouchEnd={() => changeBrightness(tempBrightness)} // Mobile support
                        className="w-full"
                    />
                </div>
            )}

            <p className="text-gray-700 mt-4">
                Status: {loading ? 'Loading...' : status?.on ? 'On' : 'Off'}
            </p>
            <Link href="/">
                <button className="mt-4 px-4 py-2 rounded bg-blue-500 text-white">Back to Home</button>
            </Link>
        </div>
    );
};

export default LightControl;

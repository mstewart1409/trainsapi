"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { options } from '@/lib/vrr';
import Link from "next/link";

const calculateRemainingMinutes = (departureTime) => {
    const now = new Date();
    const departure = new Date(departureTime);
    const difference = Math.floor((departure - now) / 60000); // Convert ms to minutes
    return difference <= 0 ? "sofort" : `${difference} min`;
};

export default function TrainsPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [trainStops, setTrainStops] = useState([]);
    const [filteredTrainStops, setFilteredTrainStops] = useState([]);
    const [error, setError] = useState(null);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStop, setSelectedStop] = useState(null);
    const router = useRouter();

    const [lastActivityTime, setLastActivityTime] = useState(Date.now());

    const [filters, setFilters] = useState({
        gleis: "",  // Filtering by platform (Gleis)
        linie: "",  // Filtering by train number (Linie)
        richtung: "", // Filtering by direction (Richtung)
        limit: 5,
        location: "WUPPERSTRASSE" // Default location
    });
    // Create a ref to persist the infos without resetting
    const infoRefs = useRef([]);

    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Update time every second

        return () => clearInterval(interval); // Cleanup the interval on component unmount
    }, []);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/trainstops?key=${filters.location}`);
                const data = await response.json();
                if (response.ok) {
                    setTrainStops(data); // Store all data without slicing
                    applyFilters(data, filters); // Apply filters when new data is fetched
                } else {
                    setError(data.error || "Unknown error");
                }
            } catch (err) {
                setError("Failed to fetch train stops");
            }
        }

        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [filters]); // Re-fetch and apply filter whenever filters change

    // Live timer effect for "Arriving In" field
    useEffect(() => {
        const updateTimers = () => {
            setFilteredTrainStops((prevStops) =>
                prevStops.map((stop) => ({
                    ...stop,
                    remainingTime: calculateRemainingMinutes(stop.estimated_time),
                }))
            );
        };

        updateTimers(); // Initial call
        const interval = setInterval(updateTimers, 1000); // Update every second

        return () => clearInterval(interval);
    }, []);

    // ** Debounced Filter Change Effect **
    useEffect(() => {
        const timeout = setTimeout(() => {
            applyFilters(trainStops, debouncedFilters);
        }, 300); // Wait 300ms before applying filters

        return () => clearTimeout(timeout);
    }, [debouncedFilters, trainStops]); // Runs only when debouncedFilters change


    // Reset the last activity time on mouse or key events
    useEffect(() => {
        const resetInactivityTimeout = () => {
            setLastActivityTime(Date.now());  // Update the last activity timestamp
        };

        // Listeners for user activity
        const events = ['mousemove', 'keydown', 'click', 'scroll'];

        events.forEach((event) => {
            window.addEventListener(event, resetInactivityTimeout);
        });

        // Set up the inactivity check interval
        const inactivityCheckInterval = setInterval(handleInactivity, 1000); // Check every second

        // Cleanup on component unmount
        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, resetInactivityTimeout);
            });
            clearInterval(inactivityCheckInterval);
        };
    }, [lastActivityTime, router]);


    const formattedDate = currentTime.toLocaleDateString("de-DE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = currentTime.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    // Generic filter function
    const applyFilters = (data, filters) => {
        let filteredData = data;

        // Apply filter by Gleis (only allow platforms defined for the selected location)
        if (filters.gleis) {
            // Check if the selected gleis exists in the selected location's platforms
            if (options[filters.location]?.platforms.includes(filters.gleis)) {
                filteredData = filteredData.filter((stop) => stop.platform === filters.gleis);
            } else {
                filteredData = []; // If the gleis doesn't match the available platforms, clear the filtered data
            }
        }

        // Apply filter by Linie
        if (filters.linie) {
            filteredData = filteredData.filter((stop) => stop.train_no.includes(filters.linie));
        }

        // Apply filter by Richtung
        if (filters.richtung) {
            filteredData = filteredData.filter((stop) => stop.destination.includes(filters.richtung));
        }

        // Apply filter by limit
        if (filters.limit !== 0) {
            filteredData = filteredData.slice(0, filters.limit); // Use slice instead of splice to not mutate the array
        }

        setFilteredTrainStops(filteredData);
    };


    // Handle changes in filter inputs
    const handleFilterChange = (field, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [field]: value }));

        // Debounce the filter update to avoid flickering
        setDebouncedFilters((prevFilters) => ({ ...prevFilters, [field]: value }));
    };

    // Compare and update infos only when it changes
    const getUpdatedInfos = (index, newInfos) => {
        const prevInfos = infoRefs.current[index]?.infos;

        // Update only if new `infos` is different from the previous one
        if (prevInfos && JSON.stringify(prevInfos) !== JSON.stringify(newInfos)) {
            infoRefs.current[index].infos = newInfos; // Update only when it changes
        }

        return infoRefs.current[index]?.infos;
    };


    const toggleLimit = () => {
        if (buttonDisabled) return; // Prevent multiple clicks

        setButtonDisabled(true); // Disable button immediately

        setFilters(prevFilters => {
            const newLimit = prevFilters.limit === 5 ? 10 : 5;

            // Re-enable the button after state update is done
            setTimeout(() => setButtonDisabled(false), 500); // Slight delay to avoid flickering

            return { ...prevFilters, limit: newLimit };
        });
    };

    // Function to handle inactivity timeout
    const handleInactivity = () => {
        const currentTime = Date.now();
        const timeDifference = currentTime - lastActivityTime;

        // If no activity for 5 minutes (300,000 ms), redirect to home
        if (timeDifference >= 300000) {
            router.push("/");  // Redirect to the homepage
        }
    };

    return (
        <main className="p-6 led-table-container">
            <div className="time-container">
                <div className="date">{formattedDate}</div>
                <div className="time">{formattedTime}</div>
            </div>

            <h1 className="text-2xl font-bold mb-4">Train Departures</h1>
            {error && <p className="text-red-500">{error}</p>}

            <div className="mb-4 flex-wrap">
                {/* Location dropdown */}
                <div><label className="mr-2">Select Location: </label>
                    <select
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="border p-2 mb-2"
                    >
                        {Object.entries(options).map(([key, { name }]) => (
                            <option key={key} value={key}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filter by Gleis */}
                <div>
                    <label className="mr-2">Filter by Gleis: </label>
                    <select
                        value={filters.gleis}
                        onChange={(e) => handleFilterChange('gleis', e.target.value)}
                        className="border p-2 mb-2"
                    >
                        {/* Populate the platform options dynamically based on the selected location */}
                        <option value="">Select Gleis</option>
                        {options[filters.location]?.platforms.map((platform, index) => (
                            <option key={index} value={platform}>
                                {platform}
                            </option>
                        ))}
                    </select>
                </div>


                {/* Filter by Linie */}
                <div>
                    <label className="mr-2 ml-4">Filter by Linie: </label>
                    <input
                        type="text"
                        value={filters.linie}
                        onChange={(e) => handleFilterChange('linie', e.target.value)}
                        className="border p-2 mb-2"
                        placeholder="Enter Train No (e.g., 101)"
                    />
                </div>

                {/* Filter by Richtung */}
                <div>
                    <label className="mr-2 ml-4">Filter by Richtung: </label>
                    <input
                        type="text"
                        value={filters.richtung}
                        onChange={(e) => handleFilterChange('richtung', e.target.value)}
                        className="border p-2 mb-2"
                        placeholder="Enter Destination (e.g., Berlin)"
                    />
                </div>
            </div>

            {/* Table of train stops */}
            <table className="led-table">
                <thead>
                <tr>
                    <th>Zeit</th>
                    <th>Linie</th>
                    <th>Richtung</th>
                    <th>Gleis</th>
                    <th>Ankunft</th>
                </tr>
                </thead>
                <tbody>
                {filteredTrainStops.map((stop, index) => {
                    // Initialize ref for infos if it doesn't exist yet
                    infoRefs.current[index] = infoRefs.current[index] || { infos: stop.infos };

                    // Get updated infos and compare it with previous to update if needed
                    const updatedInfos = getUpdatedInfos(index, stop.infos);

                    return (
                        <tr key={index} onClick={() => {
                            setSelectedStop(stop);
                            setIsModalOpen(true);
                        }}>
                            <td className="time">
                                {new Date(stop.arrival_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                                {stop.delay > 0 && (
                                    <div>+{stop.delay} min</div>
                                )}
                            </td>
                            <td>{stop.train_no}</td>
                            <td>
                                {stop.destination}
                                {updatedInfos && updatedInfos.length > 0 && (
                                    <div className="scroll-text-container">
                                        <div className="scroll-text">
                                            {updatedInfos.join(". ")}
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td>{stop.platform}</td>
                            <td className="arriving-in">
                                {stop.cancelled ? (
                                    <p className="text-red-500">Cancelled</p>
                                ) : (
                                    stop.remainingTime
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            <div className="mb-4 flex-wrap">
                {/* Show More / Show Less Button */}
                <button
                    onClick={toggleLimit}
                    disabled={buttonDisabled}
                    className={`mt-4 px-4 py-2 rounded ${buttonDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 text-white"}`}
                >
                    {filters.limit === 5 ? "Show More" : "Show Less"}
                </button>
                <Link href="/">
                    <button className="mt-4 px-4 py-2 rounded bg-blue-500 text-white">Back to Home</button>
                </Link>
            </div>

            {/* Modal for detailed train information */}
            {isModalOpen && selectedStop && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Train Information</h2>
                        <p><strong>Linie:</strong> {selectedStop.train_no}</p>
                        <p><strong>Richtung:</strong> {selectedStop.destination}</p>
                        <p><strong>Gleis:</strong> {selectedStop.platform}</p>
                        <p><strong>Ankunft:</strong> {new Date(selectedStop.arrival_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</p>
                        <p><strong>Remaining Time:</strong> {selectedStop.remainingTime}</p>
                        {selectedStop.infos && selectedStop.infos.length > 0 && (
                            <div>
                                <strong>Additional Info:</strong>
                                <ul>
                                    {selectedStop.infos.map((info, idx) => (
                                        <li key={idx}>{info}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">Close</button>
                    </div>
                </div>
            )}

        </main>
    );
}

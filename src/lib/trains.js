// src/lib/vrr.js
import { retryDecorator } from './common';


const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

export const options = {
    "VOLKLINGER": {
        id: "de%3A05111%3A18115",
        name: "Düsseldorf, Völklinger Straße S",
        platforms: ["1", "2"],
        includes: "&inclMOT_0=true&inclMOT_1=true&inclMOT_10=true&inclMOT_11=true&inclMOT_12=true&inclMOT_13=true&inclMOT_17=true&inclMOT_18=true&inclMOT_2=true&inclMOT_8=true&inclMOT_9=true"},
    "BILK": {
        id: "de%3A05111%3A18249",
        name: "Düsseldorf, Bilk S",
        platforms: ["1", "2", "3", "4"],
        includes: "&inclMOT_0=true&inclMOT_1=true&inclMOT_10=true&inclMOT_11=true&inclMOT_12=true&inclMOT_13=true&inclMOT_17=true&inclMOT_18=true&inclMOT_2=true&inclMOT_8=true&inclMOT_9=true"},
    "WUPPERSTRASSE": {
        id: "de%3A05111%3A18109",
        name: "Düsseldorf, Wupperstraße",
        platforms: ["1", "2"],
        includes: "&inclMOT_0=true&inclMOT_1=true&inclMOT_10=true&inclMOT_11=true&inclMOT_12=true&inclMOT_13=true&inclMOT_17=true&inclMOT_18=true&inclMOT_19=true&inclMOT_2=true&inclMOT_3=true&inclMOT_4=true&inclMOT_5=true&inclMOT_6=true&inclMOT_7=true&inclMOT_8=true&inclMOT_9=true"},
}

function getUrl(key) {
    if (!(key in options)) {
        throw new Error(`Invalid key: ${key}`);
    }

    const locationId = options[key]?.id;
    const includes = options[key]?.includes;
    return `https://www.vrr.de/vrr-efa/XML_DM_REQUEST?calcOneDirection=1&coordOutputFormat=WGS84%5Bdd.ddddd%5D&deleteAssignedStops_dm=1&depSequence=30&depType=stopEvents&doNotSearchForStops=1&genMaps=0&imparedOptionsActive=1${includes}&includeCompleteStopSeq=1&includedMeans=checkbox&itOptionsActive=1&itdDateTimeDepArr=dep&language=de&locationServerActive=1&maxTimeLoop=1&mode=direct&name_dm=${locationId}&outputFormat=rapidJSON&ptOptionsActive=1&serverInfo=1&sl3plusDMMacro=1&type_dm=any&useAllStops=1&useElevationData=1&useProxFootSearch=0&useRealtime=1&version=10.5.17.3&vrrDMMacro=1`;
}

export async function getTrainStops(key) {
    try {
        const url = getUrl(key);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return { error: `HTTP error! Status: ${response.status}` };
        }
        const data = await response.json();

        if (!data?.stopEvents || !Array.isArray(data.stopEvents)) {
            return { error: "Invalid API response format" };
        }

        const stops = data.stopEvents.map((stop) => ({
            arrival_time: stop?.departureTimePlanned,
            cancelled: stop?.isCancelled || false,
            estimated_time: stop?.departureTimeEstimated || stop?.departureTimePlanned,
            delay: (stop.departureTimeEstimated && stop.departureTimePlanned && stop.departureTimeEstimated !== stop.departureTimePlanned)
                ? Math.floor((new Date(stop.departureTimeEstimated) - new Date(stop.departureTimePlanned)) / (1000 * 60))
                : "-",
            platform: stop?.location?.properties?.platform || "Unknown",
            train_no: stop?.transportation?.number || "Unknown",
            destination: stop?.transportation?.destination?.name || "Unknown",
            infos: stop?.infos?.map((info) => info.infoLinks[0]?.subtitle) || [],
        }));
        return {result: stops};

    } catch (error) {
        console.error("Error fetching VRR data:", {
            message: error.message,
            stack: error.stack,
        });
        return { error: "Failed to fetch train stops" };
    }
}

export const fetchWeather = retryDecorator(getTrainStops, 3, 0);
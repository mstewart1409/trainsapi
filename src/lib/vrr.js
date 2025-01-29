const url = "https://www.vrr.de/vrr-efa/XML_DM_REQUEST?calcOneDirection=1&coordOutputFormat=WGS84%5Bdd.ddddd%5D&deleteAssignedStops_dm=1&depSequence=30&depType=stopEvents&doNotSearchForStops=1&genMaps=0&imparedOptionsActive=1&inclMOT_0=true&inclMOT_1=true&inclMOT_10=true&inclMOT_11=true&inclMOT_12=true&inclMOT_13=true&inclMOT_17=true&inclMOT_18=true&inclMOT_19=true&inclMOT_2=true&inclMOT_3=true&inclMOT_4=true&inclMOT_5=true&inclMOT_6=true&inclMOT_7=true&inclMOT_8=true&inclMOT_9=true&includeCompleteStopSeq=1&includedMeans=checkbox&itOptionsActive=1&itdDateTimeDepArr=dep&language=de&locationServerActive=1&maxTimeLoop=1&mode=direct&name_dm=de%3A05111%3A18109&outputFormat=rapidJSON&ptOptionsActive=1&serverInfo=1&sl3plusDMMacro=1&type_dm=any&useAllStops=1&useElevationData=1&useProxFootSearch=0&useRealtime=1&version=10.5.17.3&vrrDMMacro=1";

export async function vrr() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return { error: `HTTP error! Status: ${response.status}` };
        }
        const data = await response.json();

        if (!data?.stopEvents || !Array.isArray(data.stopEvents)) {
            return { error: "Invalid API response format" };
        }

        const trainStops = data.stopEvents.map((stop) => ({
            arrival_time: stop.departureTimePlanned,
            delay: Math.floor((new Date(stop.departureTimeEstimated) - new Date(stop.departureTimePlanned)) / (1000 * 60)),
            platform: stop?.location?.properties?.platform || "Unknown",
            train_no: stop?.transportation?.number || "Unknown",
            destination: stop?.transportation?.destination?.name || "Unknown",
            arriving_in: Math.max(0, Math.floor((new Date(stop.departureTimeEstimated) - new Date()) / (1000 * 60))),
            infos: stop?.infos?.map((info) => info.infoLinks[0]?.subtitle) || [],
        }));

        return trainStops;
    } catch (error) {
        console.error("Error fetching VRR data:", {
            message: error.message,
            stack: error.stack,
        });
        return { error: "Failed to fetch train stops" };
    }
}

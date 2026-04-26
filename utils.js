export async function withinSchedule(){
    const result = await chrome.storage.local.get(["lowerBound", "upperBound"]);
    
    const scheduleLower = result.lowerBound;
    const scheduleUpper = result.upperBound;

    if (scheduleLower && scheduleUpper){
        
        const lowerBound = Temporal.PlainTime.from(scheduleLower);
        const upperBound = Temporal.PlainTime.from(scheduleUpper);
        const now = Temporal.Now.plainTimeISO();

        return (Temporal.PlainTime.compare(now, upperBound) == -1 && Temporal.PlainTime.compare(now, lowerBound) == 1)
        || Temporal.PlainTime.compare(now, upperBound) == 0
        || Temporal.PlainTime.compare(now, lowerBound) == 0;
    }
    
    return false;
}

export async function siteIsBlocked(url){
    const result = await chrome.storage.local.get(["count"]);
    const count = result.count;

    if (count){
        for (let i = 0; i < count; i++){
            let key = "site" + i;
            let result = await chrome.storage.local.get([key]);
            let site = result[key];
            if (site === String(url).substring(4)) {
                return true;
            }
                
        }
    }

    return false;
}
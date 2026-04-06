chrome.tabs.onUpdated.addListener(checkCurrentSite);
checkCurrentSite();

function withinSchedule(){
    let scheduleLower, scheduleUpper;
    chrome.storage.local.get(["lowerBound"]).then((result) => {
        scheduleLower = result.key;
    });
    chrome.storage.local.get(["upperBound"]).then((result) => {
        scheduleUpper = result.key;
    });
    
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

function checkCurrentSite(){
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        
        const url = new URL(tabs[0].url).hostname;
        if (siteIsBlocked(url) && withinSchedule()){
            chrome.tabs.remove(
                tabs[0].id,
            ).catch(function(e){
                console.log(e)}
            );
        }
    });
}

function siteIsBlocked(url){
    let count;
    chrome.storage.local.get(["count"]).then((result) => {
        count = result.key;
    });
    
    if (count){
        let site;
        for (let i = count; i > 0; i--){
            let key = "site" + i;
            chrome.storage.local.get([key]).then((result) => {
                site = result.key;
            });
            if (site === String(url).substring(4)) {
                return true;
            }
                
        }
    }

    return false;
}
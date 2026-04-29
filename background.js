import { withinSchedule, siteIsBlocked } from "./utils.js";

chrome.tabs.onUpdated.addListener((tabId, info, tab) => checkSite(tabId, info, tab));

async function checkSite(tabId, info, tab){
    if (info.url || info.status === 'loading') {
        const rawUrl = info.url || tab.pendingUrl || tab.url;
        const url = rawUrl.split(".")[1] + "." + rawUrl.split(".")[2].split("/")[0];
        const isBlocked = await siteIsBlocked(url);
        const isWithin = await withinSchedule();
        
        if (isBlocked && isWithin){
                chrome.tabs.remove(
                    tabId,
                ).catch(function(e){
                    console.log(e)}
                );
        }
    }
}
import { withinSchedule, siteIsBlocked } from "./utils.js";

chrome.tabs.onUpdated.addListener((tabId, info, tab) => checkSite(tabId, info, tab));

async function checkSite(tabId, info, tab){
    if (info.url || info.status === 'loading') {
        const url = info.url || tab.pendingUrl || tab.url;
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
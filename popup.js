import { withinSchedule, siteIsBlocked } from "./utils.js";
//get current schedule
chrome.storage.local.get(["lowerBound", "upperBound"]).then((result)=>{
    const scheduleLower = result.lowerBound;
    const scheduleUpper = result.upperBound;

    if (scheduleLower && scheduleUpper) document.getElementById("currentSchedule").innerHTML = scheduleLower + " to " + scheduleUpper;
    else document.getElementById("currentSchedule").innerHTML = "No Schedule set";
        
});

// Blocked Sites
chrome.storage.local.get(["count"]).then((result) => localBlocked(result));


async function localBlocked(result){
    const count = result.count;

    if (count && count !== 0){
        for (let i = 0; i < count; i++){
            let key = "site" + i;
            let result = await chrome.storage.local.get([key]);
            let site = result[key];
            tableAdd(site);
        }
    }
}

// Set Schedule
update();

// Add Website
document.getElementById("addSite").addEventListener("click", addSite);

async function addSite(){
    let url = document.getElementById("siteName").value;
    if (!url.startsWith("https://")) url = "https://" + url;
    // Checks if URL is valid
    let site;
    try {
        site = new URL(url).hostname;
    } catch (error) {
        // Pop up or something saying site is not valid
        alert("Provided URL is not valid");
        return;  
    }

    const isBlocked = await siteIsBlocked(site);
    
    // Checks if URL is already blocked
    if (isBlocked){
        alert("URL is already blocked");
    } else {

        // Add it to table
        tableAdd(site);

        update();

        //add to local storage
        const result = await chrome.storage.local.get(["count"]);
        let count = result.count;
        if (!count) count = 0;
    
        const forSet = "site" + count;
        count = Number(count) + 1;
        chrome.storage.local.set({ [forSet] : site });
        chrome.storage.local.set({ "count": count });
    }
}


function tableAdd(site){
    const table = document.getElementById("blockedTable");
    
    // Create an empty <tr> element and add it to the 1st position of the table:
    const row = table.insertRow(table.rows.length);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    const cell1 = row.insertCell(0);

    // Add some text to the new cells:
    cell1.innerHTML = site;
}

function removeSite(index){
    document.getElementById("removeSite" + index).addEventListener("click", () => {
        document.getElementById("blockedTable").deleteRow(index);
        saveSites();
    });
}

async function update(){
    const schedule = document.getElementById("setSchedule");
    
    const isWithin = await withinSchedule();

    if (isWithin){
        schedule.innerHTML = "You cannot edit your schedule whilst it is active";
        removeRemoval();
    } else {
        schedule.innerHTML = "<input type=\"time\" id=\"lowerBound\" required>"
        + "<input type=\"time\" id=\"upperBound\" required>"
        + "<button id=\"scheduleButton\">Set Schedule</button>";

        document.getElementById("scheduleButton").addEventListener("click", setSchedule);

        addRemoval();
    }
}

function addRemoval(){
    const rows = document.getElementById("blockedTable").rows;
    for (let i = 0; i < rows.length; i++){
        if (rows[i].cells.length < 2){
            let cell = rows[i].insertCell(1);
            cell.innerHTML = "<button type=\"button\" id=\"removeSite" + i + "\">Remove</button>";
            document.getElementById("removeSite" + i).addEventListener("click", removeSite(i));
        }
    }
}

function removeRemoval(){
    const rows = document.getElementById("blockedTable").rows;
    for (let i = 0; i < rows.length; i++){
        if (rows[i].cells.length === 2){
            rows[i].deleteCell(1);
        }
    }
}

async function saveSites(){
    const result = await chrome.storage.local.get(["lowerBound", "upperBound"]);

    const scheduleLower = result.lowerBound;

    const scheduleUpper = result.upperBound;

    chrome.storage.local.clear();

    if (scheduleLower && scheduleUpper){
        chrome.storage.local.set({ "lowerBound": scheduleLower });
        chrome.storage.local.set({ "upperBound": scheduleUpper });
    }

    const count = document.getElementById("blockedTable").rows.length;
    chrome.storage.local.set({ "count": count });
    
    if (count && count !== 0){
        const rows = document.getElementById("blockedTable").rows;
        for (let i = 0; i < count; i++) {
            let key = "site"+i;
            let value = rows[i].cells[0].innerHTML;
            chrome.storage.local.set({ [key] : value});
        }
    }
}

function setSchedule(){
    const lowerBound = document.getElementById("lowerBound").value;
    const upperBound = document.getElementById("upperBound").value;

    if (lowerBound && upperBound){
        
        // Add to local storage
        chrome.storage.local.set({ "lowerBound": lowerBound });
        chrome.storage.local.set({ "upperBound": upperBound });


        // update current schedule
        document.getElementById("currentSchedule").innerHTML = lowerBound + " to " + upperBound;

        update();
        
    }

}

/*
Feature Idea: Only unlocks when a code sent to phone is entered. Could pair up with brick to have extra reinforced discipline.

*/
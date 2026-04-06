

initialise();

function initialise(){
    
    // Current Schedule
    let scheduleLower, scheduleUpper;
    chrome.storage.local.get(["lowerBound"]).then((result) => {
        scheduleLower = result.key;
    });
    chrome.storage.local.get(["upperBound"]).then((result) => {
        scheduleUpper = result.key;
    });

    if (scheduleLower && scheduleUpper) document.getElementById("currentSchedule").innerHTML = scheduleLower + " to " + scheduleUpper;
    else document.getElementById("currentSchedule").innerHTML = "No Schedule set";

    // Blocked Sites
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
            tableAdd(site);
        }
    }

    // Set Schedule
    update();

    // Add Website
    document.getElementById("addSite").addEventListener("click", addSite);
    
}

function addSite(){
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

    // Checks if URL is already blocked
    if (siteIsBlocked(site)){
        alert("URL is already blocked");
    } else {
        // Add it to table
        let count;
        chrome.storage.local.get(["count"]).then((result) => {
            count = result.key;
        });
        if (!count) count = 0;
        count = Number(count) + 1;
    
        const forSet = "site" + count;
        chrome.storage.local.set({ forSet : site }).then(() => {});
        chrome.storage.local.set({ "count": count }).then(() => {});
        tableAdd(site);
        update();
    }
}


function tableAdd(site){
    const table = document.getElementById("blockedTable");
    
    // Create an empty <tr> element and add it to the 1st position of the table:
    const row = table.insertRow(table.rows.length);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);

    // Add some text to the new cells:
    cell1.innerHTML = site;
}

function removeSite(index){
    document.getElementById("removeSite" + index).addEventListener("click", () => {
        document.getElementById("blockedTable").deleteRow(index);
        saveSites();
    });
}

function update(){
    const schedule = document.getElementById("setSchedule");
    if (withinSchedule()){
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
        rows[i].cells[1].innerHTML = "<button type=\"button\" id=\"removeSite" + i + "\">Remove</button>";
        document.getElementById("removeSite" + i).addEventListener("click", removeSite(i));
    }
}

function removeRemoval(){
    const rows = document.getElementById("blockedTable").rows;
    for (let i = 0; i < rows.length; i++){
        rows[i].cells[1].innerHTML = "";
    }
}

function saveSites(){
    let scheduleLower, scheduleUpper;
    chrome.storage.local.get(["lowerBound"]).then((result) => {
        scheduleLower = result.key;
    });

    chrome.storage.local.get(["upperBound"]).then((result) => {
        scheduleUpper = result.key;
    });

    chrome.storage.local.clear();

    if (scheduleLower && scheduleUpper){
        chrome.storage.local.set({ "lowerBound": lowerBound }).then(() => {});
        chrome.storage.local.set({ "upperBound": upperBound }).then(() => {});
    }

    const count = tableCount();
    chrome.storage.local.set({ "count": count }).then(() => {});
    
    if (count != 0){
        const rows = document.getElementById("blockedTable").rows;
        for (let i = 0; i < count; i++) {
            rows[i].cells[0].innerHTML = i+1;
            let key = "site"+i+1;
            let value = rows[i].cells[1].innerHTML;
            chrome.storage.local.set({ key : value}).then(() => {});
        }
    }
}

function setSchedule(){
    const lowerBound = document.getElementById("lowerBound").value;
    const upperBound = document.getElementById("upperBound").value;

    if (lowerBound && upperBound){
        
        // Add to local storage
        chrome.storage.local.set({ 'lowerBound': lowerBound }).then(() => {});
        chrome.storage.local.set({ 'upperBound': upperBound }).then(() => {});

        // update current schedule
        document.getElementById("currentSchedule").innerHTML = lowerBound + " to " + upperBound;

        update();
        
    }

}

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

/*
Feature Idea: Only unlocks when a code sent to phone is entered. Could pair up with brick to have extra reinforced discipline.

*/
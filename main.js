let blocked;
let scheduleUpper;
let scheduleLower;
let rowCount;

initialise();

checkCurrentSite();

function initialise(){
    blocked = [];
    chrome.tabs.onUpdated.addListener(checkCurrentSite);
    scheduleLower = localStorage.getItem("lowerBound");
    scheduleUpper = localStorage.getItem("upperBound");

    document.getElementById("addSite").addEventListener("click", addSite);

    if (scheduleLower && scheduleUpper) document.getElementById("currentSchedule").innerHTML = scheduleLower + " to " + scheduleUpper;
    else document.getElementById("currentSchedule").innerHTML = "No Schedule set";

    const count = localStorage.getItem("count");
    if (count) rowCount = count;
    else rowCount = 0;
    
    if (rowCount != 0){
        let site;
        for (let i = rowCount; i > 0; i--){
            site = localStorage.getItem("site" + i);
            blocked.push(site);
            addSiteGraphic(site, i);
        }
    }
    
    update();
}

function addSite(){
    // Checks if URL is valid
    let site;
    try {
        site = new URL(document.getElementById("siteName").value).hostname;
    } catch (error) {
        // Pop up or something saying site is not valid
        alert("Provided URL is not valid");
        return;  
    }

    // Checks if URL is already blocked
    if (blocked.includes(site)){
        alert("URL is already blocked");
    } else {
        // Add to internal list and local storage
        blocked.push(site);

        rowCount++;
        localStorage.setItem("site" + rowCount, site);
        localStorage.setItem("count", rowCount);

        // Add it to table
        addSiteGraphic(site, rowCount);
    }
}


function addSiteGraphic(site, index){
    const table = document.getElementById("blockedTable");

    // Create an empty <tr> element and add it to the 1st position of the table:
    const row = table.insertRow(0);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);

    // Add some text to the new cells:
    cell1.innerHTML = index;
    cell2.innerHTML = site;
    if (!withinSchedule()){
        cell3.innerHTML = "<button type=\"button\" id=\"removeSite" + index + "\">Remove</button>";
        document.getElementById("removeSite" + index).addEventListener("click", removeSite(index));
    }
}


function removeSite(index){
    // Remove it from table
    const site = document.getElementById("blockedTable").rows[index-1].cells[1].innerHTML;

    // Remove from internal list
    blocked.delete(site);

    table.deleteRow(index-1);

    // Remove from local storage
    saveSites();
}

function saveSites(){ // this needs work
    localStorage.clear();
    if (scheduleLower && scheduleUpper){
        localStorage.setItem("lowerBound", scheduleLower);
        localStorage.setItem("upperBound", scheduleUpper);
    }

    if (blocked.length != 0){
        localStorage.setItem("count", rowCount);
        const rows = document.getElementById("blockedTable").rows;
        for (let i = 0; i < rows.length; i++) {
            rows[i].cells[0].innerHTML = i+1;
            localStorage.setItem("site"+i+1, rows[i].cells[1].innerHTML);
        }
    }
}


function setSchedule(){
    const lowerBound = document.getElementById("lowerBound").value;
    const upperBound = document.getElementById("upperBound").value;
    if (lowerBound && upperBound){
        // Set internal variables
        scheduleLower = lowerBound;
        scheduleUpper = upperBound;

        // Add to local storage
        localStorage.setItem("lowerBound", scheduleLower);
        localStorage.setItem("upperBound", scheduleUpper);

        // update current schedule
        document.getElementById("currentSchedule").innerHTML = scheduleLower + " to " + scheduleUpper;
    }
    update();
}


function withinSchedule(){
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
        if (blocked.includes(url) && withinSchedule()){
            console.log("blocked site");
            chrome.tabs.remove(
                tabs[0].id,
            ).catch(function(e){console.log(e)});
        }
    });
}


function update(){

    const schedule = document.getElementById("setSchedule");
    const tableRows = document.getElementById("blockedTable").rows;

    if (!withinSchedule()){

        schedule.innerHTML = "<input type=\"time\" id=\"lowerBound\">"
        + "<input type=\"time\" id=\"upperBound\">"
        + "<button id=\"scheduleButton\">Set Schedule</button>";

        document.getElementById("scheduleButton").addEventListener("click", setSchedule);


        // Replace nothing with removal button
        for (let i = 0; i < tableRows.length; i++){
            tableRows[i].cells[2].innerHTML = "<button type=\"button\" id=\"removeSite" + i+1 + "\">Remove</button>";
            document.getElementById("removeSite" + i+1).addEventListener("click", removeSite(i+1));
        }

    } else {

        schedule.innerHTML = "You cannot edit your schedule whilst it is active";

        // Replace removal button from each row with nothing
        for (let i = 0; i < tableRows.length; i++){
            tableRows[i].cells[2].innerHTML = "";
        }

    }
    
}

/*
Feature Idea: Only unlocks when a code sent to phone is entered. Could pair up with brick to have extra reinforced discipline.

*/
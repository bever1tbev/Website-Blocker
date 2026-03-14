let blocked = new Set();
let scheduleUpper;
let scheduleLower;
let initialised = false;

window.addEventListener('popstate', function (event) {
    if (!initialised) initialise(); 
	// The URL changed...
    checkCurrentSite();
});

function addSite(){
    // Checks if URL is valid
    const site = document.getElementById("siteName").value;
    try {
        url = new URL(site);
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
        blocked.add(site);
        localStorage.setItem("site" + (table.rows.length+1), site);
        localStorage.setItem("count", (table.rows.length+1));

        // Add it to table
        addSiteGraphic(site);
    }
}

function addSiteGraphic(site){
    let table = document.getElementById("blockedTable");

    // Create an empty <tr> element and add it to the 1st position of the table:
    let row = table.insertRow(0);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);

    // Add some text to the new cells:
    cell1.innerHTML = site;
    cell2.innerHTML = "<button type=\"button\" onclick=\"removeSite('" + site + "')\">Remove</button>";
}

function removeSite(site){
    // Remove from internal list
    blocked.remove(site);

    // Remove it from table
    let table = document.getElementById("blockedTable");
    for (let i = 0; i < tableRows.length; i++){
        if (table.rows[i].cells[0].innerHTML === site){
            table.deleteRow(i);
            break;
        }
    }

    // Remove from local storage
    saveSites();
}

function setSchedule(){
    // Set internal variables
    scheduleLower = document.getElementById("lowerBound").value;
    scheduleUpper = document.getElementById("upperBound").value;

    // Add to local storage
    localStorage.setItem("lowerBound", scheduleLower);
    localStorage.setItem("upperBound", scheduleUpper);

    // update current schedule
    const schedule = "<h4>" + scheduleLower + " to " + scheduleUpper + "</h4>";
    document.getElementById("currentSchedule").innerHTML = schedule;
}

function withinSchedule(){
    return Date.now() >= scheduleLower && Date.now() <= scheduleUpper;
}

function checkCurrentSite(){
    const currentSite = window.location.href;
    if (blocked.includes(currentSite) && withinSchedule()){
        // Pop up saying you've blocked the website
        alert("You have blocked the following site");

        // Go back
        history.back();
    }
}

function update(){

    let schedule = document.getElementById("setSchedule");
    let tableRows = document.getElementById("blockedTable").rows;

    if (!withinSchedule()){

        schedule.innerHTML = "<input type=\"time\" id=\"lowerBound\" required>"
        + "<input type=\"time\" id=\"upperBound\" required>"
        + "<button onclick=\"setSchedule()\">Set Schedule</button>";

        // Replace nothing with removal button
        for (let i = 0; i < tableRows.length; i++){
            tableRows[i].cells[1].innerHTML = "<button type=\"button\" onclick=\"removeSite('" + tableRows[i].cells[0].innerHTML + "')\">Remove</button>";;
        }

    } else {

        schedule.innerHTML = "You cannot edit your schedule whilst it is active";

        // Replace removal button from each row with nothing
        for (let i = 0; i < tableRows.length; i++){
            tableRows[i].cells[1].innerHTML = "";
        }

    }
    
}

function initialise(){
    scheduleLower = localStorage.getItem("lowerBound");
    scheduleUpper = localStorage.getItem("upperBound");
    const rowCount = localStorage.getItem("count");
    let site;
    if (rowCount){
        for (let i = rowCount; i > 0; i--){
            site = localStorage.getItem("site" + i);
            blocked.add(site);
            // Add it to table
            addSiteGraphic(site);
        }
    }
    update();
    initialised = true;
}

function saveSites(){
    localStorage.clear();
    localStorage.setItem("lowerBound", scheduleLower);
    localStorage.setItem("upperBound", scheduleUpper);

    if (blocked.size != 0){
        localStorage.setItem("count", blocked.size);
        const blockedArr = Array.from(blocked);
        for (let i = 1; i < blockedArr.length+1; i++) {
            localStorage.setItem("site"+i, blockedArr[i-1]);
        }
    }
}

/*
Feature Idea: Only unlocks when a code sent to phone is entered. Could pair up with brick to have extra reinforced discipline.

*/
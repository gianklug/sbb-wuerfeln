//Get Query Parameters
const queryString = window.location.search;
//Create URLSearchParams Object
const urlParams = new URLSearchParams(queryString);
//Timer Object for animation
const timer = ms => new Promise(res => setTimeout(res, ms))

//Leading Zeroes for Time
function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

//Redirect to next connection
function nextConnection() {
    window.open("https://sbb.gk.wtf?destination="+document.getElementById("station").innerHTML);
}

//Hide everything on load
$( ".connection" ).hide();
$( ".other" ).hide();
$( ".time" ).hide();

//If destination is set
if (urlParams.get("destination") !== null) {
    //Set Search box Value to Destination
    document.getElementById("search").value  = urlParams.get("destination");

    if(urlParams.get("filter")=="long") { document.getElementById("long-distance").checked = true; }
    //New Request
    var xhttp = new XMLHttpRequest();
    //On Request Done
    xhttp.onreadystatechange = function() {
        //On Request Successful
        if (this.readyState == 4 && this.status == 200) {
        //Parse the Response
        var stationboard = JSON.parse(xhttp.responseText).stationboard;
        //Empty List for Platforms
        var platforms = { };
        //Defining Currentplatform 
        var currentPlatform = 0;
        //Defining List with all Platform numbers
        var numPlatforms = [];
        //Loop through the Stationboard
        for (x in stationboard) {
            //Log the current Platform cuz it's funny
            console.log("Pl. "+currentPlatform);

            //Train is added by default
            addTrain=true;

            //Shit train filter
            //Get "Long PArameter"
            if (urlParams.get("filter")=="long"){
                //Check if not a shit train
                if (stationboard[x]["category"]!=="S" && stationboard[x]["category"]!=="R" && stationboard[x]["category"]!=="RE" && stationboard[x]["category"]!=="TER") {
                    console.log("Nice Train ("+stationboard[x]["category"]+")")
                }else {
                    //Don't Add the Shit train
                    console.log("Shit train ("+stationboard[x]["category"]+")")
                    addTrain=false;
                }
            }
            
            //Get the Current Platform
            currentPlatform = parseInt(stationboard[x]["stop"]["platform"]);
            //Ignore Trams and Stuff
            if (String(currentPlatform)!="NaN" && !addTrain == false){
            //If Key for Platform doesn't exist in Platforms Array
            if (!platforms.hasOwnProperty(currentPlatform))  {
                //Create Sub-Array for the current Platform
                platforms[currentPlatform] = new Array();
                numPlatforms.push(currentPlatform);
            }

            //Add the current Connection info to the platform info for the current platform
            platforms[currentPlatform].push(stationboard[x]);
        }
        }
        //Log all Platforms
        console.log("All Platforms \n"+numPlatforms);
        //Select a random platform
        var randomPlatform = numPlatforms[Math.floor(Math.random()*numPlatforms.length)];
        //Get all Stations for this Platform
        var stations = platforms[randomPlatform][0]["passList"];
        //Select a random station
        var stationNumber = Math.floor(Math.random()*stations.length);
        //If station==0 (means Start) set it to the next stop
        if (stationNumber==0) {stationNumber=1};
        //Select the random station from the stations list
        var randomStation = stations[stationNumber];
        //Console log stuff because I like logs
        console.log("Random Platform: "+randomPlatform);
        console.log("Random Station: "+stationNumber);
        console.log("Station Stats:");
        console.log(randomStation);
        console.log("Platform Stats:");
        console.log(platforms);
        //If no arrival (Tunnel or stuff) ignore and select the last stop
        if (String(randomStation["arrival"]) == "null") { randomStation = stations[stations.length-1];}
        //Get the coordinates for future geofencing
        var coordinates = randomStation["location"]["coordinate"]["x"]+","+randomStation["location"]["coordinate"]["y"];
        //Log the fancy pair of coordinates
        console.log("Coordinates of Destination: "+coordinates);
        //Set the arrival as Date Object
        var arrival = new Date(randomStation["arrival"]);
        //Set the departure as date object
        var departure = new Date(platforms[randomPlatform][0]["stop"]["departure"]);
        //Calculate the Difference
        var timediff = new Date(arrival-departure);
        //Weird async function magic
        async function animate () { 
            //Loop through all Platforms
            for (x in numPlatforms) {
                //Display stuff
                document.getElementById("destination").innerHTML =platforms[numPlatforms[x]][0]["to"];
                document.getElementById("train_type").innerHTML =platforms[numPlatforms[x]][0]["category"]+" "+platforms[numPlatforms[x]][0]["number"];
                document.getElementById("platform").innerHTML =numPlatforms[x];
                //Delay
                await timer(150);
            }
            //Set the final connection values
            document.getElementById("platform").innerHTML =randomPlatform;
            document.getElementById("destination").innerHTML =platforms[randomPlatform][0]["to"];
            document.getElementById("train_type").innerHTML =platforms[randomPlatform][0]["category"]+" "+platforms[randomPlatform][0]["number"];
            document.getElementById("departure").innerHTML = pad(departure.getHours(),2)+":"+pad(departure.getMinutes(), 2);
            document.getElementById("arrival").innerHTML = pad(arrival.getHours(),2)+":"+pad(arrival.getMinutes(), 2);
            document.getElementById("station").innerHTML = randomStation["station"]["name"];
            console.log(timediff);
            //-1h correction because idk
            document.getElementById("duration").innerHTML = timediff.getHours()-1+"h "+timediff.getMinutes()+"min";
            //Fade other info in
            $( ".other" ).fadeIn();
            $( ".time" ).fadeIn();
        }
        //Display the connection uhh idk why this is here
        $( ".connection" ).fadeIn();
        //Play the animation
        animate();
        }
    };
    //Get the url
    xhttp.open("GET", "https://transport.opendata.ch/v1/stationboard?station="+urlParams.get("destination")+"&limit=49", true);
    //Send the Request
    xhttp.send();
}


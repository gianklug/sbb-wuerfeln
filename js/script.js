const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const timer = ms => new Promise(res => setTimeout(res, ms))

//Leading Zeroes for Time
function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}


function nextConnection() {
    window.open("https://sbb.gk.wtf?destination="+document.getElementById("station").innerHTML);
}
$( ".connection" ).hide();
$( ".other" ).hide();
$( ".time" ).hide();
if (urlParams.get("destination") !== null) {
    document.getElementById("search").value  = urlParams.get("destination");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        var stationboard = JSON.parse(xhttp.responseText).stationboard;
        var platforms = { };
        var currentPlatform = 0;
        var numPlatforms = [];
        for (x in stationboard) {
            
            currentPlatform = parseInt(stationboard[x]["stop"]["platform"]);
            //Ignore Trams and Stuff
            if (String(currentPlatform)!="NaN"){
            if (!platforms.hasOwnProperty(currentPlatform))  {
                platforms[currentPlatform] = new Array();
                numPlatforms.push(currentPlatform);
            }
            console.log(currentPlatform);
            platforms[currentPlatform].push(stationboard[x]);
        }
        }
        console.log(numPlatforms);
        var randomPlatform = numPlatforms[Math.floor(Math.random()*numPlatforms.length)];
        var stations = platforms[randomPlatform][0]["passList"];
        var stationNumber = Math.floor(Math.random()*stations.length);
        if (stationNumber==0) {stationNumber=1};
        var randomStation = stations[stationNumber];
        if (String(randomStation["arrival"]) == "null") { randomStation = stations[stations.length]; }
        var coordinates = randomStation["location"]["coordinate"]["x"]+","+randomStation["location"]["coordinate"]["y"];
        console.log(coordinates);
        var arrival = new Date(randomStation["arrival"]);
        var departure = new Date(platforms[randomPlatform][0]["stop"]["departure"]);
        var timediff = new Date(arrival-departure);
        async function animate () { 
            for (x in numPlatforms) {
                document.getElementById("destination").innerHTML =platforms[numPlatforms[x]][0]["to"];
                document.getElementById("train_type").innerHTML =platforms[numPlatforms[x]][0]["category"]+" "+platforms[numPlatforms[x]][0]["number"];
                document.getElementById("platform").innerHTML =numPlatforms[x];
                await timer(150);
            }

            document.getElementById("platform").innerHTML =randomPlatform;
            document.getElementById("destination").innerHTML =platforms[randomPlatform][0]["to"];
            document.getElementById("train_type").innerHTML =platforms[randomPlatform][0]["category"]+" "+platforms[randomPlatform][0]["number"];

            document.getElementById("departure").innerHTML = pad(departure.getHours(),2)+":"+pad(departure.getMinutes(), 2);
            document.getElementById("arrival").innerHTML = pad(arrival.getHours(),2)+":"+pad(arrival.getMinutes(), 2);
            document.getElementById("station").innerHTML = randomStation["station"]["name"];
            console.log(timediff);
            document.getElementById("duration").innerHTML = timediff.getHours()-1+"h "+timediff.getMinutes()+"min";
            $( ".other" ).fadeIn();
            $( ".time" ).fadeIn();
        }
        $( ".connection" ).fadeIn();
        animate();

        console.log("RANDOM STATION");
        console.log(randomStation["station"]["name"]);
        console.log(platforms[randomPlatform]);
        console.log(platforms);
        }
    };
    xhttp.open("GET", "https://transport.opendata.ch/v1/stationboard?station="+urlParams.get("destination")+"&limit=49", true);
    xhttp.send();
}


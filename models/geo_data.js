fs = require('fs');
var waypoints;
var distances;
var cumulativeDistances;
var totalDistance = 0;
var minLon, maxLon, minLat, maxLat;

function init() {
  fs.readFile('waypoints.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    initData(data);
  });
}

function getFootprint() {
  return [minLat, minLon, maxLat, maxLon];
}

function getPosition(time, velocity) {
  if(!distances){
    return null;
  }

  //if we are at time 0, the drone is at the first waypoint
  if(time===0) {
    return waypoints[0];
  }

  var distance = time*velocity;
  //if the distance is greater than the path distance, we're at the last waypoint
  if(distance>=totalDistance) {
    return waypoints[distances.length];
  }

  var index = 0;
  //iterate until we get to the index of the next waypoint beyond the current location
  while(distance>cumulativeDistances[index]) {
    index++;
  }
  index -=1;

  //now find the fraction of the way along this segment we're at
  var fraction = (distance - cumulativeDistances[index])/distances[index];

  //assume waypoints are near enough that linear interpolation in lat/lon coords is safe.
  var lat = lerp(waypoints[index][0], waypoints[index+1][0], fraction);
  var lon = lerp(waypoints[index][1], waypoints[index+1][1], fraction);

  return [lat, lon];

}

var lerp = function(a, b, f) {
    return a + f * (b - a);
};

var initData = function(data) {
  waypoints = JSON.parse(data);
  distances = [];
  cumulativeDistances = [];
  cumulativeDistances.push(0);

  //initialize footprint values to the first point
  minLat = waypoints[0][0];
  maxLat = waypoints[0][0];
  minLon = waypoints[0][1];
  maxLon = waypoints[0][1];
  for(var i=0; i<waypoints.length-1; i++) {
    var distance = haversine(waypoints[i], waypoints[i+1]);
    distances.push(distance);
    totalDistance += distance;
    cumulativeDistances.push(totalDistance);
    testFootprint(waypoints[i+1]);
  }
};

var testFootprint = function(point) {
  if(point[0]<minLat) {
    minLat = point[0];
  }
  if(point[0]>maxLat) {
    maxLat = point[0];
  }
  if(point[1]<minLon) {
    minLon = point[1];
  }
  if(point[1]>maxLon) {
    maxLon = point[1];
  }
};

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

//via http://www.movable-type.co.uk/scripts/latlong.html
var haversine = function(coord1, coord2) {
  var lat1 = coord1[0];
  var lon1 = coord1[1];
  var lat2 = coord2[0];
  var lon2 = coord2[1];
  var R = 6371000; // metres
  var φ1 = lat1.toRadians();
  var φ2 = lat2.toRadians();
  var Δφ = (lat2-lat1).toRadians();
  var Δλ = (lon2-lon1).toRadians();

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = R * c;

  return d;
};

module.exports.init = init;
module.exports.getPosition = getPosition;
module.exports.getFootprint = getFootprint;

var time = 0;
var TIME_DELTA = 0.1;
var TIME_DELTA_MS = TIME_DELTA*1000;
var timer = null;

var velocity = 10;
var position = {latitude:0, longitude:0};

var statuses = {
  RESET : 'reset',
  PAUSED : 'paused',
  FLYING : 'flying'
};

var drone_status = statuses.RESET;
var tick_callback;
var geo_data;

function init(geo, callback) {
  tick_callback = callback;
  geo_data = geo;
}

function setDroneStatus(value) {
  if(value.toUpperCase() in statuses) {
    if(drone_status!=statuses.FLYING && value===statuses.FLYING) {
      startFlightTimer();
    }
    if(value!==statuses.FLYING) {
      stopFlightTimer();
    }
    if(value===statuses.RESET) {
      time = 0;
      var data = {time:time, distance: time*velocity, position: geo_data.getPosition(time, velocity)};
      tick_callback(data);
    }
    drone_status = value;
  } else {
    console.log('Illegal status value: ', value);
    throw 'Illegal status value: ' + value;
  }
}

var timerTick = function() {
  time += TIME_DELTA;
  var data = {time:time, distance: time*velocity, position: geo_data.getPosition(time, velocity)};
  tick_callback(data);
};

var startFlightTimer = function() {
  timer = setInterval(timerTick, TIME_DELTA_MS);
};
var stopFlightTimer = function() {
  clearInterval(timer);
};


module.exports.init = init;
module.exports.setDroneStatus = setDroneStatus;

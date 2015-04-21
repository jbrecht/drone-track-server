var geo_data = require('./geo_data');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = 1337;

http.listen(port, function () {
  var host = http.address().address;
  var port = http.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

geo_data.init();

var _ = require('underscore');
var url = require('url');

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

var setDroneStatus = function(value) {
  if(value.toUpperCase() in statuses) {
    if(value===statuses.RESET) {
      time = 0;
      var data = {time:time, distance: time*velocity, position: geo_data.getPosition(time, velocity)};
      io.emit('timer_tick', data);
    }
    if(drone_status!=statuses.FLYING && value===statuses.FLYING) {
      startFlightTimer();
    }
    if(value!==statuses.FLYING) {
      stopFlightTimer();
    }
    drone_status = value;
    socket.emit('status', { status: drone_status });
  } else {
    throw 'Illegal status value';
  }
};

var timerTick = function() {
  time += TIME_DELTA;
  var data = {time:time, distance: time*velocity, position: geo_data.getPosition(time, velocity)};
  io.emit('timer_tick', data);
};

var startFlightTimer = function() {
  timer = setInterval(timerTick, TIME_DELTA_MS);
};
var stopFlightTimer = function() {
  clearInterval(timer);
};

io.on('connection', function (socket) {
  socket.emit('footprint', {footprint: geo_data.getFootprint()});
  socket.on('status_update', function (data) {
    try {
      console.log('attempt to set status to: ', data);
      setDroneStatus(data);
    } catch (error) {

    }
  });
});

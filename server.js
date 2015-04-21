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
var TIME_DELTA = 1;
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
  console.log(data);
  io.emit('timer_tick', data);
};

var startFlightTimer = function() {
  timer = setInterval(timerTick, TIME_DELTA_MS);
};
var stopFlightTimer = function() {
  clearInterval(timer);
};

io.on('connection', function (socket) {
  socket.emit('status', { status: drone_status });
  socket.on('status_update', function (data) {
    try {
      console.log('attempt to set status to: ', data);
      setDroneStatus(data);
    } catch (error) {

    }
  });
  socket.on('footprint', function (data) {
    console.log('footprint: ', geo_data.getFootprint());
  });
  socket.on('timer_tick', function (data) {
    console.log('timer tick: ', data);
  });
});

/*
app.get('/', function (req, res) {
  res.send('Drone track is ready.');
});

app.get('/status', function (req, res) {
  res.send(drone_status);
});

app.put('/status', function (req, res) {
  var url_parts = url.parse(req.url, true);
  var query = _.keys(url_parts.query)[0];
  var response = '';
  try {
    setDroneStatus(statuses[query]);
    res.send('Drone status updated: ' + drone_status);
  } catch (error) {
    res.send('Drone status not updated: ' + error);
  }

});*/


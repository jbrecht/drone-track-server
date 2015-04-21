var geo_data = require('./models/geo_data');
var drone_ctrl = require('./controllers/drone_ctrl');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = 1337;

http.listen(port, function () {
  var host = http.address().address;
  var port = http.address().port;
  console.log('drone-track-server listening at http://%s:%s', host, port);
});

geo_data.init();
drone_ctrl.init(geo_data, function tick(data) {
  io.emit('timer_tick', data);
});

io.on('connection', function (socket) {
  socket.emit('footprint', {footprint: geo_data.getFootprint()});
  socket.on('status_update', function (data) {
    try {
      drone_ctrl.setDroneStatus(data);
    } catch (error) {
      socket.emit('error', {message: 'Illegal drone status: ' + data});
    }
  });
});

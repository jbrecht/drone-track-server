var drone_ctrl = require("../controllers/drone_ctrl");

describe("drone_ctrl", function () {
  beforeEach(function() {
    drone_ctrl.init();
  });

  it("should throw an error for illegal status value BLAH", function () {
    expect(function() {
            drone_ctrl.setDroneStatus('BLAH');
        }).toThrow();
  });

});

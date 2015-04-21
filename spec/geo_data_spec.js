var geo_data = require("../models/geo_data");

describe("geo_data", function () {
  beforeEach(function() {
    runs(function () {
      geo_data.init();
    });

    waitsFor(function () {
      return geo_data.getPosition(0,0);
    });
  });

  it("should get position [37.77906506406423,-122.39044204830788] for time 0", function () {
    var result = geo_data.getPosition(0, 10);
    expect(result).toEqual([37.77906506406423,-122.39044204830788]);
  });

  it("should get position [37.77830003038268,-122.388043832063] for time 9999999", function () {
    var result = geo_data.getPosition(9999999, 10);
    expect(result).toEqual([37.77830003038268,-122.388043832063]);
  });


});

const Dot = require("./main.js");

test('should calculate distance properly', () => {
  const pointA = new Dot(0, 0);
  const pointB = new Dot(3, 4)
  const result = pointA.distance_to(pointB);
  expect(result).toBe(5);
});

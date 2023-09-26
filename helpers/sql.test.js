
const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");


describe("sqlForPartialUpdate", function () {
  test("testing 0 items", function () {
    expect(() => { sqlForPartialUpdate({}, {}); }).toThrow("No data");
  });
  test("testing 1 item", function () {
    const result = sqlForPartialUpdate(
      { firstName: "First" },
      { firstName: "first_name", lastName: "last_name" });
    expect(result).toEqual({
      setCols: "\"first_name\"=$1",
      values: ["First"],
    });
  });

  test("testing 2 items", function () {
    const result = sqlForPartialUpdate(
      { firstName: "First", lastName: "Last" },
      { lastName: "last_name" });
    expect(result).toEqual({
      setCols: "\"firstName\"=$1, \"last_name\"=$2",
      values: ["First", "Last"],
    });
  });
});

const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/**
 * Helper function for UPDATE queries with variable amount of SET values
 * 
 * @param {*} dataToUpdate {Object} {col1: val1, col2: val2, ...}
 * @param {*} jsToSql {Object} for different names used in database ie. {firstName: "first_name"}
 * @returns {Object} {setCols, values} ie. {setCols: '"first_name"=$1, "last_name"=$2', values: {Michael, Smith}}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql = {}) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

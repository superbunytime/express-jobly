"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/**************create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 1,
    equity: "0.1",
    companyHandle: "c1"
  };
  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number)
    });
  });
});

/**find all */
describe("find all", function () {
  test("works no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "j1",
        salary: 1,
        equity: "0.1",
        companyHandle: "c1"
      },
      {
        id: testJobIds[1],
        title: "j1b",
        salary: 2,
        equity: "0.2",
        companyHandle: "c1"
      },
      {
        id: testJobIds[2],
        title: "j3",
        salary: 3,
        equity: null,
        companyHandle: "c3"
      },
    ]);
  });

  test("works filter title", async function () {
    let jobs = await Job.findAll({ title: 'j1' });
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "j1",
        salary: 1,
        equity: "0.1",
        companyHandle: "c1"
      },
      {
        id: testJobIds[1],
        title: "j1b",
        salary: 2,
        equity: "0.2",
        companyHandle: "c1"
      }
    ]);
  });

  test("works filter salary", async function () {
    let jobs = await Job.findAll({ minSalary: 3 });
    expect(jobs).toEqual([
      {
        id: testJobIds[2],
        title: "j3",
        salary: 3,
        equity: null,
        companyHandle: "c3"
      },
    ]);
  });

  test("works filter hasEquity", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "j1",
        salary: 1,
        equity: "0.1",
        companyHandle: "c1"
      },
      {
        id: testJobIds[1],
        title: "j1b",
        salary: 2,
        equity: "0.2",
        companyHandle: "c1"
      }
    ]);
  });

  test("works multi filter (salary + hasEquity)", async function () {
    let jobs = await Job.findAll({ hasEquity: true, minSalary: 2 });
    expect(jobs).toEqual([
      {
        id: testJobIds[1],
        title: "j1b",
        salary: 2,
        equity: "0.2",
        companyHandle: "c1"
      }
    ]);
  });

});

/**get */
describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "j1",
      salary: 1,
      equity: "0.1",
      companyHandle: "c1"
    },);
  });

  test("invalid id", async function () {
    try {
      await Job.get(-1);
    }
    catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});

/**update */
describe("update", function () {
  const updateData = {
    title: "update",
    salary: 123,
    equity: null
  };

  test("works", async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
      id: testJobIds[0],
      companyHandle: "c1",
      ...updateData
    },);
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs
      WHERE id=$1 `,
      [testJobIds[0]]
    );
    expect(result.rows[0]).toEqual({
      id: testJobIds[0],
      companyHandle: "c1",
      ...updateData
    },);
  });

  test("job not found", async function () {
    try {
      let job = await Job.update(-1, updateData);
    }
    catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("missing data", async function () {
    try {
      await Job.update(testJobIds[0], {});
    }
    catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/**delete */
describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query(
      `SELECT id
      FROM jobs
      WHERE id=$1`,
      [testJobIds[0]]
    );
    expect(res.rows.length).toEqual(0);
  });

  test("invalid id", async function () {
    try {
      await Job.remove(-1);
    }
    catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});
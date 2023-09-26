"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/**POST /jobs */

describe("POST /jobs", function () {
  const testJob = {
    title: "test",
    salary: 11,
    equity: 0.1,
    companyHandle: "c1"
  };
  test("ok for admins", async function () {
    const resp = await request(app)
      .post('/jobs')
      .send(testJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        ...testJob,
        id: expect.any(Number),
        equity: "0.1"
      }
    });
  });

  test("unauthorized for users", async function () {
    const resp = await request(app)
      .post('/jobs')
      .send(testJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for anon", async function () {
    const resp = await request(app)
      .post('/jobs')
      .send(testJob);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad req with missing data", async function () {
    const resp = await request(app)
      .post('/jobs')
      .send({})
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
  test("bad req with invalid data", async function () {
    const resp = await request(app)
      .post('/jobs')
      .send({ ...testJob, salary: "11" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

});

/**GET /jobs */
describe("GET /jobs", function () {
  test("works for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual(
      {
        jobs: [
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
            salary: 11,
            equity: null,
            companyHandle: "c1"
          },
          {
            id: testJobIds[2],
            title: "j2",
            salary: 2,
            equity: "0.2",
            companyHandle: "c2"
          },
        ]
      }
    );
  });

  test("works with filters", async function () {
    const resp = await request(app).get("/jobs").query({ hasEquity: "true", minSalary: "1", name: "j" });
    expect(resp.body).toEqual(
      {
        jobs: [
          {
            id: testJobIds[0],
            title: "j1",
            salary: 1,
            equity: "0.1",
            companyHandle: "c1"
          },
          {
            id: testJobIds[2],
            title: "j2",
            salary: 2,
            equity: "0.2",
            companyHandle: "c2"
          },
        ]
      }
    );
  });
});

/**GET /job/:id */
describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job:
      {
        id: testJobIds[0],
        title: "j1",
        salary: 1,
        equity: "0.1",
        companyHandle: "c1"
      }
    }
    );
  });

  test("not found for invalid id", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job:
      {
        id: testJobIds[0],
        title: "j1",
        salary: 1,
        equity: "0.1",
        companyHandle: "c1"
      }
    }
    );
  });

});

/**PATCH /job/:id */
describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app).patch(`/jobs/${testJobIds[0]}`).send({
      title: "PATCHED"
    }).set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job:
      {
        id: testJobIds[0],
        title: "PATCHED",
        salary: 1,
        equity: "0.1",
        companyHandle: "c1"
      }
    }
    );
  });

  test("unauth for users", async function () {
    const resp = await request(app).patch(`/jobs/${testJobIds[0]}`).send({
      title: "PATCHED"
    }).set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/jobs/${testJobIds[0]}`).send({
      title: "PATCHED"
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("badreq for invalid data", async function () {
    const resp = await request(app).patch(`/jobs/${testJobIds[0]}`).send({
      salary: "111"
    }).set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("badreq for changing handle", async function () {
    const resp = await request(app).patch(`/jobs/${testJobIds[0]}`).send({
      companyHandle: "PATCHED"
    }).set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("not found on non-existent job", async function () {
    const resp = await request(app).patch(`/jobs/0`).send({
      companyHandle: "PATCHED"
    }).set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/**DELETE /job/:id */
describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app).delete(`/jobs/${testJobIds[0]}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      deleted: testJobIds[0].toString()
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app).delete(`/jobs/${testJobIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/${testJobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on non-existent job", async function () {
    const resp = await request(app).delete(`/jobs/0`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = express.Router();


/** POST / { job }  => { job }
 *
 * Adds a new job
 *
 * This returns the newly created job:
 *  { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { jobs: [ {id, title, salary, equity, companyHandle }, ... ] }
 *
 * Returns list of all jobs.
 *
 * Authorization required: none
 **/

router.get("/", async function (req, res, next) {
  try {
    let filters = req.query;
    if (filters.minSalary) filters.minSalary = +filters.minSalary;
    if (filters.hasEquity) filters.hasEquity = (filters.hasEquity.toLowerCase() == "true");
    const jobs = await Job.findAll(filters);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});


/** GET /[id] => {id, title, salary, equity, companyHandle}
 *
 * Returns job.
 *
 * Authorization required: none
 **/

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] {fld1, fld2, ... }=> {id, title, salary, equity, companyHandle}
 *
 * Patches a job
 *
 * Fields can be: {title, salary, equity}
 * 
 * Returns {id, title, salary, equity, companyHandle}
 * 
 * Authorization required: admin
 **/

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id] => {deleted: id}
 *
 * Deletes a job
 * 
 * Authorization required: admin
 **/

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const job = await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Poject = require("../../models/Projects");
const User = require("../../models/user");

// @route    Post api/project
// @desc     Create a project
// @access   Private
router.post(
  "/",
  [
    auth,
    [
      check("name", "Project name is required").not().isEmpty(),
      check(
        "developmentPercentage",
        "Your contribution percentage in development phase is required"
      )
        .not()
        .isEmpty(),
      // check("description", "Task description is required").not().isEmpty(),
      // check("taskPercentage", "Task percentage is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const config = {};
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, developmentPercentage } = req.body;
      const projectFields = {};

      projectFields.user = req.user.ud;
      projectFields.name = name;
      projectFields.developmentPercentage = developmentPercentage;

      const project = new Poject(projectFields);
      await project.save();
      res.json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;

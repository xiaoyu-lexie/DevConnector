const exporess = require("express");
const router = exporess.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const cloudinary = require("../../config/cloudinary");

const User = require("../../models/user");

// user register
router.post(
  "/",
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Please include a valid Email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // console.log("errors", errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // or .json({ errors: errors.errors })
    }

    const { name, email, password } = req.body;

    try {
      //See if user exists
      let user = await User.findOne({ email: email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      // //Get users gravatar
      // const avatar = gravatar.url(email, {
      //   s: "200",
      //   r: "pg",
      //   d: "mm",
      // });

      user = new User({
        name,
        email,
        avatar:
          "https://www.gravatar.com/avatar/ed0d3a512227965410059d3660bcc566?s=200&r=pg&d=mm",
        password,
      });

      //Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (error, token) => {
          if (error) throw error;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error("error", err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;

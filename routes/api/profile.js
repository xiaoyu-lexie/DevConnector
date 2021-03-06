const exporess = require("express");
const axios = require("axios");
const config = require("config");
const router = exporess.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const cloudinary = require("../../config/cloudinary");

const Profile = require("../../models/Profile");
// the models/user is a small typo, but not influence running
const user = require("../../models/user");
const Post = require("../../models/Posts");

// @route    GET api/profile/me
// @desc     Get current user profile
// @access   Private
router.get("/me", auth, async (req, res) => {
  try {
    // populate is similar to SQL left join
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  "/",
  // this route needs 2 types of check: auth check(whether has a valid token in the header), and express-validator check
  [
    auth,
    [
      // to check the status is not empty
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request
    const {
      avatar,
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
      // for education and experience, we will have another routes or endpoints to create these stuff
      ...rest
    } = req.body;

    try {
      // check if avatar is newly uploaded or not
      if (avatar !== "") {
        // deal with image

        const uploadedImage = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatar",
        });
        // const avatarURL = uploadedImage.url;
        // const updatedAvatar = avatarURL;

        const publicId = uploadedImage.public_id;

        const width = uploadedImage.width;

        EditedImageURL = await cloudinary.url(publicId, {
          aspect_ratio: "1:1",
          background: "#ffffff",
          border: "2px_solid_rgb:ffffff",
          gravity: "auto",
          radius: "max",
          width: width,
          crop: "fill",
        });

        await user.findOneAndUpdate(
          { _id: req.user.id },
          { avatar: EditedImageURL }
        );
      }

      //Build profile object
      const profileFields = {};

      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;
      if (skills) {
        // use regular expression would be better
        profileFields.skills = skills.split(",").map((skill) => skill.trim());
      }

      //Build social object
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (twitter) profileFields.social.twitter = twitter;
      if (facebook) profileFields.social.facebook = facebook;
      if (instagram) profileFields.social.instagram = instagram;
      if (linkedin) profileFields.social.linkedin = linkedin;

      let profile = await Profile.findOne({ user: req.user.id });

      // Upfate Profile
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      //Create a new Profile
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/profile
// @desc     GET all profiles
// @access   Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/profile/user/:user_id
// @desc     GET profile by user ID
// @access   Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    // this would run when we have a valid user_id(valid or invalid depends on length of user_id); But if we have invalid user_id, the previous line would lead to an error, which would be catched in IF statement of CATCH statement; here is to illustrate situation of valid userid, but cannot found profile
    if (!profile) {
      return res.status(500).json({ msg: "There is no matched profile found" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);

    // invalid user_id is catched here, and invalid user_id would lead to an error kind "ObjectId"
    if (err.kind === "ObjectId") {
      return res.status(500).json({ msg: "Invalid userID, Profile not found" });
    }

    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/profile/
// @desc     Delete profile, user & posts
// @access   Private
router.delete("/", auth, async (req, res) => {
  try {
    // Remove user posts
    await Post.deleteMany({ user: req.user.id });
    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/profile/experience
// @desc     add profile experience
// @access   Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     delete profile experience
// @access   Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/profile/education
// @desc     add profile education
// @access   Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study date is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     delete profile education
// @access   Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get("/github/:username", async (req, res) => {
  try {
    // const uri = encodeURI(
    //   `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    // );

    // const headers = {
    //   "user-agent": "node.js",
    //   Authorization: `token ${config.get("githubOauthToken")}`,
    // };

    const gitHubResponse = await axios.get(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );

    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: "No Github profile found" });
  }
});

module.exports = router;

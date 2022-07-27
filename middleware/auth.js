const jwt = require("jsonwebtoken");
const config = require("config");

// Before we want to run this function, we have to set up the 'x-auth-token' first (Line19-20 in auth action file); and the setting up 'x-auth-token' action happend in the front end
module.exports = function (req, res, next) {
  //Get token from header
  const token = req.header("x-auth-token");

  //Check if there is no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  //Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    // decoded = {
    //   user: { id: '62ba8d887b69b300ead4e0d3' },
    //   iat: 1658535240,
    //   exp: 1658895240
    // }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

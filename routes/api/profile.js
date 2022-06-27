const exporess = require('express');
const router = exporess.Router();

// get api/profile
router.get('/', (req, res) => {
  res.send('Profile route')
});

module.exports = router;
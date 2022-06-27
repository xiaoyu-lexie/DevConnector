const exporess = require('express');
const router = exporess.Router();

// get api/users
router.get('/', (req, res) => {
  res.send('User route')
});

module.exports = router;
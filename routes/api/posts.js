const exporess = require('express');
const router = exporess.Router();

// get api/posts
router.get('/', (req, res) => {
  res.send('Posts route')
});

module.exports = router;
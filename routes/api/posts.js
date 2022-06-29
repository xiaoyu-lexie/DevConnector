const exporess = require('express');
const router = exporess.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');
// the models/user is a small typo, but not influence running
const User = require('../../models/user');

// @route    Post api/posts
// @desc     Create a post
// @access   Private
router.post('/',[
  auth, [
    // some other information like avatar are got from token, not sent  with request body, however text is sent with request, so we check here
    check('text', 'Text is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  try {
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    })

    const post = await newPost.save();

    res.json(post);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }

});

// @route    Get api/posts
// @desc     get all posts
// @access   Private 也可以是public，但因为我们想让前端设计为 用户登陆后才能看到所有的posts，所以这里为private；注意和profiles区分，profiles是public的
router.get('/', auth, async (req, res) => {
  try {
    // sort order is most recent first
    const posts = await Post.find().sort({date: -1});
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

// @route    Get api/posts/:post_id
// @desc     get current user posts
// @access   Private
router.get('/:post_id', auth, async (req, res) => {
  try {
    const postId = req.params.post_id;
    // sort order is most recent first
    const post = await Post.findById(postId);

    // same with profile valid/invalid id
    if (!post) {
      return res.status(404).json({msg: 'Post not found'})
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({msg: 'Invalid post id. Post not found'})
    }

    res.status(500).send('Server Error');
  }
});

// @route    Get api/posts
// @desc     get all posts
// @access   Private 也可以是public，但因为我们想让前端设计为 用户登陆后才能看到所有的posts，所以这里为private；注意和profiles区分，profiles是public的
router.get('/', auth, async (req, res) => {
  try {
    // sort order is most recent first
    const posts = await Post.find().sort({date: -1});
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

// @route    Get api/posts/:post_id
// @desc     get a post by postid
// @access   Private
router.get('/:post_id', auth, async (req, res) => {
  try {
    const postId = req.params.post_id;
    const post = await Post.findById(postId);

    // same with profile valid/invalid id
    if (!post) {
      return res.status(404).json({msg: 'Post not found'})
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({msg: 'Invalid post id. Post not found'})
    }

    res.status(500).send('Server Error');
  }
})

// @route    DELETE api/posts/:post_id
// @desc     delete a post by postid
// @access   Private
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const postId = req.params.post_id;
    const post = await Post.findById(postId);

    // like the porevious one, check if the post does not exist(valid id)
    if(!post) {
      return res.status(404).json({msg: 'Post not found'})
    }

    // check if this post was created by this user; If yes, be able to delete, if not, not allowed to delete this post
    // post.user is objectId, req.user.id is string
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({msg: 'User not authorized'})
    }

    await post.remove();

    res.json({msg: 'Post removed'})

  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({msg: 'Invalid post id. Post not found'})
    }

    res.status(500).send('Server Error');
  }
});


// @route    PUT api/posts/like/:post_id
// @desc     like a post
// @access   Private
router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    // Check if the post has already been liked by this user
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({msg: 'Post already liked'})
    }

    post.likes.unshift({
      user: req.user.id
    });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route    PUT api/posts/unlike/:post_id
// @desc     unlike a post
// @access   Private
router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    // Check if the post has already been liked by this user
    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({msg: 'Post has not yet been liked'})
    }

    // Get remove index
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    Post api/posts/comment/:post_id
// @desc     Comment on a post
// @access   Private
router.post('/comment/:post_id',[
  auth, [
    // some other information like avatar are got from token, not sent  with request body, however text is sent with request, so we check here
    check('text', 'Text is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.post_id);

    const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    }

    post.comments.unshift(newComment);

   await post.save();

    res.json(post.comments);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }

});

// @route    Post api/posts/comment/:post_id/:comment_id
// @desc     delete a comment on a post
// @access   Private
router.delete('/comment/:post_id/:comment_id',  auth , async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    //Pull out comment
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);

    //Make sure commet exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist'});
    }

    // Check deleting comment user is same as creating comment user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({msg: 'User not authorized'})
    };

    // Get remove index
    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})



module.exports = router;
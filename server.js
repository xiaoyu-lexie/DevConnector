const express = require('express');
const connectDB = require('./config/db');

const usersRoute = require('./routes/api/users');
const authRoute = require('./routes/api/auth');
const profileRoute = require('./routes/api/profile');
const postsRoute = require('./routes/api/posts');

const app = express ();

//connct database
connectDB();

app.get('/', (req, res) => res.send('API Running'))

//Define Routes
app.use('/api/users', usersRoute)
app.use('/api/auth', authRoute)
app.use('/api/profile', profileRoute)
app.use('/api/posts', postsRoute)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
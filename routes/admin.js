const express = require('express');
const router = express.Router();
const data = require('../data');
const events = data.events;
const users = data.users;
const bcrypt = require("bcryptjs");
const {
  ObjectId
} = require('mongodb');



router.use("/", function (req, res, next) {
  if (req.session.authed && req.session.accesslevel > 2) {
    next();

  } else {
    res.sendStatus(403)
  }
});
router.get('/', async (req, res) => {
  res.render('admin/index');
  // res.render('userInfo')
});
router.get('/users', async (req, res) => {
  const userInfo = await users.getAllUsers();
  res.render('admin/users', {
    users: userInfo
  });
  // res.render('userInfo')
});
router.get('/users/:id', async (req, res) => {
  let id = req.params.id;
  id = id.toString();
  const userInfo = await users.getUser(id);
  res.render('admin/user', {
    user: userInfo
  });
  // res.render('userInfo')
});

router.get('/events', async (req, res) => {
  let allEvents = await events.getAllEvents(true);
  let cancreate = false;
  if (req.session.accesslevel >= 2) {
    cancreate = true;
  }

  res.render('events/multiple', {
    events: allEvents,
    cancreate: cancreate
  });

});
router.post('/users/update', async (req, res) => {
  let id = req.body.id;
  id = id.toString();
  let updateInfo = req.body;
  const userInfo = await users.updateUser(id, updateInfo);
  res.redirect('/admin/users/' + id + '?updated')
  // res.render('userInfo')
});
router.post('/users/delete', async (req, res) => {
  let id = req.params.id;
  id = id.toString();
  const userInfo = await users.deleteUser(id);
  res.redirect('admin/users')
  // res.render('userInfo')
});



module.exports = router;
const express = require('express');
const router = express.Router();
const data = require('../data');
const events = data.events;
const users = data.users;
const bcrypt = require("bcryptjs");
const {
  ObjectId
} = require('mongodb');



// router.use("/", function(req,res,next) {
//   if(req.session.name !== "AuthCookie"){
//     // res.status(403).render(error);
//     res.render('users/signin')
//   }
//   else{
//     next();
//   }
// });
router.get('/userpage', async (req, res) => {
  const userInfo = await users.getUser(req.session.ID);

  res.render('users/single', {
    events: userInfo.regdEvents,
    user: userInfo
  });
  // res.render('userInfo')
})

router.delete("/:id", async (req, res) => {
  const userId = req.params;
  userId = userId.toString()

  const delUser = await users.getUser(userId);

  if (!delUser)
    throw "The user doesnt exist";

  try {
    const deletedUser = await users.deleteUser(userId);
    res.status(200).json(deletedUser);
    // res.render(User with username delUser.loginID has been removed)
  } catch (e) {
    console.log(e);
    res.status(500);
    // res.render()
  }
});


router.post("/regevent", async (req, res) => {
  if (!req.session.authed) {
    res.redirect('/users/signin');

  }

  let eventId = req.body.eventId;
  // eventId = eventId.toString();
  const userId = req.session.ID;
  // const userId = "5de3eb58e025f58f90e311f2";
  try {
    const userEventInfo = await users.setUserFollowEvent(ObjectId(userId), eventId);
    res.redirect('/events/single/' + eventId)
    // res.render()
  } catch (e) {
    console.log(e);
    res.status(500);
    // res.render()
  }
});


router.post("/unregevent", async (req, res) => {
  let eventId = req.body.eventId.toString();
  //const userId = req.session._id;
  const userId = req.session.ID;
  try {
    const userEventInfo = await users.unsetUserFollowEvent(userId, eventId);
    res.redirect('/events/single/' + eventId)
  } catch (e) {
    console.log(e);
    res.status(500);
    // res.render()
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy();
  res.redirect('/');

});

router.get("/", async (req, res) => {
  if (!req.session.ID) {
    res.redirect('/users/signin');
    return;
  }

  const userInfo = await users.getUserUpcomming(req.session.ID);

  let cancreate = false;
  if (req.session.accesslevel >= 2) {
    cancreate = true;
  }


  res.render('users/multiple', {
    events: userInfo,
    cancreate: cancreate
  });

});



router.post('/', async (req, res) => {
  if (req.session.authed) {
    res.redirect('/');
    return;
  }

  userInfo = req.body;
  if (!userInfo)
    throw "Enter details "

  if (!userInfo.loginID || !userInfo.password)
    throw "Please enter Username and Password"
  const user = await users.getUserByUsername(userInfo.loginID);
  if (user) {
    bcrypt.compare(userInfo.password, user.hashedPassword, function (err, result) {
      if (result == true) {
        req.session.name = "AuthCookie";
        req.session.loginID = userInfo.loginID;
        req.session.authed = true;
 
        req.session.accesslevel = user.accessLevel;
        req.session.ID = user._id;

        res.redirect('/');
      } else {
        res.redirect('/users/signin/?login=fail');
      }


    });

  } else {
    res.redirect('/users/signin/?login=fail');
  }
  //   else{
  //   try{
  //   const newUser = await users.createUser(userInfo);

  //   req.session.ID = newUser._id;
  //   req.session.name = "AuthCookie";
  //   // res.status(200).json(newUser);
  //   res.render('users/multiple',{
  //     firstName: newUser.fname
  //   });
  // }catch(e){
  //   console.log(e);
  //   res.status(500);
  //   // res.render()
  //   }
  // }
});

router.post('/newuser', async (req, res) => {
  if (req.session.authed) {
    res.redirect('/');
    return;

  }
  userInfo = req.body;
  try {
    const newUser = await users.createUser(userInfo);
    req.session.ID = newUser._id;
    req.session.authed = true;
    req.session.accesslevel = 1;
    req.session.name = "AuthCookie";
    res.redirect('/');
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

router.get('/signup', async (req, res) => {
  if (req.session.authed) {
    res.redirect('/');
    return;

  }
  res.render('users/signup');
});

router.get('/signin', async (req, res) => {
  if (req.session.authed) {
    res.redirect('/');
    return;

  }
  res.render('users/signin');
});


module.exports = router;
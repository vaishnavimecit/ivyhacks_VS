const eventsRoutes = require("./events");
const userRoutes = require("./users");
const adminRoutes = require("./admin");
const standardRoutes = require("./standard");
const data = require('../data');
const events = data.events;
const users = data.users;
passport = require('passport'),
  auth = require('../data/google');

const constructorMethod = app => {
  app.use("/events", eventsRoutes);
  app.use("/standard", standardRoutes);
  app.use("/users", userRoutes);
  app.use("/admin", adminRoutes);
  auth(passport);
  app.use(passport.initialize());
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['openid', 'email', 'profile']
  }));
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/'
    }),
    (req, res) => {
      userInfo = users.getUserByEmail(req.user.email);
      userInfo.then(function (val) {
        if (val) {
          req.session.name = "AuthCookie";
          req.session.loginID = val.loginID;
          req.session.authed = true;
          req.session.accesslevel = val.accessLevel;
          req.session.ID = val._id;

          res.redirect('/');
        } else {
          res.redirect('/users/signin?login=fail');
        }
      })

    }
  );

  app.get('/', async (req, res) => {
    if (req.session.authed) {

      const userInfo = await users.getUserUpcomming(req.session.ID);

      let cancreate = false;
      if (req.session.accesslevel >= 2) {
        cancreate = true;
      }

      res.render('standard/home', {
        events: userInfo
      });

    } else {
      let allEvents = await events.getTopEvents();
      res.render('standard/home', {
        events: allEvents
      });

    }
  });
  app.use("*", (req, res) => {
    res.sendStatus(404);
  });

};

module.exports = constructorMethod;
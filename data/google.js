// This code was learned and modified based off of https://medium.com/@54m/promises-in-express-js-apis-testing-dd0243163d57
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
    passport.use(new GoogleStrategy({
            // I know this is not secure but we really dont have an enviorment to store in but in production this would be in a sec manager or enviorment
            clientID: '766568379070-jeqpql9adldjb8lamhi7e54svu18a8pb.apps.googleusercontent.com',
            clientSecret: 'CI8ItaacllGw2xzPqhUzU4I5',
            callbackURL: 'http://localhost:3000/auth/google/callback'
        },
        (token, refreshToken, profile, done) => {
            return done(null, {
                profile: profile,
                email: profile.emails[0].value,
                token: token
            });
        }));
};
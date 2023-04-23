'use strict';

const express = require('express');
const { Issuer, Strategy, generators } = require('openid-client');
const passport = require('passport');
const expressSession = require('express-session');
const { engine } = require('express-handlebars');
const dotenv = require('dotenv');

const app = express();

dotenv.config();

// Register 'handelbars' extension with The Mustache Express
app.engine(
  'hbs',
  engine({
    extname: 'hbs',
    defaultLayout: 'layout.hbs',
  })
);
app.set('view engine', 'hbs');

async function initializePassport() {
  const keycloakIssuer = await Issuer.discover(
    process.env.ISSUER_URL
  );

  console.log(
    'Discovered issuer %s %O',
    keycloakIssuer.issuer,
    keycloakIssuer.metadata
  );

  //keycloak client
  let client = new keycloakIssuer.Client({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: [process.env.REDIRECT_URI],
    post_logout_redirect_uris: [process.env.POST_LOGOUT_REDIRECT_URI],
    response_types: ['code'],
  });

  const authorizationURL = client.authorizationUrl({
    scope: 'openid profile email',
    response_type: 'code',
    nonce: generators.nonce(),
  });
  console.log(authorizationURL);
  console.log(client);
  const memoryStore = new expressSession.MemoryStore();
  app.use(
    expressSession({
      secret: 'another_long_secret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
      store: memoryStore,
    })
  );

  app.use(passport.initialize());
  app.use(passport.authenticate('session'));

  passport.use(
    'keycloak',
    new Strategy(
      {
        client,
      },
      (tokenSet, userinfo, done) => {
        console.log(tokenSet.access_token);
        //   console.log(userinfo)
        const user = tokenSet.claims();
        user.access_token = tokenSet.access_token;
        return done(null, user);
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  // default protected route /test
  app.get('/test', (req, res, next) => {
    passport.authenticate('keycloak')(req, res, next);
  });

  // callback always routes to test
  app.get('/auth/callback', (req, res, next) => {
    passport.authenticate('keycloak', {
      successRedirect: '/testauth',
      failureRedirect: '/',
    })(req, res, next);
  });

  // function to check weather user is authenticated, req.isAuthenticated is populated by password.js
  // use this function to protect all routes
  const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/test');
  };

  app.get('/testauth', checkAuthenticated, (req, res) => {
    res.render('test');
  });

  app.get('/other', checkAuthenticated, (req, res) => {
    res.render('other');
  });

  // unprotected route
  app.get('/', function (req, res) {
    res.render('index');
  });

  // start logout request
  app.get('/logout', (req, res) => {
    res.redirect(client.endSessionUrl());
  });

  // logout callback
  app.get('/logout/callback', (req, res) => {
    // clears the persisted user from the local storage
    req.logout((err) => {
      if (err) {
        console.log(err);
        res.send('Something wrong happened.');
      }
      // redirects the user to a public route
      res.redirect('/');
    });
  });

  app.listen(3000, function () {
    console.log('Listening at http://localhost:3000');
  });
}

initializePassport();

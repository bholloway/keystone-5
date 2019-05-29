const express = require('express');
const pDefer = require('p-defer');

// Step 1: Create the instance of our express app which will be setup / listened
// to by the lambda bridge built into the now/node builder
const app = express();

// Step 2: We need to do some setup before we can respond to requests. But
// before we kick off that work (which ties up the main thread for a little
// while), we want to setup a promise which will eventually resolve after setup
// is complete (ie; a deferred).
const setupDeferred = pDefer();

// Step 3: Capture all incoming requests
app.use((req, res, next) => {
  console.log(`req.url: ${req.url}`);
  console.log(`req.originalUrl: ${req.originalUrl}`);
  // Wait until the setup process is complete
  setupDeferred.promise
    // Step 10: Use the router setup in Step 8 to handle requests
    .then((router) => router(req, res, next))
    .catch(error => next(error));
});

// Step 4: Now that we've got a thing which can listen to incoming requests, we
// start loading our keystone instance
const { distDir } = require('./config');
const { keystone, apps } = require('./index');

console.log(`distDir: ${distDir}`);

// Step 6: Kick off the async process to prepare the keystone apps / middlewares
keystone
  .prepare({ apps, distDir, dev: false })
  .then(({ middlewares }) => {
    // Step 7: Connect to the keystone database
    keystone
      .connect(process.env.CONNECT_TO)
      .then(() => {
        // Step 8: Attach the given middlewares to an express instance
        const router = express.Router();
        router.use(middlewares);
        // Step 9: Tell the setup promise to resolve and pass around the router
        // instance
        setupDeferred.resolve(router);
      });
  })
  .catch(error => {
    setupDeferred.reject(error);
  });

// Step 6: Return the express instance so the lambda can be spun up
module.exports = app;

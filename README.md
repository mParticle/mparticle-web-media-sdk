<img src="https://static.mparticle.com/sdk/mp_logo_black.svg" width="280"><br>

# mParticle Web Media SDK

Hello! This is the public repo of the mParticle Web Media SDK. We've built the mParticle platform to take a new approach to web and mobile app data and the platform has grown to support 50+ services and SDKs, including developer tools, analytics, attribution, messaging, and advertising services. mParticle is designed to serve as the connector between all of these services - check out [our site](http://mparticle.com), or hit us at developers@mparticle.com to learn more.

## Documentation

Fully detailed documentation and other information about mParticle web SDK can be found at our doc site

-   [Core mParticle SDK](https://docs.mparticle.com/developers/sdk/web/getting-started)

-   [Media SDK](https://docs.mparticle.com/developers/sdk/web/media)

# Getting Started

Please be aware that this SDK is built as an extension of and requires the use of the [mParticle Javascript SDK](https://github.com/mParticle/mparticle-web-sdk/).

## Include and Initialize the SDK

Below summarizes the major steps to get the Web Media SDK up and running. In addition to the below, we have built a sample app that provides a more in depth look at how to send Media Events to Adobe's Heartbeat Kit. See that [sample app here](https://github.com/mParticle/mparticle-media-samples)

### Load mParticle via npm

In your root directory:

```
npm i @mparticle/web-sdk @mparticle/web-media-sdk
```

```
// index.js
import mParticle from '@mparticle/web-sdk'
import MediaSession from '@mparticle/web-media-sdk';
import SampleMediaKit from '@mparticle/web-sample-media-kit'

const mParticleConfig = {
  // Set up mParticle core config per our docs at:
  // https://docs.mparticle.com/developers/sdk/web/self-hosting/#3---create-a-config-object
}

// Register any media kits
SampleMediaKit.register(mParticle.config)

const mediaSession = new MediaSession(
    mParticle,                    // mParticle SDK Instance
    '1234567',                    // Custom media ID
    'Funny Internet cat video',   // Custom media Title
    120000,                       // Duration in milliseconds
    'Video',                      // Content Type (Video or Audio)
    'OnDemand'                    // Stream Type (OnDemand, Live, etc.)
)

mParticle.init('REPLACE WITH API KEY', mParticleConfig);

// Later in your code
mediaSession.logMediaSessionStart();
mediaSession.logPlay();

```

# Contibution Guidelines

At mParticle, we are proud of our code and like to keep things open source. If you'd like to contribute, simply fork this repo, push any code changes to your fork, and submit a Pull Request against the `development` branch of mParticle-web-media-sdk.

## Running the Tests

Prior to running the tests please install all dev dependencies via an `npm install`, and build the mParticle.js file as well as the test file by running `npm run build`:

```bash
$ npm install
$ npm run build
$ npm test
```

The test script will run all tests using Mocha as unit tests.

## Development Notes

This package comes with the NPM package [pre-commit](https://www.npmjs.com/package/pre-commit), which will run [GTS](https://github.com/google/gts) when you try to commit.

## Support

<support@mparticle.com>

## License

The mParticle Javascript SDK is available under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0). See the LICENSE file for more info.

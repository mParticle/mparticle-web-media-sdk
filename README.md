<img src="https://static.mparticle.com/sdk/mp_logo_black.svg" width="280"><br>

# mParticle Web Media SDK

Hello! This is the public repo of the mParticle Web Media SDK. We've built the mParticle platform to take a new approach to web and mobile app data and the platform has grown to support 200+ services and SDKs, including developer tools, analytics, attribution, messaging, and advertising services. mParticle is designed to serve as the connector between all of these services - check out [our site](http://mparticle.com), or hit us at developers@mparticle.com to learn more.

## Documentation

Fully detailed documentation and other information about mParticle web SDK can be found at our doc site

-   [Core mParticle SDK](https://docs.mparticle.com/developers/sdk/web/getting-started)

-   [Media SDK](https://docs.mparticle.com/developers/sdk/web/media)

# Getting Started

Please be aware that this SDK is built as an extension of and requires the use of the [mParticle Javascript SDK](https://github.com/mParticle/mparticle-web-sdk/).

## Include and Initialize the SDK

Below summarizes the major steps to get the Web Media SDK up and running.

<!-- In addition to the below, we have built a sample app that provides a more in depth look at how to send Media Events to Adobe's Heartbeat Kit. See that [sample app here](https://github.com/mParticle/mparticle-media-samples) -->

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

mParticle.init('REPLACE WITH API KEY', mParticleConfig);

// Later in your code, when a user begins to engage with your content
const mediaSession = new MediaSession(
    mParticle,                    // mParticle SDK Instance
    '1234567',                    // Custom media ID
    'Funny Internet cat video',   // Custom media Title
    120000,                       // Duration in milliseconds
    'Video',                      // Content Type (Video or Audio)
    'OnDemand'                    // Stream Type (OnDemand, Live, etc.)
    true,                         // Log Page Event Toggle (true/false)
    true,                         // Log Media Event Toggle (true/false)
)

mediaSession.logMediaSessionStart();
mediaSession.logPlay();

```

### Logging Custom Attributes

By default, a `MediaEvent` will have certain required attributes, such as `custom_media_id` and `custom_media_title`, etc. However, if you need to log something custom, such as `content_season_number` or `player_name`, this can be included in the `customAttributes` object.

These `customAttributes` are attributes unique to the media event but can be passed through the `MediaSession` via the various log functions as an `options` parameter.

```javascript
const customAttributes = {
    content_season: 3,
    content_episode: 26,
    content_episode_name: 'The Best of Both Worlds',
};

mediaSession.logPlay({ options: currentAttributes });
```

### Logging Playhead Position

Most of our partner integrations require that a media player frequently trigger a _timeline update_ or _heartbeat_ event. Our API provides two different methods of updating the playhead position based on your needs.

#### logPlayheadPosition (recommended)

The simplest method we provide is the current playhead position as a number to the `MediaSession.logPlayheadPostition()` method.

```javascript
player.addEventListener('playheadUpdate', function(currentPlayheadPosition) {
    mediaSession.logPlayheadPosition({ options: currentPlayheadPosition });
});
```

#### As Optional Parameter

If your implementation prevents you from triggering a playhead position update on regular intervals, you can provide the `currentPlayheadPosition` attribute via `options` to any log method.

```javascript

const options = {
    currentPlayheadPosition: 299;
}

mparticle.logPause(options);
mparticle.logAdSkip(exampleAdObject, options);

```

## Logging Custom Events

Depending on your use case or player's events, there might be a need to log an event which the Media SDK does not currently support. In these cases, please use the `createPageEvent` method to trigger a custom event via the Core SDK.

For example,

```javascript
const customMPEvent = MediaSession.createPageEvent('My Custom Event', {
    // Attributes are optional
    'custom-property': 'custom-value',
});

mParticle.logEvent(customMPEvent);
```

## Using the Event Listener

In cases where you may need to handle some custom functionality when a media event occurs, the Media SDK provides a `mediaEventListener` which will provide a callback.

For example, if you need to trigger a custom function when Play or Pause
occurs:

```javascript
const myCallback = function(event) {
    // Some custom callback method defined by user
    // Should only trigger when play or pause is fired
    if (
        event.type == MediaEventType.Play ||
        event.type == MediaEventType.Pause
    ) {
        // Get the Media Event as an mParticle Page Event
        const mpEvent = mediaEvent.toPageEvent();

        // Pass to your own custom function
        myCustomFunction(mpEvent);
    }
};

mediaSession.mediaEventListener(myCallback);
```

# Contribution Guidelines

At mParticle, we are proud of our code and like to keep things open source. If you'd like to contribute, simply fork this repo, push any code changes to your fork, and submit a Pull Request against the `master` branch of mParticle-web-media-sdk.

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

The mParticle Web Media SDK is available under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0). See the LICENSE file for more info.

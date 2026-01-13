# [1.5.0](https://github.com/mParticle/mparticle-web-media-sdk/compare/v1.4.10...v1.5.0) (2026-01-13)


### Features

* Pause mediaContentTimeSpent calculation on ad breaks ([#787](https://github.com/mParticle/mparticle-web-media-sdk/issues/787)) ([0502b88](https://github.com/mParticle/mparticle-web-media-sdk/commit/0502b88bfb45c1c9ade27a7c4717ac67cb9b7cd1))

## Releases

#### 1.4.10 - 2025-07-07

-   fix: Calculate mediaTimeSpent based on current time ([#709](https://github.com/mParticle/mparticle-web-media-sdk/pull/709)) ([a6c72b2](https://github.com/mParticle/mparticle-web-media-sdk/commit/a6c72b28605e6342687633102e6fb51d4160b43a))

#### 1.4.9 - 2025-03-31

-   fix: update calculation of mediaContentTimeSpent ([#639](https://github.com/mParticle/mparticle-web-media-sdk/pull/639)) ([345f1b5](https://github.com/mParticle/mparticle-web-media-sdk/commit/345f1b50c1e6fc47bb7d58a4e2259047f07a42ff))
#### 1.4.8 - 2024-09-16

-   fix: Accept CurrentPlayheadPosition with 0 value ([#638](https://github.com/mParticle/mparticle-web-media-sdk/pull/638)) ([4b22668](https://github.com/mParticle/mparticle-web-media-sdk/commit/4b22668940f3a3ac66469191e52ecf12015db732))

#### 1.4.7 - 2023-03-28

-   Add Session Custom Attributes for Events ([#559](https://github.com/mParticle/mparticle-web-media-sdk/pull/559)) ([7b97000](https://github.com/mParticle/mparticle-web-media-sdk/commit/7b97000f416632d30a562a920b96bf68b370966a))
-   ci: Add Standard Dependapot Workflows and Contribution notes ([#562](https://github.com/mParticle/mparticle-web-media-sdk/pull/562)) ([9a2f6fa](https://github.com/mParticle/mparticle-web-media-sdk/commit/9a2f6fabb8abc52debb5e7af1645cce48980a36c))

#### 1.4.6 - 2021-10-04

-   Bugfix: Fix error when rebuilding dist folder

#### 1.4.5 - 2021-09-30

-   Bugfix: Prevent Total Ad Time from being Doubled
-   Clean up formatting and linting

#### 1.4.4 - 2021-04-06

-   Revise playhead position to be optional and null on init

#### 1.4.3 - 2020-10-09

-   **DEPRECATION:** Replace MediaContentEnd with ContentEnd

#### 1.4.2 - 2020-08-24

-   Add Add new StreamTypes

#### 1.4.1 - 2020-06-24

-   Add Summary Events

#### 1.4.0 - 2020-05-27

-   Add Ad Position and Revise Placement

#### 1.3.0 - 2020-01-02

-   Add Travis CI
-   Add NYC Code Coverage
-   Split Session into a new file structure

#### 1.2.1 - 2020-01-02

-   Replace bundled mparticle-media.common.js

#### 1.2.0 - 2020-01-02

-   Add support for optional parameters in MediaSession Log Methods
-   Add custom attributes to MediaSession and MediaEvent
-   Add currentPlayheadPosition to optional parameters in MediaSession and MediaEvent
-   Resolve issue with QoS state

#### 1.1.1 - 2019-11-15

-   Update README and Comments with examples for Custom Events and Event Listener

#### 1.1.0 - 2019-10-31

-   Allow Media Events to be Sent as Custom Events
-   Add mediaEventListener to allow for listening in on event triggers
-   Happy Halloween! :jack_o_lantern: :jack_o_lantern: :japanese_goblin:

#### 1.0.0-beta.1 - 2019-10-01

-   Initial Commit

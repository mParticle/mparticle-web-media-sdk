"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaSession = void 0;
var events_1 = require("./events");
var types_1 = require("./types");
var utils_1 = require("./utils");
/**
 * The MediaSession class is the primary class that will be used to engage with the mParticle Media SDK.
 *
 * # Usage
 * ## MediaSession Instance
 *
 * ```javascript
 * const mediaSession = new MediaSession(
 *   mParticle,                    // mParticle SDK Instance
 *   '1234567',                    // Custom media ID
 *   'Funny Internet cat video',   // Custom media Title
 *   120000,                       // Duration in milliseconds
 *   'Video',                      // Content Type (Video or Audio)
 *   'OnDemand'                    // Stream Type (OnDemand, Live, etc.)
 *   true,                         // Log Page Event Toggle (true/false)
 *   true,                         // Log Media Event Toggle (true/false)
 *   {                             // (optional) Custom Attributes object used for each media event within the Media Session
 *     mediaSessionAttribute1: 'value1',
 *     mediaSessionAttribute2: 'value2'
 *   };
 * )
 * ```
 *
 * ## Logging Events
 *
 * Once initiated, a [[MediaSession]] provides various log methods
 * that will trigger a [[MediaEvent]].
 *
 * ```javascript
 * mediaSession.logMediaSessionStart();
 * mediaSession.logPlay();
 * ```
 *
 * ## Custom Attributes
 * By default, a `MediaEvent` will have certain required attributes,
 * such as `custom_media_id` and `custom_media_title`, etc. However,
 * if you require to log something custom, such as `content_season_number`
 * or `player_name`, this can be added to `customAttributes`.
 *
 * These `customAttributes` are attributes unique to the media event
 * but can be passed through the `MediaSession` via the various log
 * functions as an `options` parameter.
 *
 * ```javascript
 * const customAttributes = {
 *     content_season: 3,
 *     content_episode: 26,
 *     content_episode_name: 'The Best of Both Worlds',
 * };
 *
 * mediaSession.logPlay({ options: currentAttributes })
 * ```
 */
var MediaSession = /** @class */ (function () {
    /**
     * Initializes the Media Session object. This does not start a session, you can do so by calling `logMediaSessionStart`.
     * @param mparticleInstance Your mParticle global object
     * @param contentId A unique identifier for your media content
     * @param title The title of your media content
     * @param duration The length of time for the complete media content (not including ads or breaks)
     * @param contentType A descriptor for the type of content, i.e. Audio or Video
     * @param streamType A descriptor for the type of stream, i.e. live or on demand
     * @param logPageEvent A flag that toggles sending mParticle Events to Core SDK
     * @param logMediaEvent A flag that toggles sending Media Events to Core SDK
     * @param mediaSessionAttributes (optional) A set of custom attributes to attach to all media Events created by a Session
     * @param excludeAdBreaksFromContentTime A flag to exclude ad-break time from media content time (default false)
     */
    function MediaSession(mparticleInstance, contentId, title, duration, contentType, streamType, logPageEvent, logMediaEvent, mediaSessionAttributes, excludeAdBreaksFromContentTime) {
        if (logPageEvent === void 0) { logPageEvent = false; }
        if (logMediaEvent === void 0) { logMediaEvent = true; }
        if (excludeAdBreaksFromContentTime === void 0) { excludeAdBreaksFromContentTime = false; }
        this.mparticleInstance = mparticleInstance;
        this.contentId = contentId;
        this.title = title;
        this.duration = duration;
        this.contentType = contentType;
        this.streamType = streamType;
        this.logPageEvent = logPageEvent;
        this.logMediaEvent = logMediaEvent;
        this.mediaSessionAttributes = mediaSessionAttributes;
        this.excludeAdBreaksFromContentTime = excludeAdBreaksFromContentTime;
        this._sessionId = '';
        this.currentQoS = {
            startupTime: 0,
            fps: 0,
            bitRate: 0,
            droppedFrames: 0,
        };
        this.customAttributes = {};
        this.mediaSessionStartTimestamp = Date.now(); //Timestamp created on logMediaSessionStart event
        this.mediaSessionEndTimestamp = Date.now(); //Timestamp updated when any event is loggged
        this.storedPlaybackTime = 0; //On Pause calculate playback time and clear currentPlaybackTime
        this.mediaContentCompleteLimit = 100; //Percentage of content that must be progressed through to mark as completed
        this.mediaContentComplete = false; //Updates to true triggered by logMediaContentEnd, 0 or false if complete milestone not reached.
        this.mediaSessionSegmentTotal = 0; //number incremented with each logSegmentStart
        this.mediaTotalAdTimeSpent = 0; //total second sum of ad break time spent
        this.mediaSessionAdTotal = 0; //number of ads played in the media session - increment on logAdStart
        this.mediaSessionAdObjects = []; //array of unique identifiers for ads played in the media session - append ad_content_ID on logAdStart
        this.sessionSummarySent = false; // Ensures we only send the summary event once
        // Tracks whether playback was playing, paused by user, or paused by an ad break
        this.playbackState = 'pausedByUser';
        this.listenerCallback = function () { };
        this.mediaSessionStartTimestamp = Date.now();
    }
    Object.defineProperty(MediaSession.prototype, "sessionId", {
        get: function () {
            return this._sessionId;
        },
        enumerable: false,
        configurable: true
    });
    MediaSession.prototype.mediaTimeSpent = function () {
        return Date.now() - this.mediaSessionStartTimestamp;
    };
    MediaSession.prototype.mediaContentTimeSpent = function () {
        if (this.currentPlaybackStartTimestamp) {
            return (this.storedPlaybackTime +
                (Date.now() - this.currentPlaybackStartTimestamp));
        }
        else {
            return this.storedPlaybackTime;
        }
    };
    /**
     * Pauses content-time accumulation if ad break exclusion is enabled.
     * Sets playback state to pausedByAdBreak when a pause is performed.
     */
    MediaSession.prototype.pauseContentTimeIfAdBreakExclusionEnabled = function () {
        if (!this.excludeAdBreaksFromContentTime ||
            this.playbackState !== 'playing') {
            return;
        }
        if (this.currentPlaybackStartTimestamp) {
            this.storedPlaybackTime +=
                Date.now() - this.currentPlaybackStartTimestamp;
            this.currentPlaybackStartTimestamp = undefined;
            this.playbackState = 'pausedByAdBreak';
        }
    };
    /**
     * Resumes content-time accumulation if ad break exclusion is enabled and
     * the previous pause was caused by an ad break (not by user).
     * Sets playback state to playing on resume.
     */
    MediaSession.prototype.resumeContentTimeIfAdBreakExclusionEnabled = function () {
        if (!this.excludeAdBreaksFromContentTime ||
            this.playbackState !== 'pausedByAdBreak') {
            return;
        }
        this.currentPlaybackStartTimestamp = Date.now();
        this.playbackState = 'playing';
    };
    MediaSession.prototype.mediaAdTimeSpentRate = function () {
        return ((this.mediaTotalAdTimeSpent / this.mediaContentTimeSpent()) * 100);
    };
    /**
     * Creates a base Media Event
     * @param eventType
     * @param customAttributes
     */
    MediaSession.prototype.createMediaEvent = function (eventType, options) {
        var _a;
        if (options === void 0) { options = {}; }
        // Set event option based on options or current state
        this.currentPlayheadPosition =
            (_a = options === null || options === void 0 ? void 0 : options.currentPlayheadPosition) !== null && _a !== void 0 ? _a : this.currentPlayheadPosition;
        // Merge Session Attributes with any other optional Event Attributes.
        // Event-Level Custom Attributes will override Session Custom Attributes if there is a collison.
        this.customAttributes = __assign(__assign({}, this.mediaSessionAttributes), ((options === null || options === void 0 ? void 0 : options.customAttributes) || {}));
        options = {
            currentPlayheadPosition: this.currentPlayheadPosition,
            customAttributes: this.customAttributes,
        };
        return new events_1.MediaEvent(eventType, this.title, this.contentId, this.duration, this.contentType, this.streamType, this.sessionId, options);
    };
    /**
     * Sends MediaEvent to CoreSDK depending on if [logMediaEvent] or [logPageEvent] are set
     * @param event MediaEvent
     */
    MediaSession.prototype.logEvent = function (event) {
        this.mediaSessionEndTimestamp = Date.now();
        if (this.mediaContentCompleteLimit !== 100) {
            if (this.duration &&
                this.currentPlayheadPosition &&
                this.currentPlayheadPosition / this.duration >=
                    this.mediaContentCompleteLimit / 100) {
                this.mediaContentComplete = true;
            }
        }
        this.mediaEventListener(event);
        if (this.logMediaEvent) {
            this.mparticleInstance.logBaseEvent(event);
        }
        if (this.logPageEvent) {
            if (event.eventType !== types_1.MediaEventType.UpdatePlayheadPosition) {
                var mpEvent = event.toPageEvent();
                this.mparticleInstance.logBaseEvent(mpEvent);
            }
        }
    };
    /**
     * Returns QoS attributes as a flat object
     */
    MediaSession.prototype.getQoSAttributes = function () {
        var result = {};
        if (this.currentQoS.bitRate) {
            result.qos_bitrate = this.currentQoS.bitRate;
        }
        if (this.currentQoS.startupTime) {
            result.qos_startup_time = this.currentQoS.startupTime;
        }
        if (this.currentQoS.fps) {
            result.qos_fps = this.currentQoS.fps;
        }
        if (this.currentQoS.droppedFrames) {
            result.qos_dropped_frames = this.currentQoS.droppedFrames;
        }
        return result;
    };
    /**
     * Returns session attributes as a flat object
     */
    MediaSession.prototype.getAttributes = function () {
        var attributes = {
            content_title: this.title,
            content_duration: this.duration,
            content_id: this.contentId,
            content_type: types_1.MediaContentType[this.contentType],
            stream_type: types_1.MediaStreamType[this.streamType],
            media_session_id: this.sessionId,
        };
        if (this.currentPlayheadPosition) {
            attributes['playhead_position'] = this.currentPlayheadPosition;
        }
        return attributes;
    };
    /**
     * Starts your media session. Should be triggered before any prerolls or ads
     * @param options Optional Custom Attributes
     * @category Media
     */
    MediaSession.prototype.logMediaSessionStart = function (options) {
        this._sessionId = (0, utils_1.uuid)();
        this.mediaSessionStartTimestamp = Date.now();
        var event = this.createMediaEvent(types_1.MediaEventType.SessionStart, options);
        this.logEvent(event);
    };
    /**
     * Ends your media session. Should be triggered after all ads and content have been completed
     * @param options Optional Custom Attributes
     * @category Media
     */
    MediaSession.prototype.logMediaSessionEnd = function (options) {
        var event = this.createMediaEvent(types_1.MediaEventType.SessionEnd, options);
        this.logEvent(event);
        this.logSessionSummary();
    };
    /**
     * Logs when your media content has ended, usually before a post-roll ad.
     * Must be fired between MediaSessionStart and MediaSessionEnd
     * @param options Optional Custom Attributes
     * @category Media
     */
    MediaSession.prototype.logMediaContentEnd = function (options) {
        this.mediaContentComplete = true;
        if (this.currentPlaybackStartTimestamp) {
            this.storedPlaybackTime =
                this.storedPlaybackTime +
                    (Date.now() - this.currentPlaybackStartTimestamp);
            this.currentPlaybackStartTimestamp = undefined;
        }
        var event = this.createMediaEvent(types_1.MediaEventType.ContentEnd, options);
        this.logEvent(event);
    };
    /**
     * Logs when an Ad Break pod has started
     * @param adBreakContent An object representing an [[AdBreak]] (collection of ads)
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    MediaSession.prototype.logAdBreakStart = function (adBreakContent, options) {
        this.adBreak = adBreakContent;
        // If configured, pause content-time accumulation during ad breaks
        this.pauseContentTimeIfAdBreakExclusionEnabled();
        var event = this.createMediaEvent(types_1.MediaEventType.AdBreakStart, options);
        event.adBreak = adBreakContent;
        this.logEvent(event);
    };
    /**
     * Logs when an [[AdBreak]] pod has ended
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    MediaSession.prototype.logAdBreakEnd = function (options) {
        this.resumeContentTimeIfAdBreakExclusionEnabled();
        var event = this.createMediaEvent(types_1.MediaEventType.AdBreakEnd, options);
        event.adBreak = this.adBreak;
        this.logEvent(event);
        this.adBreak = undefined;
    };
    /**
     * Logs when a single ad plays
     * @param adContent An object representing a single Ad
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    MediaSession.prototype.logAdStart = function (adContent, options) {
        this.mediaSessionAdTotal += 1;
        this.mediaSessionAdObjects.push(adContent.id);
        this.adContent = adContent;
        this.adContent.adStartTimestamp = Date.now();
        var event = this.createMediaEvent(types_1.MediaEventType.AdStart, options);
        event.adContent = adContent;
        this.logEvent(event);
    };
    /**
     * Logs when a single ad ends
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    MediaSession.prototype.logAdEnd = function (options) {
        var _a;
        if ((_a = this.adContent) === null || _a === void 0 ? void 0 : _a.adStartTimestamp) {
            this.adContent.adEndTimestamp = Date.now();
            this.adContent.adCompleted = true;
            this.adContent.adSkipped = false;
            this.mediaTotalAdTimeSpent +=
                this.adContent.adEndTimestamp -
                    this.adContent.adStartTimestamp;
        }
        var event = this.createMediaEvent(types_1.MediaEventType.AdEnd, options);
        event.adContent = this.adContent;
        this.logEvent(event);
        this.logAdSummary();
    };
    /**
     * Logs when a single ad is skipped by a visitor
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    MediaSession.prototype.logAdSkip = function (options) {
        var _a;
        if ((_a = this.adContent) === null || _a === void 0 ? void 0 : _a.adStartTimestamp) {
            this.adContent.adEndTimestamp = Date.now();
            this.adContent.adSkipped = true;
            this.adContent.adCompleted = false;
            this.mediaTotalAdTimeSpent +=
                this.adContent.adEndTimestamp -
                    this.adContent.adStartTimestamp;
        }
        var event = this.createMediaEvent(types_1.MediaEventType.AdSkip, options);
        event.adContent = this.adContent;
        this.logEvent(event);
        this.logAdSummary();
    };
    /**
     * Logs when a single ad is clicked on by a visitor
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    MediaSession.prototype.logAdClick = function (adContent, options) {
        this.adContent = adContent;
        var event = this.createMediaEvent(types_1.MediaEventType.AdClick, options);
        event.adContent = this.adContent;
        this.logEvent(event);
    };
    /**
     * Logs the start of a buffering event
     * @param bufferDuration The duration of a buffering event
     * @param bufferPercent The percent that has been buffered
     * @param bufferPosition The playhead position of the buffering event
     * @param options Optional Custom Attributes
     * @category Buffering
     */
    MediaSession.prototype.logBufferStart = function (bufferDuration, bufferPercent, bufferPosition, options) {
        var event = this.createMediaEvent(types_1.MediaEventType.BufferStart, options);
        event.bufferDuration = bufferDuration;
        event.bufferPercent = bufferPercent;
        event.bufferPosition = bufferPosition;
        this.logEvent(event);
    };
    /**
     * Logs the end of a buffering event
     * @param bufferDuration The duration of a buffering event
     * @param bufferPercent The percent that has been buffered
     * @param bufferPosition The playhead position of the buffering event
     * @param options Optional Custom Attributes
     * @category Buffering
     */
    MediaSession.prototype.logBufferEnd = function (bufferDuration, bufferPercent, bufferPosition, options) {
        var event = this.createMediaEvent(types_1.MediaEventType.BufferEnd, options);
        event.bufferDuration = bufferDuration;
        event.bufferPercent = bufferPercent;
        event.bufferPosition = bufferPosition;
        this.logEvent(event);
    };
    /**
     * Logs a play event
     * @param options Optional Custom Attributes
     * @category Media
     */
    MediaSession.prototype.logPlay = function (options) {
        if (!this.currentPlaybackStartTimestamp) {
            this.currentPlaybackStartTimestamp = Date.now();
        }
        this.playbackState = 'playing';
        var event = this.createMediaEvent(types_1.MediaEventType.Play, options);
        this.logEvent(event);
    };
    /**
     * Logs a pause event
     * @param options Optional Custom Attributes
     * @category Media
     */
    MediaSession.prototype.logPause = function (options) {
        if (this.currentPlaybackStartTimestamp) {
            this.storedPlaybackTime =
                this.storedPlaybackTime +
                    (Date.now() - this.currentPlaybackStartTimestamp);
            this.currentPlaybackStartTimestamp = undefined;
        }
        this.playbackState = 'pausedByUser';
        var event = this.createMediaEvent(types_1.MediaEventType.Pause, options);
        this.logEvent(event);
    };
    /**
     * Logs the start of a Segment or Chapter
     * @param segment An object representing a segment or chapter of content
     * @param options Optional Custom Attributes
     * @category Media
     */
    MediaSession.prototype.logSegmentStart = function (segment, options) {
        this.mediaSessionSegmentTotal += 1;
        segment.segmentStartTimestamp = Date.now();
        this.segment = segment;
        var event = this.createMediaEvent(types_1.MediaEventType.SegmentStart, options);
        event.segment = segment;
        this.logEvent(event);
    };
    /**
     * Logs the end of a Segment or Chapter
     * @param options Optional Custom Attributes
     * @category Media
     */
    MediaSession.prototype.logSegmentEnd = function (options) {
        var _a;
        if ((_a = this.segment) === null || _a === void 0 ? void 0 : _a.segmentStartTimestamp) {
            this.segment.segmentEndTimestamp = Date.now();
            this.segment.segmentCompleted = true;
            this.segment.segmentSkipped = false;
        }
        var event = this.createMediaEvent(types_1.MediaEventType.SegmentEnd, options);
        event.segment = this.segment;
        this.logEvent(event);
        this.logSegmentSummary();
    };
    /**
     * Logs when a visitor skips a Segment or Chapter
     * @param options Optional Custom Attributes
     * @category Media
     */
    MediaSession.prototype.logSegmentSkip = function (options) {
        var _a;
        if ((_a = this.segment) === null || _a === void 0 ? void 0 : _a.segmentStartTimestamp) {
            this.segment.segmentEndTimestamp = Date.now();
            this.segment.segmentSkipped = true;
            this.segment.segmentCompleted = false;
        }
        var event = this.createMediaEvent(types_1.MediaEventType.SegmentSkip, options);
        event.segment = this.segment;
        this.logEvent(event);
        this.logSegmentSummary();
    };
    /**
     * Logs when a visitor starts seeking
     * @param seekPosition the desired playhead position
     * @param options Optional Custom Attributes
     * @category Media
     */
    MediaSession.prototype.logSeekStart = function (seekPosition, options) {
        var event = this.createMediaEvent(types_1.MediaEventType.SeekStart, options);
        event.seekPosition = seekPosition;
        this.logEvent(event);
    };
    /**
     * Logs when a visitor stops seeking
     * @param seekPosition the desired playhead position
     * @param options Optional Custom Attributes
     * @category Media
     */
    MediaSession.prototype.logSeekEnd = function (seekPosition, options) {
        var event = this.createMediaEvent(types_1.MediaEventType.SeekEnd, options);
        event.seekPosition = seekPosition;
        this.logEvent(event);
    };
    /**
     * Logs when the playhead position is updated
     * @param playheadPosition The updated playhead position
     * @category Media
     */
    MediaSession.prototype.logPlayheadPosition = function (playheadPosition) {
        this.currentPlayheadPosition = playheadPosition;
        var event = this.createMediaEvent(types_1.MediaEventType.UpdatePlayheadPosition);
        event.playheadPosition = playheadPosition;
        this.logEvent(event);
    };
    /**
     * Logs an update in the Quality of Service
     * @param qos An object representing QoS
     * @param options Optional Custom Attributes
     * @category Quality of Service
     */
    MediaSession.prototype.logQoS = function (qos, options) {
        this.currentQoS = __assign(__assign({}, this.currentQoS), qos);
        var event = this.createMediaEvent(types_1.MediaEventType.UpdateQoS, options);
        event.qos = __assign({}, this.currentQoS);
        this.logEvent(event);
    };
    /**
     * Creates a Custom Page Event which can then be passed into
     * Core SDK as an event
     *
     * ```typescript
     * const customMPEvent = MediaSession.createPageEvent(
     *     'My Custom Event',
     * .   {
     *        "custom-property": "custom-value"
     *     }
     * );
     *
     * mParticle.logEvent(customMPEvent);
     * ```
     *
     * returns a Custom Page Event
     * @param eventName The name of your custom event
     * @param attributes An Attribute Key/Value pair
     */
    MediaSession.prototype.createPageEvent = function (eventName, attributes) {
        return {
            name: eventName,
            eventType: types_1.EventType.Media,
            messageType: types_1.MessageType.PageEvent,
            data: __assign(__assign(__assign({}, this.getAttributes()), this.getQoSAttributes()), attributes),
        };
    };
    Object.defineProperty(MediaSession.prototype, "mediaEventListener", {
        /**
         * Subscribes your Media Session to an array of [[MediaEventType]] and fires a
         * callback when they are triggered
         *
         * ```typescript
         * const mediaSession = new MediaSession(
         *     mParticle,
         *     title = "Media Title"
         *     contentId = "123"
         *     duration = 1000
         *     streamType = StreamType.LiveStream
         *     contentType = ContentType.Video
         *
         *     logPageEvents = false              //optional, defaults to false anyway
         *     logMediaEvents = false             //optional, defaults to false anyway
         *     sessionCustomEvents = {}           //optional, defaults to empty object
         * );
         *
         * const myCallback = (event: MediaEvent): void => {
         *     // Some custom callback method defined by user
         *     // Should only trigger when play or pause is fired
         *     if (
         *         event.type == MediaEventType.Play ||
         *         event.type == MediaEventType.Pause
         *     ) {
         *         const mpEvent = mediaEvent.toPageEvent();
         *         mParticle.getInstance().logEvent(mpEvent);
         *     }
         * }
         *
         * mediaSession.mediaEventListener(myCallback);
         *
         * ```
         * @param eventTypes An Array of MediaEventTypes that are being subscribed to
         * @param callback A callback function
         */
        get: function () {
            return this.listenerCallback;
        },
        set: function (callback) {
            this.listenerCallback = callback;
        },
        enumerable: false,
        configurable: true
    });
    MediaSession.prototype.logSessionSummary = function () {
        if (!this.sessionSummarySent) {
            if (!this.mediaSessionEndTimestamp) {
                this.mediaSessionEndTimestamp = Date.now();
            }
            // tslint:disable-next-line: no-any
            var customAttributes = {};
            customAttributes[types_1.ValidMediaAttributeKeys.mediaSessionIdKey] =
                this.sessionId;
            customAttributes[types_1.ValidMediaAttributeKeys.startTimestampKey] =
                this.mediaSessionStartTimestamp;
            customAttributes[types_1.ValidMediaAttributeKeys.endTimestampKey] =
                this.mediaSessionEndTimestamp;
            customAttributes[types_1.ValidMediaAttributeKeys.contentIdKey] =
                this.contentId;
            customAttributes[types_1.ValidMediaAttributeKeys.contentTitleKey] =
                this.title;
            customAttributes[types_1.ValidMediaAttributeKeys.mediaTimeSpentKey] =
                this.mediaTimeSpent();
            customAttributes[types_1.ValidMediaAttributeKeys.contentTimeSpentKey] =
                this.mediaContentTimeSpent();
            customAttributes[types_1.ValidMediaAttributeKeys.contentCompleteKey] =
                this.mediaContentComplete;
            customAttributes[types_1.ValidMediaAttributeKeys.totalSegmentsKey] =
                this.mediaSessionSegmentTotal;
            customAttributes[types_1.ValidMediaAttributeKeys.totalAdTimeSpentKey] =
                this.mediaTotalAdTimeSpent;
            customAttributes[types_1.ValidMediaAttributeKeys.adTimeSpentRateKey] =
                this.mediaAdTimeSpentRate();
            customAttributes[types_1.ValidMediaAttributeKeys.totalAdsKey] =
                this.mediaSessionAdTotal;
            customAttributes[types_1.ValidMediaAttributeKeys.adIDsKey] =
                this.mediaSessionAdObjects;
            var options = {
                currentPlayheadPosition: this.currentPlayheadPosition,
                customAttributes: customAttributes,
            };
            var summaryEvent = this.createMediaEvent(types_1.MediaEventType.SessionSummary, options);
            this.logEvent(summaryEvent);
            this.sessionSummarySent = true;
        }
    };
    MediaSession.prototype.logSegmentSummary = function () {
        var _a;
        if ((_a = this.segment) === null || _a === void 0 ? void 0 : _a.segmentStartTimestamp) {
            if (!this.segment.segmentEndTimestamp) {
                this.segment.segmentEndTimestamp = Date.now();
            }
            // tslint:disable-next-line: no-any
            var customAttributes = {};
            customAttributes[types_1.ValidMediaAttributeKeys.mediaSessionIdKey] =
                this.sessionId;
            customAttributes[types_1.ValidMediaAttributeKeys.contentId] =
                this.contentId;
            customAttributes[types_1.ValidMediaAttributeKeys.segmentIndexKey] =
                this.segment.index;
            customAttributes[types_1.ValidMediaAttributeKeys.segmentTitleKey] =
                this.segment.title;
            customAttributes[types_1.ValidMediaAttributeKeys.segmentStartTimestampKey] =
                this.segment.segmentStartTimestamp;
            customAttributes[types_1.ValidMediaAttributeKeys.segmentEndTimestampKey] =
                this.segment.segmentEndTimestamp;
            customAttributes[types_1.ValidMediaAttributeKeys.segmentTimeSpentKey] =
                this.segment.segmentEndTimestamp -
                    this.segment.segmentStartTimestamp;
            customAttributes[types_1.ValidMediaAttributeKeys.segmentSkippedKey] =
                this.segment.segmentSkipped;
            customAttributes[types_1.ValidMediaAttributeKeys.segmentCompletedKey] =
                this.segment.segmentCompleted;
            var options = {
                currentPlayheadPosition: this.currentPlayheadPosition,
                customAttributes: customAttributes,
            };
            var summaryEvent = this.createMediaEvent(types_1.MediaEventType.SegmentSummary, options);
            this.logEvent(summaryEvent);
        }
        this.segment = undefined;
    };
    MediaSession.prototype.logAdSummary = function () {
        var _a, _b, _c, _d, _e, _f, _g;
        if (this.adContent) {
            if (this.adContent.adStartTimestamp &&
                !this.adContent.adEndTimestamp) {
                this.adContent.adEndTimestamp = Date.now();
                this.mediaTotalAdTimeSpent +=
                    this.adContent.adEndTimestamp -
                        this.adContent.adStartTimestamp;
            }
            // tslint:disable-next-line: no-any
            var customAttributes = {};
            customAttributes[types_1.ValidMediaAttributeKeys.mediaSessionIdKey] =
                this.sessionId;
            customAttributes[types_1.ValidMediaAttributeKeys.adBreakIdKey] =
                (_a = this.adBreak) === null || _a === void 0 ? void 0 : _a.id;
            customAttributes[types_1.ValidMediaAttributeKeys.adContentIdKey] =
                (_b = this.adContent) === null || _b === void 0 ? void 0 : _b.id;
            customAttributes[types_1.ValidMediaAttributeKeys.adContentStartTimestampKey] = (_c = this.adContent) === null || _c === void 0 ? void 0 : _c.adStartTimestamp;
            customAttributes[types_1.ValidMediaAttributeKeys.adContentEndTimestampKey] =
                (_d = this.adContent) === null || _d === void 0 ? void 0 : _d.adEndTimestamp;
            customAttributes[types_1.ValidMediaAttributeKeys.adContentTitleKey] =
                (_e = this.adContent) === null || _e === void 0 ? void 0 : _e.title;
            customAttributes[types_1.ValidMediaAttributeKeys.adContentSkippedKey] =
                (_f = this.adContent) === null || _f === void 0 ? void 0 : _f.adSkipped;
            customAttributes[types_1.ValidMediaAttributeKeys.adContentCompletedKey] =
                (_g = this.adContent) === null || _g === void 0 ? void 0 : _g.adCompleted;
            var options = {
                currentPlayheadPosition: this.currentPlayheadPosition,
                customAttributes: customAttributes,
            };
            var summaryEvent = this.createMediaEvent(types_1.MediaEventType.AdSummary, options);
            this.logEvent(summaryEvent);
        }
        this.adContent = undefined;
    };
    return MediaSession;
}());
exports.MediaSession = MediaSession;

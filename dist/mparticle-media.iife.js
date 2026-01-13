var MediaSession = (function () {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    // This will live in a declaration file in core sdk
    // once we set that up.
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["PageEvent"] = 4] = "PageEvent";
        MessageType[MessageType["Media"] = 20] = "Media";
    })(MessageType || (MessageType = {}));
    var EventType;
    (function (EventType) {
        EventType[EventType["Media"] = 9] = "Media";
    })(EventType || (EventType = {}));
    var MediaEventType;
    (function (MediaEventType) {
        MediaEventType[MediaEventType["Play"] = 23] = "Play";
        MediaEventType[MediaEventType["Pause"] = 24] = "Pause";
        MediaEventType[MediaEventType["ContentEnd"] = 25] = "ContentEnd";
        MediaEventType[MediaEventType["SessionStart"] = 30] = "SessionStart";
        MediaEventType[MediaEventType["SessionEnd"] = 31] = "SessionEnd";
        MediaEventType[MediaEventType["SeekStart"] = 32] = "SeekStart";
        MediaEventType[MediaEventType["SeekEnd"] = 33] = "SeekEnd";
        MediaEventType[MediaEventType["BufferStart"] = 34] = "BufferStart";
        MediaEventType[MediaEventType["BufferEnd"] = 35] = "BufferEnd";
        MediaEventType[MediaEventType["UpdatePlayheadPosition"] = 36] = "UpdatePlayheadPosition";
        MediaEventType[MediaEventType["AdClick"] = 37] = "AdClick";
        MediaEventType[MediaEventType["AdBreakStart"] = 38] = "AdBreakStart";
        MediaEventType[MediaEventType["AdBreakEnd"] = 39] = "AdBreakEnd";
        MediaEventType[MediaEventType["AdStart"] = 40] = "AdStart";
        MediaEventType[MediaEventType["AdEnd"] = 41] = "AdEnd";
        MediaEventType[MediaEventType["AdSkip"] = 42] = "AdSkip";
        MediaEventType[MediaEventType["SegmentStart"] = 43] = "SegmentStart";
        MediaEventType[MediaEventType["SegmentEnd"] = 44] = "SegmentEnd";
        MediaEventType[MediaEventType["SegmentSkip"] = 45] = "SegmentSkip";
        MediaEventType[MediaEventType["UpdateQoS"] = 46] = "UpdateQoS";
        MediaEventType[MediaEventType["SessionSummary"] = 47] = "SessionSummary";
        MediaEventType[MediaEventType["SegmentSummary"] = 48] = "SegmentSummary";
        MediaEventType[MediaEventType["AdSummary"] = 49] = "AdSummary";
    })(MediaEventType || (MediaEventType = {}));
    var MediaEventName = {
        Play: 'Play',
        Pause: 'Pause',
        ContentEnd: 'Media Content End',
        SessionStart: 'Media Session Start',
        SessionEnd: 'Media Session End',
        SeekStart: 'Seek Start',
        SeekEnd: 'Seek End',
        BufferStart: 'Buffer Start',
        BufferEnd: 'Buffer End',
        UpdatePlayheadPosition: 'Update Playhead Position',
        AdClick: 'Ad Click',
        AdBreakStart: 'Ad Break Start',
        AdBreakEnd: 'Ad Break End',
        AdStart: 'Ad Start',
        AdEnd: 'Ad End',
        AdSkip: 'Ad Skip',
        SegmentStart: 'Segment Start',
        SegmentEnd: 'Segment End',
        SegmentSkip: 'Segment Skip',
        UpdateQoS: 'Update QoS',
        SessionSummary: 'Media Session Summary',
        SegmentSummary: 'Media Segment Summary',
        AdSummary: 'Media Ad Summary',
    };
    var MediaContentType;
    (function (MediaContentType) {
        MediaContentType["Video"] = "Video";
        MediaContentType["Audio"] = "Audio";
    })(MediaContentType || (MediaContentType = {}));
    var MediaStreamType;
    (function (MediaStreamType) {
        MediaStreamType["LiveStream"] = "LiveStream";
        MediaStreamType["OnDemand"] = "OnDemand";
        MediaStreamType["Linear"] = "Linear";
        MediaStreamType["Podcast"] = "Podcast";
        MediaStreamType["Audiobook"] = "Audiobook";
    })(MediaStreamType || (MediaStreamType = {}));
    var ValidMediaAttributeKeys = {
        mediaSessionId: 'media_session_id',
        playheadPosition: 'playhead_position',
        id: 'id',
        //MediaConent
        contentTitle: 'content_title',
        contentId: 'content_id',
        duration: 'content_duration',
        streamType: 'stream_type',
        contentType: 'content_type',
        //Seek
        seekPosition: 'seek_position',
        //Buffer
        bufferDuration: 'buffer_duration',
        bufferPercent: 'buffer_percent',
        bufferPosition: 'buffer_position',
        //QoS
        qosBitrate: 'qos_bitrate',
        qosFramesPerSecond: 'qos_fps',
        qosStartupTime: 'qos_startup_time',
        qosDroppedFrames: 'qos_dropped_frames',
        //MediaAd
        adTitle: 'ad_content_title',
        adDuration: 'ad_content_duration',
        adId: 'ad_content_id',
        adAdvertiserId: 'ad_content_advertiser',
        adCampaign: 'ad_content_campaign',
        adCreative: 'ad_content_creative',
        adPlacement: 'ad_content_placement',
        adPosition: 'ad_content_position',
        adSiteId: 'ad_content_site_id',
        //MediaAdBreak
        adBreakTitle: 'ad_break_title',
        adBreakDuration: 'ad_break_duration',
        adBreakPlaybackTime: 'ad_break_playback_time',
        adBreakId: 'ad_break_id',
        //Segment
        segmentTitle: 'segment_title',
        segmentIndex: 'segment_index',
        segmentDuration: 'segment_duration',
        // Session Summary Attributes
        mediaSessionIdKey: 'media_session_id',
        startTimestampKey: 'media_session_start_time',
        endTimestampKey: 'media_session_end_time',
        contentIdKey: 'content_id',
        contentTitleKey: 'content_title',
        mediaTimeSpentKey: 'media_time_spent',
        contentTimeSpentKey: 'media_content_time_spent',
        contentCompleteKey: 'media_content_complete',
        totalSegmentsKey: 'media_session_segment_total',
        totalAdTimeSpentKey: 'media_total_ad_time_spent',
        adTimeSpentRateKey: 'media_ad_time_spent_rate',
        totalAdsKey: 'media_session_ad_total',
        adIDsKey: 'media_session_ad_objects',
        // Ad Summary Attributes
        adBreakIdKey: 'ad_break_id',
        adContentIdKey: 'ad_content_id',
        adContentStartTimestampKey: 'ad_content_start_time',
        adContentEndTimestampKey: 'ad_content_end_time',
        adContentTitleKey: 'ad_content_title',
        adContentSkippedKey: 'ad_skipped',
        adContentCompletedKey: 'ad_completed',
        // Segment Summary Attributes
        segmentIndexKey: 'segment_index',
        segmentTitleKey: 'segment_title',
        segmentStartTimestampKey: 'segment_start_time',
        segmentEndTimestampKey: 'segment_end_time',
        segmentTimeSpentKey: 'media_segment_time_spent',
        segmentSkippedKey: 'segment_skipped',
        segmentCompletedKey: 'segment_completed',
    };

    var uuid = function () {
        // Thanks to StackOverflow user Briguy37
        // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };
    var getNameFromType = function (type) {
        return MediaEventName[MediaEventType[type]];
    };

    /**
     * Represents a Base event for mParticle Core
     */
    var BaseEvent = /** @class */ (function () {
        /**
         *
         * @param name The name of the event
         * @param eventType an Event Type that corresponds to [EventType](https://github.com/mParticle/mparticle-web-sdk/blob/master/src/types.js) in Core SDK
         * @param messageType A message type that corresponds to MessageType
         */
        function BaseEvent(name, eventType, messageType) {
            this.name = name;
            this.eventType = eventType;
            this.messageType = messageType;
        }
        return BaseEvent;
    }());
    /**
     * Represents a single media event. Generally you won't call this class directly. The Media SDK calls this class internally when you invoke methods on [[MediaSession]].
     *
     * ## Custom Attributes
     * By default, a `MediaEvent` will have certain required attributes,
     * such as `custom_media_id` and `custom_media_title`, etc. However,
     * if you need to log something custom, such as `content_season_number`
     * or `player_name`, this can be included in the `customAttributes` object .
     *
     * These `customAttributes` are attributes unique to the media event
     * but can be passed through the `MediaSession` via the various log
     * functions as an `options` parameter.
     */
    var MediaEvent = /** @class */ (function (_super) {
        __extends(MediaEvent, _super);
        /**
         * Constructor for Media Event
         * @param type Type of action being performed, i.e. play, pause, seek, etc.
         * @param contentTitle Title of the Media Content
         * @param contentId Unique Identifier for the Media Content
         * @param duration Length of time for the Media Content
         * @param contentType Content Type. i.e. video vs audio
         * @param streamType Stream Type i.e. live vs on demand
         * @param mediaSessionID Session ID from media Session
         * @param customAttributes A dictionary of custom attributes
         * @returns An instance of a Media Event
         */
        function MediaEvent(eventType, contentTitle, contentId, duration, contentType, streamType, mediaSessionID, options) {
            if (options === void 0) { options = {}; }
            var _this = _super.call(this, getNameFromType(eventType), eventType, MessageType.Media) || this;
            _this.eventType = eventType;
            _this.contentTitle = contentTitle;
            _this.contentId = contentId;
            _this.duration = duration;
            _this.contentType = contentType;
            _this.streamType = streamType;
            _this.mediaSessionID = mediaSessionID;
            _this.options = options;
            _this.id = uuid();
            /**
             * @hidden Returns custom attributes
             */
            _this.getCustomAttributes = function () {
                return _this.options.customAttributes;
            };
            /**
             * @hidden Returns session related event attributes
             */
            _this.getSessionAttributes = function () {
                var sessionAttributes = {
                    content_title: _this.contentTitle,
                    content_duration: _this.duration,
                    content_id: _this.contentId,
                    content_type: MediaContentType[_this.contentType],
                    stream_type: MediaStreamType[_this.streamType],
                    media_session_id: _this.mediaSessionID,
                };
                if (typeof _this.playheadPosition === 'number') {
                    sessionAttributes[ValidMediaAttributeKeys.playheadPosition] =
                        _this.playheadPosition;
                }
                return sessionAttributes;
            };
            /**
             * @hidden Representation of the Media Event as a Custom Event
             */
            _this.getEventAttributes = function () {
                var eventAttributes = {};
                if (_this.seekPosition) {
                    eventAttributes[ValidMediaAttributeKeys.seekPosition] =
                        _this.seekPosition;
                }
                if (_this.bufferDuration) {
                    eventAttributes[ValidMediaAttributeKeys.bufferDuration] =
                        _this.bufferDuration;
                }
                if (_this.bufferPercent) {
                    eventAttributes[ValidMediaAttributeKeys.bufferPercent] =
                        _this.bufferPercent;
                }
                if (_this.bufferPosition) {
                    eventAttributes[ValidMediaAttributeKeys.bufferPosition] =
                        _this.bufferPosition;
                }
                // QoS
                if (_this.qos) {
                    if (typeof _this.qos.bitRate === 'number') {
                        eventAttributes[ValidMediaAttributeKeys.qosBitrate] =
                            _this.qos.bitRate;
                    }
                    if (typeof _this.qos.fps === 'number') {
                        eventAttributes[ValidMediaAttributeKeys.qosFramesPerSecond] =
                            _this.qos.fps;
                    }
                    if (typeof _this.qos.startupTime === 'number') {
                        eventAttributes[ValidMediaAttributeKeys.qosStartupTime] =
                            _this.qos.startupTime;
                    }
                    if (typeof _this.qos.droppedFrames === 'number') {
                        eventAttributes[ValidMediaAttributeKeys.qosDroppedFrames] =
                            _this.qos.droppedFrames;
                    }
                }
                // Ad Content
                if (_this.adContent) {
                    if (_this.adContent.title) {
                        eventAttributes[ValidMediaAttributeKeys.adTitle] =
                            _this.adContent.title;
                    }
                    if (_this.adContent.id) {
                        eventAttributes[ValidMediaAttributeKeys.adId] =
                            _this.adContent.id;
                    }
                    if (_this.adContent.advertiser) {
                        eventAttributes[ValidMediaAttributeKeys.adAdvertiserId] =
                            _this.adContent.advertiser;
                    }
                    if (_this.adContent.siteid) {
                        eventAttributes[ValidMediaAttributeKeys.adSiteId] =
                            _this.adContent.siteid;
                    }
                    if (typeof _this.adContent.placement === 'string') {
                        eventAttributes[ValidMediaAttributeKeys.adPlacement] =
                            _this.adContent.placement;
                    }
                    if (typeof _this.adContent.position === 'number') {
                        eventAttributes[ValidMediaAttributeKeys.adPosition] =
                            _this.adContent.position;
                    }
                    if (_this.adContent.duration) {
                        eventAttributes[ValidMediaAttributeKeys.adDuration] =
                            _this.adContent.duration;
                    }
                    if (_this.adContent.creative) {
                        eventAttributes[ValidMediaAttributeKeys.adCreative] =
                            _this.adContent.creative;
                    }
                    if (_this.adContent.campaign) {
                        eventAttributes[ValidMediaAttributeKeys.adCampaign] =
                            _this.adContent.campaign;
                    }
                }
                // Ad Break
                if (_this.adBreak) {
                    if (_this.adBreak.id) {
                        eventAttributes[ValidMediaAttributeKeys.adBreakId] =
                            _this.adBreak.id;
                    }
                    if (_this.adBreak.title) {
                        eventAttributes[ValidMediaAttributeKeys.adBreakTitle] =
                            _this.adBreak.title;
                    }
                    if (_this.adBreak.duration) {
                        eventAttributes[ValidMediaAttributeKeys.adBreakDuration] =
                            _this.adBreak.duration;
                    }
                }
                // Segments
                if (_this.segment) {
                    if (_this.segment.title) {
                        eventAttributes[ValidMediaAttributeKeys.segmentTitle] =
                            _this.segment.title;
                    }
                    if (_this.segment.index) {
                        eventAttributes[ValidMediaAttributeKeys.segmentIndex] =
                            _this.segment.index;
                    }
                    if (_this.segment.duration) {
                        eventAttributes[ValidMediaAttributeKeys.segmentDuration] =
                            _this.segment.duration;
                    }
                }
                return eventAttributes;
            };
            /**
             * Returns a dictionary of attributes
             * @returns Object
             */
            _this.getAttributes = function () {
                return __assign(__assign(__assign({}, _this.getSessionAttributes()), _this.getEventAttributes()), _this.getCustomAttributes());
            };
            /**
             * Representation of the Media Event as a Page Event for the core SDK
             * @returns Object
             */
            _this.toPageEvent = function () {
                return {
                    name: _this.name,
                    eventType: EventType.Media,
                    messageType: MessageType.PageEvent,
                    data: _this.getAttributes(),
                };
            };
            /**
             * @hidden Representation of the Media Event for the server model
             */
            _this.toEventAPIObject = function () {
                return {
                    // Core Event Attributes
                    EventName: _this.name,
                    EventCategory: _this.eventType,
                    EventDataType: _this.messageType,
                    AdContent: _this.adContent,
                    AdBreak: _this.adBreak,
                    Segment: _this.segment,
                    SeekPosition: _this.seekPosition,
                    BufferDuration: _this.bufferDuration,
                    BufferPercent: _this.bufferPercent,
                    BufferPosition: _this.bufferPosition,
                    PlayheadPosition: _this.playheadPosition,
                    QoS: _this.qos,
                    ContentTitle: _this.contentTitle,
                    ContentId: _this.contentId,
                    Duration: _this.duration,
                    ContentType: MediaContentType[_this.contentType],
                    StreamType: MediaStreamType[_this.streamType],
                    EventAttributes: _this.options.customAttributes,
                };
            };
            _this.playheadPosition = options === null || options === void 0 ? void 0 : options.currentPlayheadPosition;
            _this.customAttributes = options === null || options === void 0 ? void 0 : options.customAttributes;
            return _this;
        }
        return MediaEvent;
    }(BaseEvent));

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
            return new MediaEvent(eventType, this.title, this.contentId, this.duration, this.contentType, this.streamType, this.sessionId, options);
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
                if (event.eventType !== MediaEventType.UpdatePlayheadPosition) {
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
                content_type: MediaContentType[this.contentType],
                stream_type: MediaStreamType[this.streamType],
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
            this._sessionId = uuid();
            this.mediaSessionStartTimestamp = Date.now();
            var event = this.createMediaEvent(MediaEventType.SessionStart, options);
            this.logEvent(event);
        };
        /**
         * Ends your media session. Should be triggered after all ads and content have been completed
         * @param options Optional Custom Attributes
         * @category Media
         */
        MediaSession.prototype.logMediaSessionEnd = function (options) {
            var event = this.createMediaEvent(MediaEventType.SessionEnd, options);
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
            var event = this.createMediaEvent(MediaEventType.ContentEnd, options);
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
            var event = this.createMediaEvent(MediaEventType.AdBreakStart, options);
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
            var event = this.createMediaEvent(MediaEventType.AdBreakEnd, options);
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
            var event = this.createMediaEvent(MediaEventType.AdStart, options);
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
            var event = this.createMediaEvent(MediaEventType.AdEnd, options);
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
            var event = this.createMediaEvent(MediaEventType.AdSkip, options);
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
            var event = this.createMediaEvent(MediaEventType.AdClick, options);
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
            var event = this.createMediaEvent(MediaEventType.BufferStart, options);
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
            var event = this.createMediaEvent(MediaEventType.BufferEnd, options);
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
            var event = this.createMediaEvent(MediaEventType.Play, options);
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
            var event = this.createMediaEvent(MediaEventType.Pause, options);
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
            var event = this.createMediaEvent(MediaEventType.SegmentStart, options);
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
            var event = this.createMediaEvent(MediaEventType.SegmentEnd, options);
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
            var event = this.createMediaEvent(MediaEventType.SegmentSkip, options);
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
            var event = this.createMediaEvent(MediaEventType.SeekStart, options);
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
            var event = this.createMediaEvent(MediaEventType.SeekEnd, options);
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
            var event = this.createMediaEvent(MediaEventType.UpdatePlayheadPosition);
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
            var event = this.createMediaEvent(MediaEventType.UpdateQoS, options);
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
                eventType: EventType.Media,
                messageType: MessageType.PageEvent,
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
                customAttributes[ValidMediaAttributeKeys.mediaSessionIdKey] =
                    this.sessionId;
                customAttributes[ValidMediaAttributeKeys.startTimestampKey] =
                    this.mediaSessionStartTimestamp;
                customAttributes[ValidMediaAttributeKeys.endTimestampKey] =
                    this.mediaSessionEndTimestamp;
                customAttributes[ValidMediaAttributeKeys.contentIdKey] =
                    this.contentId;
                customAttributes[ValidMediaAttributeKeys.contentTitleKey] =
                    this.title;
                customAttributes[ValidMediaAttributeKeys.mediaTimeSpentKey] =
                    this.mediaTimeSpent();
                customAttributes[ValidMediaAttributeKeys.contentTimeSpentKey] =
                    this.mediaContentTimeSpent();
                customAttributes[ValidMediaAttributeKeys.contentCompleteKey] =
                    this.mediaContentComplete;
                customAttributes[ValidMediaAttributeKeys.totalSegmentsKey] =
                    this.mediaSessionSegmentTotal;
                customAttributes[ValidMediaAttributeKeys.totalAdTimeSpentKey] =
                    this.mediaTotalAdTimeSpent;
                customAttributes[ValidMediaAttributeKeys.adTimeSpentRateKey] =
                    this.mediaAdTimeSpentRate();
                customAttributes[ValidMediaAttributeKeys.totalAdsKey] =
                    this.mediaSessionAdTotal;
                customAttributes[ValidMediaAttributeKeys.adIDsKey] =
                    this.mediaSessionAdObjects;
                var options = {
                    currentPlayheadPosition: this.currentPlayheadPosition,
                    customAttributes: customAttributes,
                };
                var summaryEvent = this.createMediaEvent(MediaEventType.SessionSummary, options);
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
                customAttributes[ValidMediaAttributeKeys.mediaSessionIdKey] =
                    this.sessionId;
                customAttributes[ValidMediaAttributeKeys.contentId] =
                    this.contentId;
                customAttributes[ValidMediaAttributeKeys.segmentIndexKey] =
                    this.segment.index;
                customAttributes[ValidMediaAttributeKeys.segmentTitleKey] =
                    this.segment.title;
                customAttributes[ValidMediaAttributeKeys.segmentStartTimestampKey] =
                    this.segment.segmentStartTimestamp;
                customAttributes[ValidMediaAttributeKeys.segmentEndTimestampKey] =
                    this.segment.segmentEndTimestamp;
                customAttributes[ValidMediaAttributeKeys.segmentTimeSpentKey] =
                    this.segment.segmentEndTimestamp -
                        this.segment.segmentStartTimestamp;
                customAttributes[ValidMediaAttributeKeys.segmentSkippedKey] =
                    this.segment.segmentSkipped;
                customAttributes[ValidMediaAttributeKeys.segmentCompletedKey] =
                    this.segment.segmentCompleted;
                var options = {
                    currentPlayheadPosition: this.currentPlayheadPosition,
                    customAttributes: customAttributes,
                };
                var summaryEvent = this.createMediaEvent(MediaEventType.SegmentSummary, options);
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
                customAttributes[ValidMediaAttributeKeys.mediaSessionIdKey] =
                    this.sessionId;
                customAttributes[ValidMediaAttributeKeys.adBreakIdKey] =
                    (_a = this.adBreak) === null || _a === void 0 ? void 0 : _a.id;
                customAttributes[ValidMediaAttributeKeys.adContentIdKey] =
                    (_b = this.adContent) === null || _b === void 0 ? void 0 : _b.id;
                customAttributes[ValidMediaAttributeKeys.adContentStartTimestampKey] = (_c = this.adContent) === null || _c === void 0 ? void 0 : _c.adStartTimestamp;
                customAttributes[ValidMediaAttributeKeys.adContentEndTimestampKey] =
                    (_d = this.adContent) === null || _d === void 0 ? void 0 : _d.adEndTimestamp;
                customAttributes[ValidMediaAttributeKeys.adContentTitleKey] =
                    (_e = this.adContent) === null || _e === void 0 ? void 0 : _e.title;
                customAttributes[ValidMediaAttributeKeys.adContentSkippedKey] =
                    (_f = this.adContent) === null || _f === void 0 ? void 0 : _f.adSkipped;
                customAttributes[ValidMediaAttributeKeys.adContentCompletedKey] =
                    (_g = this.adContent) === null || _g === void 0 ? void 0 : _g.adCompleted;
                var options = {
                    currentPlayheadPosition: this.currentPlayheadPosition,
                    customAttributes: customAttributes,
                };
                var summaryEvent = this.createMediaEvent(MediaEventType.AdSummary, options);
                this.logEvent(summaryEvent);
            }
            this.adContent = undefined;
        };
        return MediaSession;
    }());

    return MediaSession;

})();

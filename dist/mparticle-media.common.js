'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

// This will live in a declaration file in core sdk
// once we set that up.
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Media"] = 20] = "Media";
})(MessageType || (MessageType = {}));
var MediaEventType;
(function (MediaEventType) {
    MediaEventType[MediaEventType["Play"] = 23] = "Play";
    MediaEventType[MediaEventType["Pause"] = 24] = "Pause";
    MediaEventType[MediaEventType["MediaContentEnd"] = 25] = "MediaContentEnd";
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
})(MediaEventType || (MediaEventType = {}));
var MediaContentType;
(function (MediaContentType) {
    MediaContentType[MediaContentType["Video"] = 0] = "Video";
    MediaContentType[MediaContentType["Audio"] = 1] = "Audio";
})(MediaContentType || (MediaContentType = {}));
var MediaStreamType;
(function (MediaStreamType) {
    MediaStreamType[MediaStreamType["LiveStream"] = 0] = "LiveStream";
    MediaStreamType[MediaStreamType["OnDemand"] = 1] = "OnDemand";
})(MediaStreamType || (MediaStreamType = {}));

var uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
var getNameFromType = function (type) {
    return MediaEventType[type];
};

/**
 * Represents a Base event for mParticle Core
 */
var BaseEvent = /** @class */ (function () {
    /**
     *
     * @param name The name of the event
     * @param type an Event Type that corresponds to [EventType](https://github.com/mParticle/mparticle-web-sdk/blob/master/src/types.js) in Core SDK
     * @param messageType A message type that corresponds to MessageType
     */
    function BaseEvent(name, type, messageType) {
        this.name = name;
        this.type = type;
        this.messageType = messageType;
        /**
         * @hidden Abstract representation of a Base Event for the Server model in Core SDK
         */
        this.toEventAPIObject = function () { };
    }
    return BaseEvent;
}());
/**
 * Represents a single media event. Generally you won't call this class directly. The Media SDK calls this class internally when you invoke methods on [[MediaSession]].
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
     * @param streamType Stream Type i.e. live vs on demaind
     * @returns An instance of a Media Event
     */
    function MediaEvent(type, contentTitle, contentId, duration, contentType, streamType) {
        var _this = _super.call(this, getNameFromType(type), type, MessageType.Media) || this;
        _this.type = type;
        _this.contentTitle = contentTitle;
        _this.contentId = contentId;
        _this.duration = duration;
        _this.contentType = contentType;
        _this.streamType = streamType;
        _this.id = uuid();
        /**
         * @hidden Representation of the Media Event for the server model
         */
        _this.toEventAPIObject = function () {
            return {
                // Core Event Attributes
                EventName: _this.name,
                EventCategory: _this.type,
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
            };
        };
        return _this;
    }
    return MediaEvent;
}(BaseEvent));

/**
 * The MediaSession class is the primary class that will be used to engage with the mParticle Media SDK.
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
     */
    function MediaSession(mparticleInstance, contentId, title, duration, contentType, streamType) {
        this.mparticleInstance = mparticleInstance;
        this.contentId = contentId;
        this.title = title;
        this.duration = duration;
        this.contentType = contentType;
        this.streamType = streamType;
        this.sessionID = '';
        this.droppedFrames = 0;
        this.currentPlayheadPosition = 0;
        this.currentFramesPerSecond = 0;
    }
    /**
     * Logs number of frames that have been dropped by the player
     * @param dropped Number of frames dropped
     * @category Quality of Service
     */
    MediaSession.prototype.logDroppedFrames = function (dropped) {
        this.droppedFrames += dropped;
    };
    /**
     * Starts your media session. Should be triggered before any prerolls or ads
     * @category Media
     */
    MediaSession.prototype.logMediaSessionStart = function () {
        this.sessionID = uuid();
        var event = new MediaEvent(MediaEventType.SessionStart, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Ends your media session. Should be the method thing triggered, after all ads and content have been completed
     * @category Media
     */
    MediaSession.prototype.logMediaSessionEnd = function () {
        var event = new MediaEvent(MediaEventType.SessionEnd, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs when your media content has ended, usually before a post-roll ad.
     * Must be fired between MediaSessionStart and MediaSessionEnd
     * @category Media
     */
    MediaSession.prototype.logMediaContentEnd = function () {
        var event = new MediaEvent(MediaEventType.MediaContentEnd, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs when an Ad Break pod has started
     * @param adBreakContent An object representing an [[AdBreak]] (collection of ads)
     * @category Advertising
     */
    MediaSession.prototype.logAdBreakStart = function (adBreakContent) {
        this.adBreak = adBreakContent;
        var event = new MediaEvent(MediaEventType.AdBreakStart, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.adBreak = adBreakContent;
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs when an [[AdBreak]] pod has ended
     * @category Advertising
     */
    MediaSession.prototype.logAdBreakEnd = function () {
        var event = new MediaEvent(MediaEventType.AdBreakEnd, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.adBreak = this.adBreak;
        this.mparticleInstance.logBaseEvent(event);
        this.adBreak = undefined;
    };
    /**
     * Logs when a single ad plays
     * @param adContent An object representing a single Ad
     * @category Advertising
     */
    MediaSession.prototype.logAdStart = function (adContent) {
        this.adContent = adContent;
        var event = new MediaEvent(MediaEventType.AdStart, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.adContent = adContent;
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs when a single ad ends
     * @category Advertising
     */
    MediaSession.prototype.logAdEnd = function () {
        var event = new MediaEvent(MediaEventType.AdEnd, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.adContent = this.adContent;
        this.mparticleInstance.logBaseEvent(event);
        this.adContent = undefined;
    };
    /**
     * Logs when a single ad is skipped by a visitor
     * @category Advertising
     */
    MediaSession.prototype.logAdSkip = function () {
        var event = new MediaEvent(MediaEventType.AdSkip, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.adContent = this.adContent;
        this.mparticleInstance.logBaseEvent(event);
        this.adContent = undefined;
    };
    /**
     * Logs when a single ad is clicked on by a visitor
     * @category Advertising
     */
    MediaSession.prototype.logAdClick = function (adContent) {
        this.adContent = adContent;
        var event = new MediaEvent(MediaEventType.AdClick, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.adContent = this.adContent;
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs the start of a buffering event
     * @param bufferDuration The duration of a buffering event
     * @param bufferPercent The percent that has been buffered
     * @param bufferPosition The playhead position of the buffering event
     * @category Buffering
     */
    MediaSession.prototype.logBufferStart = function (bufferDuration, bufferPercent, bufferPosition) {
        var event = new MediaEvent(MediaEventType.BufferStart, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.bufferDuration = bufferDuration;
        event.bufferPercent = bufferPercent;
        event.bufferPosition = bufferPosition;
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs the end of a buffering event
     * @param bufferDuration The duration of a buffering event
     * @param bufferPercent The percent that has been buffered
     * @param bufferPosition The playhead position of the buffering event
     * @category Buffering
     */
    MediaSession.prototype.logBufferEnd = function (bufferDuration, bufferPercent, bufferPosition) {
        var event = new MediaEvent(MediaEventType.BufferEnd, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.bufferDuration = bufferDuration;
        event.bufferPercent = bufferPercent;
        event.bufferPosition = bufferPosition;
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs a play event
     * @category Media
     */
    MediaSession.prototype.logPlay = function () {
        var event = new MediaEvent(MediaEventType.Play, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs a pause event
     * @category Media
     */
    MediaSession.prototype.logPause = function () {
        var event = new MediaEvent(MediaEventType.Pause, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs the start of a Segment or Chapter
     * @param segment An object representing a segment or chapter of content
     * @category Media
     */
    MediaSession.prototype.logSegmentStart = function (segment) {
        var event = new MediaEvent(MediaEventType.SegmentStart, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.segment = segment;
        this.mparticleInstance.logBaseEvent(event);
        this.segment = segment;
    };
    /**
     * Logs the end of a Segment or Chapter
     * @category Media
     */
    MediaSession.prototype.logSegmentEnd = function () {
        var event = new MediaEvent(MediaEventType.SegmentEnd, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.segment = this.segment;
        this.mparticleInstance.logBaseEvent(event);
        this.segment = undefined;
    };
    /**
     * Logs when a visitor skips a Segment or Chapter
     * @category Media
     */
    MediaSession.prototype.logSegmentSkip = function () {
        var event = new MediaEvent(MediaEventType.SegmentSkip, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.segment = this.segment;
        this.mparticleInstance.logBaseEvent(event);
        this.segment = undefined;
    };
    /**
     * Logs when a visitor starts seeking
     * @param seekPosition the desired playhead position
     * @category Media
     */
    MediaSession.prototype.logSeekStart = function (seekPosition) {
        var event = new MediaEvent(MediaEventType.SeekStart, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.seekPosition = seekPosition;
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs when a visitor stops seeking
     * @param seekPosition the desired playhead position
     * @category Media
     */
    MediaSession.prototype.logSeekEnd = function (seekPosition) {
        var event = new MediaEvent(MediaEventType.SeekEnd, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.seekPosition = seekPosition;
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs when the playhead position is updated
     * @param playheadPosition The updated playhead position
     * @category Media
     */
    MediaSession.prototype.logPlayheadPosition = function (playheadPosition) {
        this.currentPlayheadPosition = playheadPosition;
        var event = new MediaEvent(MediaEventType.UpdatePlayheadPosition, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.playheadPosition = playheadPosition;
        this.mparticleInstance.logBaseEvent(event);
    };
    /**
     * Logs an update in the Quality of Service
     * @param qos An object representing QoS
     * @category Quality of Service
     */
    MediaSession.prototype.logQoS = function (qos) {
        var event = new MediaEvent(MediaEventType.UpdateQoS, this.title, this.contentId, this.duration, this.contentType, this.streamType);
        event.qos = qos;
        this.mparticleInstance.logBaseEvent(event);
    };
    return MediaSession;
}());

module.exports = MediaSession;

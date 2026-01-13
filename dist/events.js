"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.MediaEvent = exports.BaseEvent = void 0;
var types_1 = require("./types");
var utils_1 = require("./utils");
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
exports.BaseEvent = BaseEvent;
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
        var _this = _super.call(this, (0, utils_1.getNameFromType)(eventType), eventType, types_1.MessageType.Media) || this;
        _this.eventType = eventType;
        _this.contentTitle = contentTitle;
        _this.contentId = contentId;
        _this.duration = duration;
        _this.contentType = contentType;
        _this.streamType = streamType;
        _this.mediaSessionID = mediaSessionID;
        _this.options = options;
        _this.id = (0, utils_1.uuid)();
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
                content_type: types_1.MediaContentType[_this.contentType],
                stream_type: types_1.MediaStreamType[_this.streamType],
                media_session_id: _this.mediaSessionID,
            };
            if (typeof _this.playheadPosition === 'number') {
                sessionAttributes[types_1.ValidMediaAttributeKeys.playheadPosition] =
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
                eventAttributes[types_1.ValidMediaAttributeKeys.seekPosition] =
                    _this.seekPosition;
            }
            if (_this.bufferDuration) {
                eventAttributes[types_1.ValidMediaAttributeKeys.bufferDuration] =
                    _this.bufferDuration;
            }
            if (_this.bufferPercent) {
                eventAttributes[types_1.ValidMediaAttributeKeys.bufferPercent] =
                    _this.bufferPercent;
            }
            if (_this.bufferPosition) {
                eventAttributes[types_1.ValidMediaAttributeKeys.bufferPosition] =
                    _this.bufferPosition;
            }
            // QoS
            if (_this.qos) {
                if (typeof _this.qos.bitRate === 'number') {
                    eventAttributes[types_1.ValidMediaAttributeKeys.qosBitrate] =
                        _this.qos.bitRate;
                }
                if (typeof _this.qos.fps === 'number') {
                    eventAttributes[types_1.ValidMediaAttributeKeys.qosFramesPerSecond] =
                        _this.qos.fps;
                }
                if (typeof _this.qos.startupTime === 'number') {
                    eventAttributes[types_1.ValidMediaAttributeKeys.qosStartupTime] =
                        _this.qos.startupTime;
                }
                if (typeof _this.qos.droppedFrames === 'number') {
                    eventAttributes[types_1.ValidMediaAttributeKeys.qosDroppedFrames] =
                        _this.qos.droppedFrames;
                }
            }
            // Ad Content
            if (_this.adContent) {
                if (_this.adContent.title) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adTitle] =
                        _this.adContent.title;
                }
                if (_this.adContent.id) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adId] =
                        _this.adContent.id;
                }
                if (_this.adContent.advertiser) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adAdvertiserId] =
                        _this.adContent.advertiser;
                }
                if (_this.adContent.siteid) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adSiteId] =
                        _this.adContent.siteid;
                }
                if (typeof _this.adContent.placement === 'string') {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adPlacement] =
                        _this.adContent.placement;
                }
                if (typeof _this.adContent.position === 'number') {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adPosition] =
                        _this.adContent.position;
                }
                if (_this.adContent.duration) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adDuration] =
                        _this.adContent.duration;
                }
                if (_this.adContent.creative) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adCreative] =
                        _this.adContent.creative;
                }
                if (_this.adContent.campaign) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adCampaign] =
                        _this.adContent.campaign;
                }
            }
            // Ad Break
            if (_this.adBreak) {
                if (_this.adBreak.id) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adBreakId] =
                        _this.adBreak.id;
                }
                if (_this.adBreak.title) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adBreakTitle] =
                        _this.adBreak.title;
                }
                if (_this.adBreak.duration) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.adBreakDuration] =
                        _this.adBreak.duration;
                }
            }
            // Segments
            if (_this.segment) {
                if (_this.segment.title) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.segmentTitle] =
                        _this.segment.title;
                }
                if (_this.segment.index) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.segmentIndex] =
                        _this.segment.index;
                }
                if (_this.segment.duration) {
                    eventAttributes[types_1.ValidMediaAttributeKeys.segmentDuration] =
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
                eventType: types_1.EventType.Media,
                messageType: types_1.MessageType.PageEvent,
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
                ContentType: types_1.MediaContentType[_this.contentType],
                StreamType: types_1.MediaStreamType[_this.streamType],
                EventAttributes: _this.options.customAttributes,
            };
        };
        _this.playheadPosition = options === null || options === void 0 ? void 0 : options.currentPlayheadPosition;
        _this.customAttributes = options === null || options === void 0 ? void 0 : options.customAttributes;
        return _this;
    }
    return MediaEvent;
}(BaseEvent));
exports.MediaEvent = MediaEvent;

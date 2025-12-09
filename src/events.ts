import {
    MediaContentType,
    MediaStreamType,
    MediaEventType,
    MessageType,
    AdContent,
    EventAPIObject,
    Segment,
    AdBreak,
    QoS,
    ModelAttributes,
    EventType,
    PageEventObject,
    ValidMediaAttributeKeys,
    Options,
} from './types';

import { getNameFromType, uuid } from './utils';

/**
 * Represents a Base event for mParticle Core
 */

export abstract class BaseEvent {
    /**
     *
     * @param name The name of the event
     * @param eventType an Event Type that corresponds to [EventType](https://github.com/mParticle/mparticle-web-sdk/blob/master/src/types.js) in Core SDK
     * @param messageType A message type that corresponds to MessageType
     */
    constructor(
        public name: string,
        public eventType: number,
        public messageType: MessageType,
    ) {}

    /**
     * @hidden Abstract representation of a Base Event for the Server model in Core SDK
     */

    abstract toEventAPIObject(): EventAPIObject;
}

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
export class MediaEvent extends BaseEvent {
    id: string = uuid();

    adContent?: AdContent;
    adBreak?: AdBreak;
    segment?: Segment;
    seekPosition?: number;
    bufferDuration?: number;
    bufferPercent?: number;
    bufferPosition?: number;
    playheadPosition?: number;
    customAttributes?: ModelAttributes;
    qos?: QoS;

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
    constructor(
        public eventType: MediaEventType,
        public contentTitle: string,
        public contentId: string,
        public duration: number,
        readonly contentType: MediaContentType,
        readonly streamType: MediaStreamType,
        readonly mediaSessionID: string,
        public options: Options = {},
    ) {
        super(getNameFromType(eventType), eventType, MessageType.Media);

        this.playheadPosition = options?.currentPlayheadPosition;
        this.customAttributes = options?.customAttributes;
    }

    /**
     * @hidden Returns custom attributes
     */
    getCustomAttributes = () => {
        return this.options.customAttributes;
    };

    /**
     * @hidden Returns session related event attributes
     */
    getSessionAttributes = () => {
        const sessionAttributes: { [key: string]: string | number } = {
            content_title: this.contentTitle,
            content_duration: this.duration,
            content_id: this.contentId,
            content_type: MediaContentType[this.contentType],
            stream_type: MediaStreamType[this.streamType],
            media_session_id: this.mediaSessionID,
        };

        if (typeof this.playheadPosition === 'number') {
            sessionAttributes[ValidMediaAttributeKeys.playheadPosition] =
                this.playheadPosition;
        }

        return sessionAttributes;
    };

    /**
     * @hidden Representation of the Media Event as a Custom Event
     */
    getEventAttributes = (): ModelAttributes => {
        const eventAttributes: { [key: string]: string | number } = {};

        if (this.seekPosition) {
            eventAttributes[ValidMediaAttributeKeys.seekPosition] =
                this.seekPosition;
        }

        if (this.bufferDuration) {
            eventAttributes[ValidMediaAttributeKeys.bufferDuration] =
                this.bufferDuration;
        }

        if (this.bufferPercent) {
            eventAttributes[ValidMediaAttributeKeys.bufferPercent] =
                this.bufferPercent;
        }

        if (this.bufferPosition) {
            eventAttributes[ValidMediaAttributeKeys.bufferPosition] =
                this.bufferPosition;
        }

        // QoS
        if (this.qos) {
            if (typeof this.qos.bitRate === 'number') {
                eventAttributes[ValidMediaAttributeKeys.qosBitrate] =
                    this.qos.bitRate;
            }
            if (typeof this.qos.fps === 'number') {
                eventAttributes[ValidMediaAttributeKeys.qosFramesPerSecond] =
                    this.qos.fps;
            }
            if (typeof this.qos.startupTime === 'number') {
                eventAttributes[ValidMediaAttributeKeys.qosStartupTime] =
                    this.qos.startupTime;
            }
            if (typeof this.qos.droppedFrames === 'number') {
                eventAttributes[ValidMediaAttributeKeys.qosDroppedFrames] =
                    this.qos.droppedFrames;
            }
        }

        // Ad Content
        if (this.adContent) {
            if (this.adContent.title) {
                eventAttributes[ValidMediaAttributeKeys.adTitle] =
                    this.adContent.title;
            }
            if (this.adContent.id) {
                eventAttributes[ValidMediaAttributeKeys.adId] =
                    this.adContent.id;
            }
            if (this.adContent.advertiser) {
                eventAttributes[ValidMediaAttributeKeys.adAdvertiserId] =
                    this.adContent.advertiser;
            }
            if (this.adContent.siteid) {
                eventAttributes[ValidMediaAttributeKeys.adSiteId] =
                    this.adContent.siteid;
            }
            if (typeof this.adContent.placement === 'string') {
                eventAttributes[ValidMediaAttributeKeys.adPlacement] =
                    this.adContent.placement;
            }
            if (typeof this.adContent.position === 'number') {
                eventAttributes[ValidMediaAttributeKeys.adPosition] =
                    this.adContent.position;
            }
            if (this.adContent.duration) {
                eventAttributes[ValidMediaAttributeKeys.adDuration] =
                    this.adContent.duration;
            }
            if (this.adContent.creative) {
                eventAttributes[ValidMediaAttributeKeys.adCreative] =
                    this.adContent.creative;
            }
            if (this.adContent.campaign) {
                eventAttributes[ValidMediaAttributeKeys.adCampaign] =
                    this.adContent.campaign;
            }
        }

        // Ad Break
        if (this.adBreak) {
            if (this.adBreak.id) {
                eventAttributes[ValidMediaAttributeKeys.adBreakId] =
                    this.adBreak.id;
            }
            if (this.adBreak.title) {
                eventAttributes[ValidMediaAttributeKeys.adBreakTitle] =
                    this.adBreak.title;
            }
            if (this.adBreak.duration) {
                eventAttributes[ValidMediaAttributeKeys.adBreakDuration] =
                    this.adBreak.duration;
            }
        }

        // Segments
        if (this.segment) {
            if (this.segment.title) {
                eventAttributes[ValidMediaAttributeKeys.segmentTitle] =
                    this.segment.title;
            }

            if (this.segment.index) {
                eventAttributes[ValidMediaAttributeKeys.segmentIndex] =
                    this.segment.index;
            }

            if (this.segment.duration) {
                eventAttributes[ValidMediaAttributeKeys.segmentDuration] =
                    this.segment.duration;
            }
        }

        return eventAttributes;
    };

    /**
     * Returns a dictionary of attributes
     * @returns Object
     */
    getAttributes = (): ModelAttributes => {
        return {
            ...this.getSessionAttributes(),
            ...this.getEventAttributes(),
            ...this.getCustomAttributes(),
        };
    };

    /**
     * Representation of the Media Event as a Page Event for the core SDK
     * @returns Object
     */
    toPageEvent = (): PageEventObject => {
        return {
            name: this.name,
            eventType: EventType.Media,
            messageType: MessageType.PageEvent,
            data: this.getAttributes(),
        };
    };

    /**
     * @hidden Representation of the Media Event for the server model
     */
    toEventAPIObject = (): EventAPIObject => {
        return {
            // Core Event Attributes
            EventName: this.name,
            EventCategory: this.eventType,
            EventDataType: this.messageType,

            AdContent: this.adContent,
            AdBreak: this.adBreak,
            Segment: this.segment,
            SeekPosition: this.seekPosition,
            BufferDuration: this.bufferDuration,
            BufferPercent: this.bufferPercent,
            BufferPosition: this.bufferPosition,
            PlayheadPosition: this.playheadPosition,
            QoS: this.qos,
            ContentTitle: this.contentTitle,
            ContentId: this.contentId,
            Duration: this.duration,
            ContentType: MediaContentType[this.contentType],
            StreamType: MediaStreamType[this.streamType],

            EventAttributes: this.options.customAttributes,
        };
    };
}

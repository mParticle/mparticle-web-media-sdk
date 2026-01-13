import { MediaContentType, MediaStreamType, MediaEventType, MessageType, AdContent, EventAPIObject, Segment, AdBreak, QoS, ModelAttributes, PageEventObject, Options } from './types';
/**
 * Represents a Base event for mParticle Core
 */
export declare abstract class BaseEvent {
    name: string;
    eventType: number;
    messageType: MessageType;
    /**
     *
     * @param name The name of the event
     * @param eventType an Event Type that corresponds to [EventType](https://github.com/mParticle/mparticle-web-sdk/blob/master/src/types.js) in Core SDK
     * @param messageType A message type that corresponds to MessageType
     */
    constructor(name: string, eventType: number, messageType: MessageType);
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
export declare class MediaEvent extends BaseEvent {
    eventType: MediaEventType;
    contentTitle: string;
    contentId: string;
    duration: number;
    readonly contentType: MediaContentType;
    readonly streamType: MediaStreamType;
    readonly mediaSessionID: string;
    options: Options;
    id: string;
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
    constructor(eventType: MediaEventType, contentTitle: string, contentId: string, duration: number, contentType: MediaContentType, streamType: MediaStreamType, mediaSessionID: string, options?: Options);
    /**
     * @hidden Returns custom attributes
     */
    getCustomAttributes: () => Record<string, any> | undefined;
    /**
     * @hidden Returns session related event attributes
     */
    getSessionAttributes: () => {
        [key: string]: string | number;
    };
    /**
     * @hidden Representation of the Media Event as a Custom Event
     */
    getEventAttributes: () => ModelAttributes;
    /**
     * Returns a dictionary of attributes
     * @returns Object
     */
    getAttributes: () => ModelAttributes;
    /**
     * Representation of the Media Event as a Page Event for the core SDK
     * @returns Object
     */
    toPageEvent: () => PageEventObject;
    /**
     * @hidden Representation of the Media Event for the server model
     */
    toEventAPIObject: () => EventAPIObject;
}

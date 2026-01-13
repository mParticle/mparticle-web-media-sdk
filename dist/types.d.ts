import { MediaEvent } from './events';
/**
 * @hidden
 */
export type MpSDKInstance = {
    logBaseEvent(event: any): void;
    logger(message: string): void;
};
export declare enum MessageType {
    PageEvent = 4,
    Media = 20
}
export declare enum EventType {
    Media = 9
}
export declare enum MediaEventType {
    Play = 23,
    Pause = 24,
    ContentEnd = 25,
    SessionStart = 30,
    SessionEnd = 31,
    SeekStart = 32,
    SeekEnd = 33,
    BufferStart = 34,
    BufferEnd = 35,
    UpdatePlayheadPosition = 36,
    AdClick = 37,
    AdBreakStart = 38,
    AdBreakEnd = 39,
    AdStart = 40,
    AdEnd = 41,
    AdSkip = 42,
    SegmentStart = 43,
    SegmentEnd = 44,
    SegmentSkip = 45,
    UpdateQoS = 46,
    SessionSummary = 47,
    SegmentSummary = 48,
    AdSummary = 49
}
export declare const MediaEventName: {
    [key: string]: string;
};
/**
 * Represents a single Ad Break
 */
export type AdBreak = {
    title: string;
    /**
     * Unique ID for the Ad Break
     */
    id: string;
    /**
     * Length of time of the complete ad break
     */
    duration: number;
};
/**
 * Represents a single Ad
 */
export type AdContent = {
    title: string;
    /**
     * Unique ID for the Ad
     */
    id: string;
    /**
     * Length of time of the complete ad
     */
    duration: number;
    /**
     * Name of Advertisor
     */
    advertiser?: string;
    /**
     * Name of Ad Campaign
     */
    campaign?: string;
    /**
     * Name of the creative. i.e. name of ad video
     */
    creative?: string;
    /**
     * Name of placement. i.e. main-video-01 or featured-video-widget
     */
    placement?: string;
    /**
     * Position Index Number.
     */
    position?: number;
    /**
     * Identifier for the site the ad lives on
     */
    siteid?: string;
    /**
     * Timestamp for Ad start playback
     */
    adStartTimestamp?: number;
    /**
     * Timestamp for Ad end playback
     */
    adEndTimestamp?: number;
    /**
     * Flag for if the Ad was skipped
     */
    adSkipped?: boolean;
    /**
     * Flag for if the Ad was completed
     */
    adCompleted?: boolean;
};
export declare enum MediaContentType {
    Video = "Video",
    Audio = "Audio"
}
export declare enum MediaStreamType {
    LiveStream = "LiveStream",
    OnDemand = "OnDemand",
    Linear = "Linear",
    Podcast = "Podcast",
    Audiobook = "Audiobook"
}
/**
 * Page Event Representation
 */
export type PageEventObject = {
    name: string;
    eventType: number;
    messageType: number;
    data: ModelAttributes;
};
/**
 * Server Representation of an Event
 */
export type EventAPIObject = {
    /**
     *  The name of the event or a valid [[MessageType]]
     */
    EventName: string | number;
    /**
     * Corresponds to [[EventType]] in Core SDK
     */
    EventCategory: number;
    /**
     * Corresponds to [[MessageType]]
     */
    EventDataType: number;
    /**
     * A nested object of custom event attributes
     */
    EventAttributes?: ModelAttributes;
    /**
     * @hidden
     */
    [key: string]: any;
};
/**
 * Valid attributes for a Model
 */
export interface ModelAttributes {
    [key: string]: string | number;
}
/**
 * Valid attributes for Options
 */
export interface Options {
    currentPlayheadPosition?: number;
    customAttributes?: Record<string, any>;
}
/**
 * Valid attributes for Media Content
 */
export type MediaAttributes = {
    mediaContent?: MediaContent;
};
export declare const ValidMediaAttributeKeys: {
    [key: string]: string;
};
/**
 * Represents a single track or piece of Content
 */
export type MediaContent = {
    /**
     * Title of content
     */
    title: string;
    /**
     * Unique ID for content
     */
    contentId: string;
    /**
     * Length of time for content
     */
    duration: number;
    /**
     * Content Type. i.e. video vs audio
     */
    contentType: MediaContentType;
    /**
     * Stream Type i.e. live vs on demaind
     */
    streamType: MediaStreamType;
};
/**
 * Represents current Quality of Service for a the media session
 */
export type QoS = {
    /**
     * Start up time of the player from init to first frame
     */
    startupTime?: number;
    /**
     * Number of dropped frames
     */
    droppedFrames?: number;
    /**
     * Current bit rate
     */
    bitRate?: number;
    /**
     * Current frames per second speed
     */
    fps?: number;
};
/**
 * Represents a chapter or segment of content
 */
export type Segment = {
    /**
     * The title of the segment or chapter
     */
    title: string;
    /**
     * Position or sequence number (starting at 0) of the segment, i.e. chapter 2 of 5
     */
    index: number;
    /**
     * Length of time of the segment
     */
    duration: number;
    /**
     * Timestamp for Segment start playback
     */
    segmentStartTimestamp?: number;
    /**
     * Timestamp for Segment end playback
     */
    segmentEndTimestamp?: number;
    /**
     * Flag for if the Sement was skipped
     */
    segmentSkipped?: boolean;
    /**
     * Flag for if the Segment was completed
     */
    segmentCompleted?: boolean;
};
/**
 * A callback function with a [[MediaEvent]]
 */
export type MediaEventCallback = {
    (event: MediaEvent): void;
};

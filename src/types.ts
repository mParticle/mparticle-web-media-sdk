// This will live in a declaration file in core sdk
// once we set that up.

import { MediaEvent } from './events';

/**
 * @hidden
 */
export type MpSDKInstance = {
    // tslint:disable-next-line: no-any
    logBaseEvent(event: any): void;
    logger(message: string): void;
};

export enum MessageType {
    PageEvent = 4,
    Media = 20,
}

export enum EventType {
    Media = 9,
}

export enum MediaEventType {
    Play = 23,
    Pause = 24,
    MediaContentEnd = 25,
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
}

export const MediaEventName: { [key: string]: string } = {
    Play: 'Play',
    Pause: 'Pause',
    MediaContentEnd: 'Media Content End',
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
};

/**
 * Represents a single Ad Break
 */
export type AdBreak = {
    /*
     * Title of the Ad Break, i.e. pre-roll, mid-roll, etc.
     */
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
    /*
     * Title of the Ad
     */
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
};

export enum MediaContentType {
    Video = 'Video',
    Audio = 'Audio',
}

export enum MediaStreamType {
    LiveStream = 'LiveStream',
    OnDemand = 'OnDemand',
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
    // tslint:disable-next-line: no-any
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
    // tslint:disable-next-line: no-any
    customAttributes?: Record<string, any>;
}

/**
 * Valid attributes for Media Content
 */
export type MediaAttributes = {
    mediaContent?: MediaContent;
};

export const ValidMediaAttributeKeys: { [key: string]: string } = {
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
};

/**
 * A callback function with a [[MediaEvent]]
 */
export type MediaEventCallback = {
    (event: MediaEvent): void;
};

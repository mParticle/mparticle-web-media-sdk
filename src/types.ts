// This will live in a declaration file in core sdk
// once we set that up.

import { MediaEvent } from './events';

/**
 * @hidden
 */
export type MpSDKInstance = {
    logBaseEvent(eventName: MediaEvent): void;
    logger(message: string): void;
};

export enum MessageType {
    Media = 20,
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
    placement?: number;
    /**
     * Identifier for the site the ad lives on
     */
    siteid?: string;
};

export enum MediaContentType {
    Video,
    Audio,
}

export enum MediaStreamType {
    LiveStream,
    OnDemand,
}

/**
 * Valid attributes for Media Content
 */
export type MediaAttributes = {
    mediaContent?: MediaContent;
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

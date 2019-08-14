import { BaseEvent, MediaEvent } from './events';
import {
    AdBreak,
    AdContent,
    MediaContentType,
    MediaStreamType,
    Segment,
    MediaEventType,
    MpSDKInstance,
    QoS,
} from './types';

import { uuid } from './utils';

/**
 * The MediaSession class is the primary class that will be used to engage with the mParticle Media SDK.
 */
export default class MediaSession {
    adBreak?: AdBreak;
    adContent?: AdContent;
    segment?: Segment;

    private sessionID = '';
    private droppedFrames = 0;
    private currentPlayheadPosition = 0;
    private currentFramesPerSecond = 0;

    /**
     * Initializes the Media Session object. This does not start a session, you can do so by calling `logMediaSessionStart`.
     * @param mparticleInstance Your mParticle global object
     * @param contentId A unique identifier for your media content
     * @param title The title of your media content
     * @param duration The length of time for the complete media content (not including ads or breaks)
     * @param contentType A descriptor for the type of content, i.e. Audio or Video
     * @param streamType A descriptor for the type of stream, i.e. live or on demand
     */
    constructor(
        readonly mparticleInstance: MpSDKInstance,
        readonly contentId: string,
        readonly title: string,
        public duration: number,
        readonly contentType: MediaContentType,
        readonly streamType: MediaStreamType
    ) {}

    /**
     * Logs number of frames that have been dropped by the player
     * @param dropped Number of frames dropped
     * @category Quality of Service
     */
    logDroppedFrames(dropped: number) {
        this.droppedFrames += dropped;
    }

    /**
     * Starts your media session. Should be triggered before any prerolls or ads
     * @category Media
     */
    logMediaSessionStart() {
        this.sessionID = uuid();

        const event = new MediaEvent(
            MediaEventType.SessionStart,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );

        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Ends your media session. Should be the method thing triggered, after all ads and content have been completed
     * @category Media
     */
    logMediaSessionEnd() {
        const event = new MediaEvent(
            MediaEventType.SessionEnd,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );

        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs when your media content has ended, usually before a post-roll ad.
     * Must be fired between MediaSessionStart and MediaSessionEnd
     * @category Media
     */
    logMediaContentEnd() {
        const event = new MediaEvent(
            MediaEventType.MediaContentEnd,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );

        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs when an Ad Break pod has started
     * @param adBreakContent An object representing an [[AdBreak]] (collection of ads)
     * @category Advertising
     */
    logAdBreakStart(adBreakContent: AdBreak) {
        this.adBreak = adBreakContent;

        const event = new MediaEvent(
            MediaEventType.AdBreakStart,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );

        event.adBreak = adBreakContent;

        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs when an [[AdBreak]] pod has ended
     * @category Advertising
     */
    logAdBreakEnd() {
        const event = new MediaEvent(
            MediaEventType.AdBreakEnd,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );
        event.adBreak = this.adBreak;

        this.mparticleInstance.logBaseEvent(event);
        this.adBreak = undefined;
    }

    /**
     * Logs when a single ad plays
     * @param adContent An object representing a single Ad
     * @category Advertising
     */
    logAdStart(adContent: AdContent) {
        this.adContent = adContent;

        const event = new MediaEvent(
            MediaEventType.AdStart,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );
        event.adContent = adContent;

        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs when a single ad ends
     * @category Advertising
     */
    logAdEnd() {
        const event = new MediaEvent(
            MediaEventType.AdEnd,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );
        event.adContent = this.adContent;

        this.mparticleInstance.logBaseEvent(event);
        this.adContent = undefined;
    }

    /**
     * Logs when a single ad is skipped by a visitor
     * @category Advertising
     */
    logAdSkip() {
        const event = new MediaEvent(
            MediaEventType.AdSkip,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );
        event.adContent = this.adContent;

        this.mparticleInstance.logBaseEvent(event);
        this.adContent = undefined;
    }

    /**
     * Logs when a single ad is clicked on by a visitor
     * @category Advertising
     */
    logAdClick(adContent: AdContent) {
        this.adContent = adContent;
        const event = new MediaEvent(
            MediaEventType.AdClick,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );
        event.adContent = this.adContent;

        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs the start of a buffering event
     * @param bufferDuration The duration of a buffering event
     * @param bufferPercent The percent that has been buffered
     * @param bufferPosition The playhead position of the buffering event
     * @category Buffering
     */
    logBufferStart(
        bufferDuration: number,
        bufferPercent: number,
        bufferPosition: number
    ) {
        const event = new MediaEvent(
            MediaEventType.BufferStart,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );

        event.bufferDuration = bufferDuration;
        event.bufferPercent = bufferPercent;
        event.bufferPosition = bufferPosition;

        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs the end of a buffering event
     * @param bufferDuration The duration of a buffering event
     * @param bufferPercent The percent that has been buffered
     * @param bufferPosition The playhead position of the buffering event
     * @category Buffering
     */
    logBufferEnd(
        bufferDuration: number,
        bufferPercent: number,
        bufferPosition: number
    ) {
        const event = new MediaEvent(
            MediaEventType.BufferEnd,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );

        event.bufferDuration = bufferDuration;
        event.bufferPercent = bufferPercent;
        event.bufferPosition = bufferPosition;

        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs a play event
     * @category Media
     */
    logPlay() {
        const event = new MediaEvent(
            MediaEventType.Play,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );
        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs a pause event
     * @category Media
     */
    logPause() {
        const event = new MediaEvent(
            MediaEventType.Pause,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );
        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs the start of a Segment or Chapter
     * @param segment An object representing a segment or chapter of content
     * @category Media
     */
    logSegmentStart(segment: Segment) {
        const event = new MediaEvent(
            MediaEventType.SegmentStart,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );

        event.segment = segment;

        this.mparticleInstance.logBaseEvent(event);
        this.segment = segment;
    }

    /**
     * Logs the end of a Segment or Chapter
     * @category Media
     */
    logSegmentEnd() {
        const event = new MediaEvent(
            MediaEventType.SegmentEnd,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );
        event.segment = this.segment;

        this.mparticleInstance.logBaseEvent(event);
        this.segment = undefined;
    }

    /**
     * Logs when a visitor skips a Segment or Chapter
     * @category Media
     */
    logSegmentSkip() {
        const event = new MediaEvent(
            MediaEventType.SegmentSkip,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );
        event.segment = this.segment;
        this.mparticleInstance.logBaseEvent(event);
        this.segment = undefined;
    }

    /**
     * Logs when a visitor starts seeking
     * @param seekPosition the desired playhead position
     * @category Media
     */
    logSeekStart(seekPosition: number) {
        const event = new MediaEvent(
            MediaEventType.SeekStart,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );

        event.seekPosition = seekPosition;

        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs when a visitor stops seeking
     * @param seekPosition the desired playhead position
     * @category Media
     */
    logSeekEnd(seekPosition: number) {
        const event = new MediaEvent(
            MediaEventType.SeekEnd,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );

        event.seekPosition = seekPosition;

        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs when the playhead position is updated
     * @param playheadPosition The updated playhead position
     * @category Media
     */
    logPlayheadPosition(playheadPosition: number) {
        this.currentPlayheadPosition = playheadPosition;
        const event = new MediaEvent(
            MediaEventType.UpdatePlayheadPosition,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );

        event.playheadPosition = playheadPosition;

        this.mparticleInstance.logBaseEvent(event);
    }

    /**
     * Logs an update in the Quality of Service
     * @param qos An object representing QoS
     * @category Quality of Service
     */
    logQoS(qos: QoS) {
        const event = new MediaEvent(
            MediaEventType.UpdateQoS,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType
        );
        event.qos = qos;

        this.mparticleInstance.logBaseEvent(event);
    }
}

import { MediaEvent } from './events';
import {
    AdBreak,
    AdContent,
    MediaContentType,
    MediaStreamType,
    Segment,
    MediaEventCallback,
    MediaEventType,
    MpSDKInstance,
    QoS,
    EventType,
    MessageType,
    ModelAttributes,
    PageEventObject,
} from './types';

import { uuid } from './utils';

/**
 * The MediaSession class is the primary class that will be used to engage with the mParticle Media SDK.
 */
export default class MediaSession {
    adBreak?: AdBreak;
    adContent?: AdContent;
    segment?: Segment;

    get sessionId() {
        return this._sessionId;
    }
    private _sessionId = '';

    private currentPlayheadPosition = 0;

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
     */
    constructor(
        readonly mparticleInstance: MpSDKInstance,
        readonly contentId: string,
        readonly title: string,
        public duration: number,
        readonly contentType: MediaContentType,
        readonly streamType: MediaStreamType,
        public logPageEvent = false,
        public logMediaEvent = true
    ) {}

    /**
     * Creates a base Media Event
     * @param eventType
     */
    private createMediaEvent(eventType: MediaEventType): MediaEvent {
        return new MediaEvent(
            eventType,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType,
            this.sessionId
        );
    }

    /**
     * Sends MediaEvent to CoreSDK depending on if [logMediaEvent] or [logPageEvent] are set
     * @param event MediaEvent
     */
    private logEvent(event: MediaEvent) {
        this.mediaEventListener(event);

        if (this.logMediaEvent) {
            this.mparticleInstance.logBaseEvent(event);
        }

        if (this.logPageEvent) {
            if (event.eventType !== MediaEventType.UpdatePlayheadPosition) {
                const mpEvent = event.toPageEvent();
                this.mparticleInstance.logBaseEvent(mpEvent);
            }
        }
    }

    /**
     * Returns session attributes as a flat object
     */
    getAttributes(): ModelAttributes {
        return {
            content_title: this.title,
            content_duration: this.duration,
            content_id: this.contentId,
            content_type: MediaContentType[this.contentType],
            stream_type: MediaStreamType[this.streamType],
            playhead_position: this.currentPlayheadPosition,
            media_session_id: this.sessionId,
        };
    }

    /**
     * Starts your media session. Should be triggered before any prerolls or ads
     * @category Media
     */
    logMediaSessionStart() {
        this._sessionId = uuid();
        const event = this.createMediaEvent(MediaEventType.SessionStart);

        this.logEvent(event);
    }

    /**
     * Ends your media session. Should be the method thing triggered, after all ads and content have been completed
     * @category Media
     */
    logMediaSessionEnd() {
        const event = this.createMediaEvent(MediaEventType.SessionEnd);

        this.logEvent(event);
    }

    /**
     * Logs when your media content has ended, usually before a post-roll ad.
     * Must be fired between MediaSessionStart and MediaSessionEnd
     * @category Media
     */
    logMediaContentEnd() {
        const event = this.createMediaEvent(MediaEventType.MediaContentEnd);

        this.logEvent(event);
    }

    /**
     * Logs when an Ad Break pod has started
     * @param adBreakContent An object representing an [[AdBreak]] (collection of ads)
     * @category Advertising
     */
    logAdBreakStart(adBreakContent: AdBreak) {
        this.adBreak = adBreakContent;

        const event = this.createMediaEvent(MediaEventType.AdBreakStart);

        event.adBreak = adBreakContent;

        this.logEvent(event);
    }

    /**
     * Logs when an [[AdBreak]] pod has ended
     * @category Advertising
     */
    logAdBreakEnd() {
        const event = this.createMediaEvent(MediaEventType.AdBreakEnd);
        event.adBreak = this.adBreak;

        this.logEvent(event);
        this.adBreak = undefined;
    }

    /**
     * Logs when a single ad plays
     * @param adContent An object representing a single Ad
     * @category Advertising
     */
    logAdStart(adContent: AdContent) {
        this.adContent = adContent;

        const event = this.createMediaEvent(MediaEventType.AdStart);
        event.adContent = adContent;

        this.logEvent(event);
    }

    /**
     * Logs when a single ad ends
     * @category Advertising
     */
    logAdEnd() {
        const event = this.createMediaEvent(MediaEventType.AdEnd);
        event.adContent = this.adContent;

        this.logEvent(event);
        this.adContent = undefined;
    }

    /**
     * Logs when a single ad is skipped by a visitor
     * @category Advertising
     */
    logAdSkip() {
        const event = this.createMediaEvent(MediaEventType.AdSkip);
        event.adContent = this.adContent;

        this.logEvent(event);
        this.adContent = undefined;
    }

    /**
     * Logs when a single ad is clicked on by a visitor
     * @category Advertising
     */
    logAdClick(adContent: AdContent) {
        this.adContent = adContent;
        const event = this.createMediaEvent(MediaEventType.AdClick);
        event.adContent = this.adContent;

        this.logEvent(event);
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
        const event = this.createMediaEvent(MediaEventType.BufferStart);

        event.bufferDuration = bufferDuration;
        event.bufferPercent = bufferPercent;
        event.bufferPosition = bufferPosition;

        this.logEvent(event);
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
        const event = this.createMediaEvent(MediaEventType.BufferEnd);

        event.bufferDuration = bufferDuration;
        event.bufferPercent = bufferPercent;
        event.bufferPosition = bufferPosition;

        this.logEvent(event);
    }

    /**
     * Logs a play event
     * @category Media
     */
    logPlay() {
        const event = this.createMediaEvent(MediaEventType.Play);
        this.logEvent(event);
    }

    /**
     * Logs a pause event
     * @category Media
     */
    logPause() {
        const event = this.createMediaEvent(MediaEventType.Pause);
        this.logEvent(event);
    }

    /**
     * Logs the start of a Segment or Chapter
     * @param segment An object representing a segment or chapter of content
     * @category Media
     */
    logSegmentStart(segment: Segment) {
        const event = this.createMediaEvent(MediaEventType.SegmentStart);

        event.segment = segment;

        this.logEvent(event);
        this.segment = segment;
    }

    /**
     * Logs the end of a Segment or Chapter
     * @category Media
     */
    logSegmentEnd() {
        const event = this.createMediaEvent(MediaEventType.SegmentEnd);
        event.segment = this.segment;

        this.logEvent(event);
        this.segment = undefined;
    }

    /**
     * Logs when a visitor skips a Segment or Chapter
     * @category Media
     */
    logSegmentSkip() {
        const event = this.createMediaEvent(MediaEventType.SegmentSkip);
        event.segment = this.segment;
        this.logEvent(event);
        this.segment = undefined;
    }

    /**
     * Logs when a visitor starts seeking
     * @param seekPosition the desired playhead position
     * @category Media
     */
    logSeekStart(seekPosition: number) {
        const event = this.createMediaEvent(MediaEventType.SeekStart);

        event.seekPosition = seekPosition;

        this.logEvent(event);
    }

    /**
     * Logs when a visitor stops seeking
     * @param seekPosition the desired playhead position
     * @category Media
     */
    logSeekEnd(seekPosition: number) {
        const event = this.createMediaEvent(MediaEventType.SeekEnd);

        event.seekPosition = seekPosition;

        this.logEvent(event);
    }

    /**
     * Logs when the playhead position is updated
     * @param playheadPosition The updated playhead position
     * @category Media
     */
    logPlayheadPosition(playheadPosition: number) {
        this.currentPlayheadPosition = playheadPosition;
        const event = this.createMediaEvent(
            MediaEventType.UpdatePlayheadPosition
        );

        event.playheadPosition = playheadPosition;

        this.logEvent(event);
    }

    /**
     * Logs an update in the Quality of Service
     * @param qos An object representing QoS
     * @category Quality of Service
     */
    logQoS(qos: QoS) {
        const event = this.createMediaEvent(MediaEventType.UpdateQoS);
        event.qos = qos;

        this.logEvent(event);
    }

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
    createPageEvent(
        eventName: string,
        attributes: { [key: string]: string | number }
    ): PageEventObject {
        return {
            name: eventName,
            eventType: EventType.Media,
            messageType: MessageType.PageEvent,
            data: {
                ...this.getAttributes(),
                ...attributes,
            },
        };
    }

    /**
     * Subscribes your Media Session to an array of [[MediaEventType]] and fires a
     * callback when they are triggered
     *
     * ```typescript
     * const mediaSession = new MediaSession(
     *     mParticle,
     *     title = "Media Title"
     *     mediaContentId = "123"
     *     duration = 1000
     *     streamType = StreamType.LiveStream
     *     contentType = ContentType.Video
     *
     *     logPageEvents = false              //optional, defaults to false anyway
     *     logMediaEvents = false
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
    get mediaEventListener(): MediaEventCallback {
        return this.listenerCallback;
    }
    set mediaEventListener(callback: MediaEventCallback) {
        this.listenerCallback = callback;
    }
    private listenerCallback: MediaEventCallback = () => {};
}

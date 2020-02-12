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
    Options,
} from './types';

import { uuid } from './utils';

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
export class MediaSession {
    adBreak?: AdBreak;
    adContent?: AdContent;
    segment?: Segment;

    get sessionId() {
        return this._sessionId;
    }
    private _sessionId = '';

    private currentPlayheadPosition = 0;

    private currentQoS: QoS = {
        startupTime: 0,
        fps: 0,
        bitRate: 0,
        droppedFrames: 0,
    };

    private customAttributes: ModelAttributes = {};

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
     * @param customAttributes
     */
    private createMediaEvent(
        eventType: MediaEventType,
        options: Options = {}
    ): MediaEvent {
        // Set event option based on options or current state
        this.currentPlayheadPosition =
            options?.currentPlayheadPosition || this.currentPlayheadPosition;
        this.customAttributes = options?.customAttributes || {};

        options = {
            currentPlayheadPosition: this.currentPlayheadPosition,
            customAttributes: this.customAttributes,
            ...options,
        };

        return new MediaEvent(
            eventType,
            this.title,
            this.contentId,
            this.duration,
            this.contentType,
            this.streamType,
            this.sessionId,
            options
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
     * Returns QoS attributes as a flat object
     */
    getQoSAttributes() {
        const result: ModelAttributes = {};
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
     * @param options Optional Custom Attributes
     * @category Media
     */
    logMediaSessionStart(options?: Options) {
        this._sessionId = uuid();
        const event = this.createMediaEvent(
            MediaEventType.SessionStart,
            options
        );

        this.logEvent(event);
    }

    /**
     * Ends your media session. Should be triggered after all ads and content have been completed
     * @param options Optional Custom Attributes
     * @category Media
     */
    logMediaSessionEnd(options?: Options) {
        const event = this.createMediaEvent(MediaEventType.SessionEnd, options);

        this.logEvent(event);
    }

    /**
     * Logs when your media content has ended, usually before a post-roll ad.
     * Must be fired between MediaSessionStart and MediaSessionEnd
     * @param options Optional Custom Attributes
     * @category Media
     */
    logMediaContentEnd(options?: Options) {
        const event = this.createMediaEvent(
            MediaEventType.MediaContentEnd,
            options
        );

        this.logEvent(event);
    }

    /**
     * Logs when an Ad Break pod has started
     * @param adBreakContent An object representing an [[AdBreak]] (collection of ads)
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdBreakStart(adBreakContent: AdBreak, options?: Options) {
        this.adBreak = adBreakContent;

        const event = this.createMediaEvent(
            MediaEventType.AdBreakStart,
            options
        );

        event.adBreak = adBreakContent;

        this.logEvent(event);
    }

    /**
     * Logs when an [[AdBreak]] pod has ended
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdBreakEnd(options?: Options) {
        const event = this.createMediaEvent(MediaEventType.AdBreakEnd, options);
        event.adBreak = this.adBreak;

        this.logEvent(event);
        this.adBreak = undefined;
    }

    /**
     * Logs when a single ad plays
     * @param adContent An object representing a single Ad
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdStart(adContent: AdContent, options?: Options) {
        this.adContent = adContent;

        const event = this.createMediaEvent(MediaEventType.AdStart, options);
        event.adContent = adContent;

        this.logEvent(event);
    }

    /**
     * Logs when a single ad ends
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdEnd(options?: Options) {
        const event = this.createMediaEvent(MediaEventType.AdEnd, options);
        event.adContent = this.adContent;

        this.logEvent(event);
        this.adContent = undefined;
    }

    /**
     * Logs when a single ad is skipped by a visitor
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdSkip(options?: Options) {
        const event = this.createMediaEvent(MediaEventType.AdSkip, options);
        event.adContent = this.adContent;

        this.logEvent(event);
        this.adContent = undefined;
    }

    /**
     * Logs when a single ad is clicked on by a visitor
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdClick(adContent: AdContent, options?: Options) {
        this.adContent = adContent;
        const event = this.createMediaEvent(MediaEventType.AdClick, options);
        event.adContent = this.adContent;

        this.logEvent(event);
    }

    /**
     * Logs the start of a buffering event
     * @param bufferDuration The duration of a buffering event
     * @param bufferPercent The percent that has been buffered
     * @param bufferPosition The playhead position of the buffering event
     * @param options Optional Custom Attributes
     * @category Buffering
     */
    logBufferStart(
        bufferDuration: number,
        bufferPercent: number,
        bufferPosition: number,
        options?: Options
    ) {
        const event = this.createMediaEvent(
            MediaEventType.BufferStart,
            options
        );

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
     * @param options Optional Custom Attributes
     * @category Buffering
     */
    logBufferEnd(
        bufferDuration: number,
        bufferPercent: number,
        bufferPosition: number,
        options?: Options
    ) {
        const event = this.createMediaEvent(MediaEventType.BufferEnd, options);

        event.bufferDuration = bufferDuration;
        event.bufferPercent = bufferPercent;
        event.bufferPosition = bufferPosition;

        this.logEvent(event);
    }

    /**
     * Logs a play event
     * @param options Optional Custom Attributes
     * @category Media
     */
    logPlay(options?: Options) {
        const event = this.createMediaEvent(MediaEventType.Play, options);
        this.logEvent(event);
    }

    /**
     * Logs a pause event
     * @param options Optional Custom Attributes
     * @category Media
     */
    logPause(options?: Options) {
        const event = this.createMediaEvent(MediaEventType.Pause, options);
        this.logEvent(event);
    }

    /**
     * Logs the start of a Segment or Chapter
     * @param segment An object representing a segment or chapter of content
     * @param options Optional Custom Attributes
     * @category Media
     */
    logSegmentStart(segment: Segment, options?: Options) {
        const event = this.createMediaEvent(
            MediaEventType.SegmentStart,
            options
        );

        event.segment = segment;

        this.logEvent(event);
        this.segment = segment;
    }

    /**
     * Logs the end of a Segment or Chapter
     * @param options Optional Custom Attributes
     * @category Media
     */
    logSegmentEnd(options?: Options) {
        const event = this.createMediaEvent(MediaEventType.SegmentEnd, options);
        event.segment = this.segment;

        this.logEvent(event);
        this.segment = undefined;
    }

    /**
     * Logs when a visitor skips a Segment or Chapter
     * @param options Optional Custom Attributes
     * @category Media
     */
    logSegmentSkip(options?: Options) {
        const event = this.createMediaEvent(
            MediaEventType.SegmentSkip,
            options
        );
        event.segment = this.segment;
        this.logEvent(event);
        this.segment = undefined;
    }

    /**
     * Logs when a visitor starts seeking
     * @param seekPosition the desired playhead position
     * @param options Optional Custom Attributes
     * @category Media
     */
    logSeekStart(seekPosition: number, options?: Options) {
        const event = this.createMediaEvent(MediaEventType.SeekStart, options);

        event.seekPosition = seekPosition;

        this.logEvent(event);
    }

    /**
     * Logs when a visitor stops seeking
     * @param seekPosition the desired playhead position
     * @param options Optional Custom Attributes
     * @category Media
     */
    logSeekEnd(seekPosition: number, options?: Options) {
        const event = this.createMediaEvent(MediaEventType.SeekEnd, options);

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
     * @param options Optional Custom Attributes
     * @category Quality of Service
     */
    logQoS(qos: QoS, options?: Options) {
        this.currentQoS = { ...this.currentQoS, ...qos };
        const event = this.createMediaEvent(MediaEventType.UpdateQoS, options);

        event.qos = { ...this.currentQoS };

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
        attributes: ModelAttributes
    ): PageEventObject {
        return {
            name: eventName,
            eventType: EventType.Media,
            messageType: MessageType.PageEvent,
            data: {
                ...this.getAttributes(),
                ...this.getQoSAttributes(),
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

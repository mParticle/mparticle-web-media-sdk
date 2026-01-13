import { AdBreak, AdContent, MediaContentType, MediaStreamType, Segment, MediaEventCallback, MpSDKInstance, QoS, ModelAttributes, PageEventObject, Options } from './types';
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
 *   {                             // (optional) Custom Attributes object used for each media event within the Media Session
 *     mediaSessionAttribute1: 'value1',
 *     mediaSessionAttribute2: 'value2'
 *   };
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
export declare class MediaSession {
    readonly mparticleInstance: MpSDKInstance;
    readonly contentId: string;
    readonly title: string;
    duration: number;
    readonly contentType: MediaContentType;
    readonly streamType: MediaStreamType;
    logPageEvent: boolean;
    logMediaEvent: boolean;
    mediaSessionAttributes?: ModelAttributes | undefined;
    excludeAdBreaksFromContentTime: boolean;
    adBreak?: AdBreak;
    adContent?: AdContent;
    segment?: Segment;
    get sessionId(): string;
    private _sessionId;
    private currentPlayheadPosition?;
    private currentQoS;
    private customAttributes;
    private mediaSessionStartTimestamp;
    private mediaSessionEndTimestamp;
    private mediaTimeSpent;
    private currentPlaybackStartTimestamp?;
    private storedPlaybackTime;
    private mediaContentTimeSpent;
    /**
     * Pauses content-time accumulation if ad break exclusion is enabled.
     * Sets playback state to pausedByAdBreak when a pause is performed.
     */
    private pauseContentTimeIfAdBreakExclusionEnabled;
    /**
     * Resumes content-time accumulation if ad break exclusion is enabled and
     * the previous pause was caused by an ad break (not by user).
     * Sets playback state to playing on resume.
     */
    private resumeContentTimeIfAdBreakExclusionEnabled;
    mediaContentCompleteLimit: number;
    private mediaContentComplete;
    private mediaSessionSegmentTotal;
    private mediaTotalAdTimeSpent;
    private mediaAdTimeSpentRate;
    private mediaSessionAdTotal;
    private mediaSessionAdObjects;
    private sessionSummarySent;
    private playbackState;
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
     * @param mediaSessionAttributes (optional) A set of custom attributes to attach to all media Events created by a Session
     * @param excludeAdBreaksFromContentTime A flag to exclude ad-break time from media content time (default false)
     */
    constructor(mparticleInstance: MpSDKInstance, contentId: string, title: string, duration: number, contentType: MediaContentType, streamType: MediaStreamType, logPageEvent?: boolean, logMediaEvent?: boolean, mediaSessionAttributes?: ModelAttributes | undefined, excludeAdBreaksFromContentTime?: boolean);
    /**
     * Creates a base Media Event
     * @param eventType
     * @param customAttributes
     */
    private createMediaEvent;
    /**
     * Sends MediaEvent to CoreSDK depending on if [logMediaEvent] or [logPageEvent] are set
     * @param event MediaEvent
     */
    private logEvent;
    /**
     * Returns QoS attributes as a flat object
     */
    getQoSAttributes(): ModelAttributes;
    /**
     * Returns session attributes as a flat object
     */
    getAttributes(): ModelAttributes;
    /**
     * Starts your media session. Should be triggered before any prerolls or ads
     * @param options Optional Custom Attributes
     * @category Media
     */
    logMediaSessionStart(options?: Options): void;
    /**
     * Ends your media session. Should be triggered after all ads and content have been completed
     * @param options Optional Custom Attributes
     * @category Media
     */
    logMediaSessionEnd(options?: Options): void;
    /**
     * Logs when your media content has ended, usually before a post-roll ad.
     * Must be fired between MediaSessionStart and MediaSessionEnd
     * @param options Optional Custom Attributes
     * @category Media
     */
    logMediaContentEnd(options?: Options): void;
    /**
     * Logs when an Ad Break pod has started
     * @param adBreakContent An object representing an [[AdBreak]] (collection of ads)
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdBreakStart(adBreakContent: AdBreak, options?: Options): void;
    /**
     * Logs when an [[AdBreak]] pod has ended
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdBreakEnd(options?: Options): void;
    /**
     * Logs when a single ad plays
     * @param adContent An object representing a single Ad
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdStart(adContent: AdContent, options?: Options): void;
    /**
     * Logs when a single ad ends
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdEnd(options?: Options): void;
    /**
     * Logs when a single ad is skipped by a visitor
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdSkip(options?: Options): void;
    /**
     * Logs when a single ad is clicked on by a visitor
     * @param options Optional Custom Attributes
     * @category Advertising
     */
    logAdClick(adContent: AdContent, options?: Options): void;
    /**
     * Logs the start of a buffering event
     * @param bufferDuration The duration of a buffering event
     * @param bufferPercent The percent that has been buffered
     * @param bufferPosition The playhead position of the buffering event
     * @param options Optional Custom Attributes
     * @category Buffering
     */
    logBufferStart(bufferDuration: number, bufferPercent: number, bufferPosition: number, options?: Options): void;
    /**
     * Logs the end of a buffering event
     * @param bufferDuration The duration of a buffering event
     * @param bufferPercent The percent that has been buffered
     * @param bufferPosition The playhead position of the buffering event
     * @param options Optional Custom Attributes
     * @category Buffering
     */
    logBufferEnd(bufferDuration: number, bufferPercent: number, bufferPosition: number, options?: Options): void;
    /**
     * Logs a play event
     * @param options Optional Custom Attributes
     * @category Media
     */
    logPlay(options?: Options): void;
    /**
     * Logs a pause event
     * @param options Optional Custom Attributes
     * @category Media
     */
    logPause(options?: Options): void;
    /**
     * Logs the start of a Segment or Chapter
     * @param segment An object representing a segment or chapter of content
     * @param options Optional Custom Attributes
     * @category Media
     */
    logSegmentStart(segment: Segment, options?: Options): void;
    /**
     * Logs the end of a Segment or Chapter
     * @param options Optional Custom Attributes
     * @category Media
     */
    logSegmentEnd(options?: Options): void;
    /**
     * Logs when a visitor skips a Segment or Chapter
     * @param options Optional Custom Attributes
     * @category Media
     */
    logSegmentSkip(options?: Options): void;
    /**
     * Logs when a visitor starts seeking
     * @param seekPosition the desired playhead position
     * @param options Optional Custom Attributes
     * @category Media
     */
    logSeekStart(seekPosition: number, options?: Options): void;
    /**
     * Logs when a visitor stops seeking
     * @param seekPosition the desired playhead position
     * @param options Optional Custom Attributes
     * @category Media
     */
    logSeekEnd(seekPosition: number, options?: Options): void;
    /**
     * Logs when the playhead position is updated
     * @param playheadPosition The updated playhead position
     * @category Media
     */
    logPlayheadPosition(playheadPosition: number): void;
    /**
     * Logs an update in the Quality of Service
     * @param qos An object representing QoS
     * @param options Optional Custom Attributes
     * @category Quality of Service
     */
    logQoS(qos: QoS, options?: Options): void;
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
    createPageEvent(eventName: string, attributes: ModelAttributes): PageEventObject;
    /**
     * Subscribes your Media Session to an array of [[MediaEventType]] and fires a
     * callback when they are triggered
     *
     * ```typescript
     * const mediaSession = new MediaSession(
     *     mParticle,
     *     title = "Media Title"
     *     contentId = "123"
     *     duration = 1000
     *     streamType = StreamType.LiveStream
     *     contentType = ContentType.Video
     *
     *     logPageEvents = false              //optional, defaults to false anyway
     *     logMediaEvents = false             //optional, defaults to false anyway
     *     sessionCustomEvents = {}           //optional, defaults to empty object
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
    get mediaEventListener(): MediaEventCallback;
    set mediaEventListener(callback: MediaEventCallback);
    private listenerCallback;
    private logSessionSummary;
    private logSegmentSummary;
    private logAdSummary;
}

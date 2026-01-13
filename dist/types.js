"use strict";
// This will live in a declaration file in core sdk
// once we set that up.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidMediaAttributeKeys = exports.MediaStreamType = exports.MediaContentType = exports.MediaEventName = exports.MediaEventType = exports.EventType = exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    MessageType[MessageType["PageEvent"] = 4] = "PageEvent";
    MessageType[MessageType["Media"] = 20] = "Media";
})(MessageType || (exports.MessageType = MessageType = {}));
var EventType;
(function (EventType) {
    EventType[EventType["Media"] = 9] = "Media";
})(EventType || (exports.EventType = EventType = {}));
var MediaEventType;
(function (MediaEventType) {
    MediaEventType[MediaEventType["Play"] = 23] = "Play";
    MediaEventType[MediaEventType["Pause"] = 24] = "Pause";
    MediaEventType[MediaEventType["ContentEnd"] = 25] = "ContentEnd";
    MediaEventType[MediaEventType["SessionStart"] = 30] = "SessionStart";
    MediaEventType[MediaEventType["SessionEnd"] = 31] = "SessionEnd";
    MediaEventType[MediaEventType["SeekStart"] = 32] = "SeekStart";
    MediaEventType[MediaEventType["SeekEnd"] = 33] = "SeekEnd";
    MediaEventType[MediaEventType["BufferStart"] = 34] = "BufferStart";
    MediaEventType[MediaEventType["BufferEnd"] = 35] = "BufferEnd";
    MediaEventType[MediaEventType["UpdatePlayheadPosition"] = 36] = "UpdatePlayheadPosition";
    MediaEventType[MediaEventType["AdClick"] = 37] = "AdClick";
    MediaEventType[MediaEventType["AdBreakStart"] = 38] = "AdBreakStart";
    MediaEventType[MediaEventType["AdBreakEnd"] = 39] = "AdBreakEnd";
    MediaEventType[MediaEventType["AdStart"] = 40] = "AdStart";
    MediaEventType[MediaEventType["AdEnd"] = 41] = "AdEnd";
    MediaEventType[MediaEventType["AdSkip"] = 42] = "AdSkip";
    MediaEventType[MediaEventType["SegmentStart"] = 43] = "SegmentStart";
    MediaEventType[MediaEventType["SegmentEnd"] = 44] = "SegmentEnd";
    MediaEventType[MediaEventType["SegmentSkip"] = 45] = "SegmentSkip";
    MediaEventType[MediaEventType["UpdateQoS"] = 46] = "UpdateQoS";
    MediaEventType[MediaEventType["SessionSummary"] = 47] = "SessionSummary";
    MediaEventType[MediaEventType["SegmentSummary"] = 48] = "SegmentSummary";
    MediaEventType[MediaEventType["AdSummary"] = 49] = "AdSummary";
})(MediaEventType || (exports.MediaEventType = MediaEventType = {}));
exports.MediaEventName = {
    Play: 'Play',
    Pause: 'Pause',
    ContentEnd: 'Media Content End',
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
    SessionSummary: 'Media Session Summary',
    SegmentSummary: 'Media Segment Summary',
    AdSummary: 'Media Ad Summary',
};
var MediaContentType;
(function (MediaContentType) {
    MediaContentType["Video"] = "Video";
    MediaContentType["Audio"] = "Audio";
})(MediaContentType || (exports.MediaContentType = MediaContentType = {}));
var MediaStreamType;
(function (MediaStreamType) {
    MediaStreamType["LiveStream"] = "LiveStream";
    MediaStreamType["OnDemand"] = "OnDemand";
    MediaStreamType["Linear"] = "Linear";
    MediaStreamType["Podcast"] = "Podcast";
    MediaStreamType["Audiobook"] = "Audiobook";
})(MediaStreamType || (exports.MediaStreamType = MediaStreamType = {}));
exports.ValidMediaAttributeKeys = {
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
    // Session Summary Attributes
    mediaSessionIdKey: 'media_session_id',
    startTimestampKey: 'media_session_start_time',
    endTimestampKey: 'media_session_end_time',
    contentIdKey: 'content_id',
    contentTitleKey: 'content_title',
    mediaTimeSpentKey: 'media_time_spent',
    contentTimeSpentKey: 'media_content_time_spent',
    contentCompleteKey: 'media_content_complete',
    totalSegmentsKey: 'media_session_segment_total',
    totalAdTimeSpentKey: 'media_total_ad_time_spent',
    adTimeSpentRateKey: 'media_ad_time_spent_rate',
    totalAdsKey: 'media_session_ad_total',
    adIDsKey: 'media_session_ad_objects',
    // Ad Summary Attributes
    adBreakIdKey: 'ad_break_id',
    adContentIdKey: 'ad_content_id',
    adContentStartTimestampKey: 'ad_content_start_time',
    adContentEndTimestampKey: 'ad_content_end_time',
    adContentTitleKey: 'ad_content_title',
    adContentSkippedKey: 'ad_skipped',
    adContentCompletedKey: 'ad_completed',
    // Segment Summary Attributes
    segmentIndexKey: 'segment_index',
    segmentTitleKey: 'segment_title',
    segmentStartTimestampKey: 'segment_start_time',
    segmentEndTimestampKey: 'segment_end_time',
    segmentTimeSpentKey: 'media_segment_time_spent',
    segmentSkippedKey: 'segment_skipped',
    segmentCompletedKey: 'segment_completed',
};

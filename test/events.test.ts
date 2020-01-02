import { expect } from 'chai';
import { MediaEvent } from '../src/events';
import {
    MediaEventType,
    MediaContentType,
    MediaStreamType,
    MessageType,
    EventType,
} from '../src/types';

describe('MediaEvent', () => {
    describe('#constructor', () => {
        it('populates default values', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.Play,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890'
            );

            expect(mediaEvent.toPageEvent()).to.eql({
                data: {
                    content_duration: 120000,
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_type: 'Video',
                    media_session_id: '1234567890',
                    stream_type: 'OnDemand',
                },
                eventType: 9,
                messageType: 4,
                name: 'Play',
            });
        });

        it('populates with optional values', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const options = {
                currentPlayheadPosition: 42,
                customAttributes: {
                    something: 'epic',
                },
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.Play,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890',
                options
            );

            expect(mediaEvent.toPageEvent()).to.eql({
                data: {
                    content_duration: 120000,
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_type: 'Video',
                    media_session_id: '1234567890',
                    stream_type: 'OnDemand',
                    playhead_position: 42,
                    something: 'epic',
                },
                eventType: 9,
                messageType: 4,
                name: 'Play',
            });
        });

        it('populates playheadPosition through customAttributes', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const options = {
                currentPlayheadPosition: 42,
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.Play,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890',
                options
            );

            expect(mediaEvent.playheadPosition).to.eq(42);
        });
    });
    describe('toPageEvent', () => {
        it('returns a valid Media Content Object', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.Play,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890'
            );

            mediaEvent.playheadPosition = 10;

            const expectedObject = {
                name: 'Play',
                messageType: MessageType.PageEvent,
                eventType: EventType.Media,
                data: {
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_duration: 120000,
                    content_type: 'Video',
                    stream_type: 'OnDemand',
                    playhead_position: 10,
                    media_session_id: '1234567890',
                },
            };

            expect(mediaEvent.toPageEvent()).to.eql(expectedObject);
        });

        it('returns a valid Seek Object', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.SeekStart,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890'
            );

            mediaEvent.seekPosition = 7;

            const expectedObject = {
                name: 'Seek Start',
                messageType: MessageType.PageEvent,
                eventType: EventType.Media,
                data: {
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_duration: 120000,
                    content_type: 'Video',
                    stream_type: 'OnDemand',
                    seek_position: 7,
                    media_session_id: '1234567890',
                },
            };

            expect(mediaEvent.toPageEvent()).to.eql(expectedObject);
        });

        it('returns a valid Buffer Object', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.Play,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890'
            );

            mediaEvent.bufferDuration = 120;
            mediaEvent.bufferPercent = 42;
            mediaEvent.bufferPosition = 4;

            const expectedObject = {
                name: 'Play',
                messageType: MessageType.PageEvent,
                eventType: EventType.Media,
                data: {
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_duration: 120000,
                    content_type: 'Video',
                    stream_type: 'OnDemand',
                    buffer_duration: 120,
                    buffer_percent: 42,
                    buffer_position: 4,
                    media_session_id: '1234567890',
                },
            };

            expect(mediaEvent.toPageEvent()).to.eql(expectedObject);
        });

        it('returns a valid QoS Object', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.UpdateQoS,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890'
            );

            const qos = {
                bitRate: 1,
                fps: 24,
                startupTime: 399,
                droppedFrames: 98,
            };

            mediaEvent.qos = qos;

            const expectedObject = {
                name: 'Update QoS',
                messageType: MessageType.PageEvent,
                eventType: EventType.Media,
                data: {
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_duration: 120000,
                    content_type: 'Video',
                    stream_type: 'OnDemand',
                    qos_bitrate: 1,
                    qos_fps: 24,
                    qos_startup_time: 399,
                    qos_dropped_frames: 98,
                    media_session_id: '1234567890',
                },
            };

            expect(mediaEvent.toPageEvent()).to.eql(expectedObject);
        });
        it('returns a valid Media Ad Break Object', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.AdBreakStart,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890'
            );

            const adBreak = {
                id: '08123410',
                title: 'mid-roll',
                duration: 10000,
            };

            mediaEvent.adBreak = adBreak;

            const expectedObject = {
                name: 'Ad Break Start',
                messageType: MessageType.PageEvent,
                eventType: EventType.Media,
                data: {
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_duration: 120000,
                    content_type: 'Video',
                    stream_type: 'OnDemand',
                    ad_break_id: '08123410',
                    ad_break_title: 'mid-roll',
                    ad_break_duration: 10000,
                    media_session_id: '1234567890',
                },
            };

            expect(mediaEvent.toPageEvent()).to.eql(expectedObject);
        });

        it('returns a valid Media Ad Content Object', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.AdStart,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890'
            );

            const adContent = {
                id: '1121220',
                advertiser: 'Planet Express',
                title: 'Good News Everbody!',
                campaign: 'Omicron Persei 8 Dinner Tours',
                duration: 60000,
                creative: "We'll be happy to have you for dinner",
                siteid: 'op8',
                placement: 0,
            };

            mediaEvent.adContent = adContent;

            const expectedObject = {
                name: 'Ad Start',
                messageType: MessageType.PageEvent,
                eventType: EventType.Media,
                data: {
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_duration: 120000,
                    content_type: 'Video',
                    stream_type: 'OnDemand',
                    ad_content_id: '1121220',
                    ad_content_advertiser: 'Planet Express',
                    ad_content_title: 'Good News Everbody!',
                    ad_content_campaign: 'Omicron Persei 8 Dinner Tours',
                    ad_content_duration: 60000,
                    ad_content_creative:
                        "We'll be happy to have you for dinner",
                    ad_content_site_id: 'op8',
                    ad_content_placement: 0,
                    media_session_id: '1234567890',
                },
            };

            expect(mediaEvent.toPageEvent()).to.eql(expectedObject);
        });

        it('returns a valid Segment Object', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.Play,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890'
            );

            const segment = {
                title: 'The Gang Write Some Code',
                index: 4,
                duration: 36000,
            };

            mediaEvent.segment = segment;

            const expectedObject = {
                name: 'Play',
                messageType: MessageType.PageEvent,
                eventType: EventType.Media,
                data: {
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_duration: 120000,
                    content_type: 'Video',
                    stream_type: 'OnDemand',
                    segment_title: 'The Gang Write Some Code',
                    segment_index: 4,
                    segment_duration: 36000,
                    media_session_id: '1234567890',
                },
            };

            expect(mediaEvent.toPageEvent()).to.eql(expectedObject);
        });

        it('supports customAttributes', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const options = {
                currentPlayheadPosition: 23,
                customAttributes: {
                    content_genre: 'prog rock',
                    content_release: '1970',
                },
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.Play,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890',
                options
            );

            const expectedObject = {
                name: 'Play',
                messageType: MessageType.PageEvent,
                eventType: EventType.Media,
                data: {
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_duration: 120000,
                    content_type: 'Video',
                    stream_type: 'OnDemand',
                    media_session_id: '1234567890',
                    content_genre: 'prog rock',
                    content_release: '1970',
                    playhead_position: 23,
                },
            };

            expect(mediaEvent.toPageEvent()).to.eql(expectedObject);
        });
    });
    describe('toEventAPIObject', () => {
        it('returns an EventAPIObject', () => {
            const song = {
                contentId: '023134',
                title: 'Immigrant Song',
                duration: 120000,
                contentType: MediaContentType.Video,
                streamType: MediaStreamType.OnDemand,
            };

            const options = {
                currentPlayheadPosition: 23,
                customAttributes: {
                    content_genre: 'prog rock',
                    content_release: '1970',
                },
            };

            const mediaEvent = new MediaEvent(
                MediaEventType.Play,
                song.title,
                song.contentId,
                song.duration,
                song.contentType,
                song.streamType,
                '1234567890',
                options
            );

            mediaEvent.bufferDuration = 120;
            mediaEvent.bufferPercent = 42;
            mediaEvent.bufferPosition = 4;
            mediaEvent.seekPosition = 39;

            mediaEvent.adBreak = {
                id: '08123410',
                title: 'mid-roll',
                duration: 10000,
            };

            mediaEvent.adContent = {
                id: '4423210',
                advertiser: "Mom's Friendly Robot Company",
                title: 'What?! Nobody rips off my kids but me!',
                campaign: 'MomCorp Galactic Domination Plot 3201',
                duration: 60000,
                creative: 'A Fishful of Dollars',
                siteid: 'moms',
                placement: 0,
            };

            mediaEvent.segment = {
                index: 2,
                title: 'Test Segment',
                duration: 350,
            };

            mediaEvent.qos = {
                fps: 322,
                bitRate: 7,
                startupTime: 3211,
                droppedFrames: 87,
            };

            expect(mediaEvent.toEventAPIObject()).to.eql({
                EventName: 'Play',
                EventCategory: MediaEventType.Play,
                EventDataType: MessageType.Media,

                Duration: 120000,
                BufferDuration: 120,
                BufferPercent: 42,
                BufferPosition: 4,
                ContentId: '023134',
                ContentType: 'Video',
                ContentTitle: 'Immigrant Song',
                StreamType: 'OnDemand',
                SeekPosition: 39,
                PlayheadPosition: 23,

                EventAttributes: {
                    content_genre: 'prog rock',
                    content_release: '1970',
                },

                AdBreak: {
                    id: '08123410',
                    title: 'mid-roll',
                    duration: 10000,
                },

                AdContent: {
                    id: '4423210',
                    advertiser: "Mom's Friendly Robot Company",
                    title: 'What?! Nobody rips off my kids but me!',
                    campaign: 'MomCorp Galactic Domination Plot 3201',
                    duration: 60000,
                    creative: 'A Fishful of Dollars',
                    siteid: 'moms',
                    placement: 0,
                },

                Segment: {
                    index: 2,
                    title: 'Test Segment',
                    duration: 350,
                },

                QoS: {
                    fps: 322,
                    bitRate: 7,
                    startupTime: 3211,
                    droppedFrames: 87,
                },
            });
        });
    });
});

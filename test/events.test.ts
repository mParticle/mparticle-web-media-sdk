import { expect } from 'chai';
import { MediaEvent } from '../src/events';
import {
    MediaEventType,
    MediaContentType,
    MediaStreamType,
    MessageType,
} from '../src/types';

describe('MediaEvent', () => {
    describe('toEventAPIObject', () => {
        it('returns an EventAPIObject', () => {
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
                song.streamType
            );

            mediaEvent.bufferDuration = 120;
            mediaEvent.bufferPercent = 42;
            mediaEvent.bufferPosition = 4;
            mediaEvent.playheadPosition = 32;
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
                PlayheadPosition: 32,

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

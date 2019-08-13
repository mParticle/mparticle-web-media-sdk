import MediaSession from '../src/index';
import { expect } from 'chai';
import sinon, { SinonSandbox } from 'sinon';
import { MediaEvent } from '../src/events';
import {
    MessageType,
    MediaEventType,
    MediaContent,
    MediaContentType,
    AdBreak,
    AdContent,
    MediaStreamType,
    MpSDKInstance,
    Segment,
    QoS,
} from '../src/types';

let sandbox: SinonSandbox;
let mp: MpSDKInstance;
let mpMedia: MediaSession;
let song: MediaContent;

describe('mParticle Media SDK', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mp = {
            logBaseEvent: (event: MediaEvent) => {},
            logger: (message: string) => {},
        };

        song = {
            contentId: '023134',
            title: 'Immigrant Song',
            duration: 120000,
            contentType: MediaContentType.Video,
            streamType: MediaStreamType.OnDemand,
        };

        mpMedia = new MediaSession(
            mp,
            song.contentId,
            song.title,
            song.duration,
            song.contentType,
            song.streamType
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Functions', () => {
        describe('#logAdBreakStart', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                const adBreak: AdBreak = {
                    id: '08123410',
                    title: 'mid-roll',
                    duration: 10000,
                };

                mpMedia.logAdBreakStart(adBreak);

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Ad Break Start'"
                ).to.eq(MediaEventType.AdBreakStart);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(
                    bond.args[0][0].adBreak,
                    'Expected valid AdBreak object within payload'
                ).to.eql(adBreak);
            });

            it('should save the ad break to the session', () => {
                const adBreak: AdBreak = {
                    id: '08123410',
                    title: 'mid-roll',
                    duration: 10000,
                };

                mpMedia.logAdBreakStart(adBreak);
                expect(mpMedia.adBreak).to.exist.and.eq(adBreak);
            });
        });

        describe('#logAdBreakEnd', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                const adBreak: AdBreak = {
                    id: '08123410',
                    title: 'mid-roll',
                    duration: 10000,
                };

                mpMedia.adBreak = adBreak;
                mpMedia.logAdBreakEnd();

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Ad Break End'"
                ).to.eq(MediaEventType.AdBreakEnd);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(
                    bond.args[0][0].adBreak,
                    'Expected valid AdBreak object within payload'
                ).to.eql(adBreak);
            });

            it('should clear the ad break in the session', () => {
                const adBreak: AdBreak = {
                    id: '08123410',
                    title: 'mid-roll',
                    duration: 10000,
                };

                mpMedia.adBreak = adBreak;
                mpMedia.logAdBreakEnd();

                expect(mpMedia.adBreak).to.eq(undefined);
            });
        });

        describe('#logAdStart', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                const adContent: AdContent = {
                    id: '4423210',
                    advertiser: "Mom's Friendly Robot Company",
                    title: 'What?! Nobody rips off my kids but me!',
                    campaign: 'MomCorp Galactic Domination Plot 3201',
                    duration: 60000,
                    creative: 'A Fishful of Dollars',
                    siteid: 'moms',
                    placement: 0,
                };

                mpMedia.logAdStart(adContent);

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Ad Start'"
                ).to.eq(MediaEventType.AdStart);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(
                    bond.args[0][0].adContent,
                    'Expected to have a valid Ad Content Payload'
                ).to.eql(adContent);
            });

            it('should save the ad content in the session', () => {
                const adContent: AdContent = {
                    id: '1121220',
                    advertiser: 'Planet Express',
                    title: 'Good News Everbody!',
                    campaign: 'Omicron Persei 8 Dinner Tours',
                    duration: 60000,
                    creative: "We'll be happy to have you for dinner",
                    siteid: 'op8',
                    placement: 0,
                };

                mpMedia.logAdStart(adContent);

                expect(mpMedia.adContent).to.exist.and.eq(adContent);
            });
        });

        describe('#logAdEnd', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                const adContent: AdContent = {
                    id: '1121220',
                    advertiser: 'Planet Express',
                    title: 'Good News Everbody!',
                    campaign: 'Omicron Persei 8 Dinner Tours',
                    duration: 60000,
                    creative: "We'll be happy to have you for dinner",
                    siteid: 'op8',
                    placement: 0,
                };

                mpMedia.adContent = adContent;
                mpMedia.logAdEnd();

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Ad End'"
                ).to.eq(MediaEventType.AdEnd);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);

                expect(
                    bond.args[0][0].adContent,
                    'Expected valid Ad Content in payload'
                ).to.eql(adContent);
            });

            it('should clear the ad content in the session', () => {
                const adContent: AdContent = {
                    id: '1121220',
                    advertiser: 'Planet Express',
                    title: 'Good News Everbody!',
                    campaign: 'Omicron Persei 8 Dinner Tours',
                    duration: 60000,
                    creative: "We'll be happy to have you for dinner",
                    siteid: 'op8',
                    placement: 0,
                };

                mpMedia.adContent = adContent;
                mpMedia.logAdEnd();

                expect(mpMedia.adContent).to.eq(undefined);
            });
        });

        describe('#logAdSkip', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                const adContent: AdContent = {
                    id: '1121220',
                    advertiser: 'Planet Express',
                    title: 'Good News Everbody!',
                    campaign: 'Omicron Persei 8 Dinner Tours',
                    duration: 60000,
                    creative: "We'll be happy to have you for dinner",
                    siteid: 'op8',
                    placement: 0,
                };

                mpMedia.adContent = adContent;
                mpMedia.logAdSkip();

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Ad Skip'"
                ).to.eq(MediaEventType.AdSkip);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(
                    bond.args[0][0].adContent,
                    'Expected to have a valid Ad Content Payload'
                ).to.eql(adContent);
            });

            it('should clear the ad content in the session', () => {
                const adContent: AdContent = {
                    id: '1121220',
                    advertiser: 'Planet Express',
                    title: 'Good News Everbody!',
                    campaign: 'Omicron Persei 8 Dinner Tours',
                    duration: 60000,
                    creative: "We'll be happy to have you for dinner",
                    siteid: 'op8',
                    placement: 0,
                };

                mpMedia.adContent = adContent;
                mpMedia.logAdSkip();

                expect(mpMedia.adContent).to.eq(undefined);
            });
        });

        describe('#logAdClick', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                const adContent: AdContent = {
                    id: '1121220',
                    advertiser: 'Planet Express',
                    title: 'Good News Everbody!',
                    campaign: 'Omicron Persei 8 Dinner Tours',
                    duration: 60000,
                    creative: "We'll be happy to have you for dinner",
                    siteid: 'op8',
                    placement: 0,
                };

                mpMedia.logAdClick(adContent);

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Ad Click'"
                ).to.eq(MediaEventType.AdClick);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(
                    bond.args[0][0].adContent,
                    'Expected to have a valid Ad Content Payload'
                ).to.eql(adContent);
            });
        });

        describe('#logBufferStart', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                mpMedia.logBufferStart(320, 20, 201);
                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);

                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Buffer Start'"
                ).to.eq(MediaEventType.BufferStart);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(bond.args[0][0].bufferDuration).to.eq(320);
                expect(bond.args[0][0].bufferPercent).to.eq(20);
                expect(bond.args[0][0].bufferPosition).to.eq(201);
            });
        });

        describe('#logBufferEnd', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                mpMedia.logBufferEnd(99, 2, 341);

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Buffer End'"
                ).to.eq(MediaEventType.BufferEnd);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(bond.args[0][0].bufferDuration).to.eq(99);
                expect(bond.args[0][0].bufferPercent).to.eq(2);
                expect(bond.args[0][0].bufferPosition).to.eq(341);
            });
        });

        describe('#logSeekStart', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                mpMedia.logSeekStart(421);

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Seek Start'"
                ).to.eq(MediaEventType.SeekStart);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(bond.args[0][0].seekPosition).to.eq(421);
            });
        });

        describe('#logSeekEnd', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                mpMedia.logSeekEnd(999);

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Seek End'"
                ).to.eq(MediaEventType.SeekEnd);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(bond.args[0][0].seekPosition).to.eq(999);
            });
        });

        describe('#logPlayheadPosition', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                mpMedia.logPlayheadPosition(1234);

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Playhead Position'"
                ).to.eq(MediaEventType.UpdatePlayheadPosition);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(bond.args[0][0].playheadPosition).to.eq(1234);
            });
        });

        describe('#LogMediaSessionStart', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                mpMedia.logMediaSessionStart();

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Media Start'"
                ).to.eq(MediaEventType.SessionStart);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
            });
        });

        describe('#LogMediaEnd', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                mpMedia.logMediaSessionEnd();

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Media End'"
                ).to.eq(MediaEventType.SessionEnd);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
            });
        });

        describe('#logPlay', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                mpMedia.logPlay();

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Play'"
                ).to.eq(MediaEventType.Play);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
            });
        });

        describe('#logPause', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                mpMedia.logPause();

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Pause'"
                ).to.eq(MediaEventType.Pause);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
            });
        });

        describe('#logMediaContentEnd', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                mpMedia.logMediaContentEnd();

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Media Content Start'"
                ).to.eq(MediaEventType.MediaContentEnd);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
            });
        });

        describe('#logSegmentStart', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                const segment: Segment = {
                    title: 'The Gang Write Some Code',
                    index: 4,
                    duration: 36000,
                };

                mpMedia.logSegmentStart(segment);

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Segment Start'"
                ).to.eq(MediaEventType.SegmentStart);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(
                    bond.args[0][0].segment,
                    'Expect to have a valid Segment'
                ).to.eql(segment);
            });

            it('should save the segment in the session', () => {
                const segment: Segment = {
                    title: 'The Gang Write Some Code',
                    index: 4,
                    duration: 36000,
                };

                mpMedia.logSegmentStart(segment);

                expect(mpMedia.segment).to.exist.and.eq(segment);
            });
        });

        describe('#logSegmentEnd', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                const segment: Segment = {
                    title: 'The Gang Write Some Code',
                    index: 4,
                    duration: 36000,
                };

                mpMedia.segment = segment;
                mpMedia.logSegmentEnd();

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Segment End'"
                ).to.eq(MediaEventType.SegmentEnd);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(
                    bond.args[0][0].segment,
                    'Expect to have a valid Segment'
                ).to.eql(segment);
            });

            it('should clear the segment in the session', () => {
                const segment: Segment = {
                    title: 'The Gang Write Some Code',
                    index: 4,
                    duration: 36000,
                };

                mpMedia.segment = segment;
                mpMedia.logSegmentEnd();

                expect(mpMedia.segment).to.eq(undefined);
            });
        });

        describe('#logSegmentSkip', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                const segment: Segment = {
                    title: 'The Gang Write Some Code',
                    index: 4,
                    duration: 36000,
                };

                mpMedia.segment = segment;
                mpMedia.logSegmentSkip();

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'Segment Skip'"
                ).to.eq(MediaEventType.SegmentSkip);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(
                    bond.args[0][0].segment,
                    'Expect to have a valid Segment'
                ).to.eql(segment);
            });

            it('should clear the segment in the session', () => {
                const segment: Segment = {
                    title: 'The Gang Write Some Code',
                    index: 4,
                    duration: 36000,
                };

                mpMedia.segment = segment;
                mpMedia.logSegmentSkip();

                expect(mpMedia.segment).to.eq(undefined);
            });
        });
        describe('#logQoS', () => {
            it('should call core.logBaseEvent with a valid payload', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');

                const qos: QoS = {
                    startupTime: 201,
                    fps: 42,
                    bitRate: 2,
                    droppedFrames: 3,
                };

                mpMedia.logQoS(qos);

                expect(
                    bond.called,
                    'Expected logBaseEvent to have been called'
                ).to.eq(true);
                expect(
                    bond.args[0][0].type,
                    "Expected Event to be of type 'QoS'"
                ).to.eq(MediaEventType.UpdateQoS);
                expect(
                    bond.args[0][0].messageType,
                    "Expected Event to have a messageType of 'Media'"
                ).to.eq(MessageType.Media);
                expect(
                    bond.args[0][0].qos,
                    'Expect to have a valid QoS object'
                ).to.eql(qos);
            });
        });
    });
});

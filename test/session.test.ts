import { MediaSession } from '../src/session';
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
    EventType,
    ValidMediaAttributeKeys,
} from '../src/types';

let sandbox: SinonSandbox;
let mp: MpSDKInstance;
let mpMedia: MediaSession;
let song: MediaContent;

describe('MediaSession', () => {
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
            song.streamType,
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

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
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Ad Break Start'",
            ).to.eq(MediaEventType.AdBreakStart);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(
                bond.args[0][0].adBreak,
                'Expected valid AdBreak object within payload',
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

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const adBreak: AdBreak = {
                id: '08123410',
                title: 'mid-roll',
                duration: 10000,
            };

            const options = {
                customAttributes: {
                    content_rating: 'epic',
                    additional: {
                        attribute: 'foo',
                    },
                },
                currentPlayheadPosition: 32,
            };

            mpMedia.logAdBreakStart(adBreak, options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );

            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
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
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Ad Break End'",
            ).to.eq(MediaEventType.AdBreakEnd);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(
                bond.args[0][0].adBreak,
                'Expected valid AdBreak object within payload',
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

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logAdBreakEnd(options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
        });

        it('should pause mediaContentTimeSpent when pauseOnAdBreak is true', async () => {
            const mediaSessionAttributes = {
                session_name: 'amazing-current-session',
                session_start_time: 'right-now',
                custom_session_value: 'this-is-custom',
            };

            const customSession: MediaSession = new MediaSession(
                mp,
                song.contentId,
                song.title,
                song.duration,
                song.contentType,
                song.streamType,
                false,
                true,
                true,
                mediaSessionAttributes,
            );

            const bond = sinon.spy(mp, 'logBaseEvent');

            customSession.logMediaSessionStart();

            const options = {
                customAttributes: {
                    content_rating: 'epic',
                },
                currentPlayheadPosition: 0,
            };

            const adBreak: AdBreak = {
                id: '08123410',
                title: 'mid-roll',
                duration: 10000,
            };

            // logPlay is triggered to start media content time tracking.
            customSession.logPlay(options);
            // 100ms delay added to account for the time spent on media content.
            await new Promise(f => setTimeout(f, 100));
            customSession.logAdBreakStart(adBreak);
            // Another 100ms delay added after logPause is triggered to account for time spent on media session (total = +200ms).
            await new Promise(f => setTimeout(f, 100));
            customSession.logAdBreakEnd(options);
            // Another 100ms delay added after logPause is triggered to account for time spent on media session (total = +200ms).
            await new Promise(f => setTimeout(f, 100));
            customSession.logMediaSessionEnd(options);

            // the 6th event in bond.args is the Media Session Summary which contains the mediaContentTimeSpent and mediaTimeSpent.
            const mpMediaContentTimeSpent =
                bond.args[5][0].options.customAttributes
                    .media_content_time_spent;

            // the mediaContentTimeSpent varies in value each test run by a millisecond or two (i,e value is could be 100ms, 101ms, 102ms)
            // and we can't determine the exact value, hence the greaterThanOrEqual and lessThanOrEqual tests.
            expect(mpMediaContentTimeSpent).to.greaterThanOrEqual(200);
            expect(mpMediaContentTimeSpent).to.lessThanOrEqual(300);
        });

        it('should not pause mediaContentTimeSpent when pauseOnAdBreak is false', async () => {
            const mediaSessionAttributes = {
                session_name: 'amazing-current-session',
                session_start_time: 'right-now',
                custom_session_value: 'this-is-custom',
            };

            const customSession: MediaSession = new MediaSession(
                mp,
                song.contentId,
                song.title,
                song.duration,
                song.contentType,
                song.streamType,
                false,
                true,
                false,
                mediaSessionAttributes,
            );

            const bond = sinon.spy(mp, 'logBaseEvent');

            customSession.logMediaSessionStart();

            const options = {
                customAttributes: {
                    content_rating: 'epic',
                },
                currentPlayheadPosition: 0,
            };

            const adBreak: AdBreak = {
                id: '08123410',
                title: 'mid-roll',
                duration: 10000,
            };

            // logPlay is triggered to start media content time tracking.
            customSession.logPlay(options);
            // 100ms delay added to account for the time spent on media content.
            await new Promise(f => setTimeout(f, 100));
            customSession.logAdBreakStart(adBreak);
            // Another 100ms delay added after logPause is triggered to account for time spent on media session (total = +200ms).
            await new Promise(f => setTimeout(f, 100));
            customSession.logAdBreakEnd(options);
            // Another 100ms delay added after logPause is triggered to account for time spent on media session (total = +200ms).
            await new Promise(f => setTimeout(f, 100));
            customSession.logMediaSessionEnd(options);

            // the 6th event in bond.args is the Media Session Summary which contains the mediaContentTimeSpent and mediaTimeSpent.
            const mpMediaContentTimeSpent =
                bond.args[5][0].options.customAttributes
                    .media_content_time_spent;

            // the mediaContentTimeSpent varies in value each test run by a millisecond or two (i,e value is could be 100ms, 101ms, 102ms)
            // and we can't determine the exact value, hence the greaterThanOrEqual and lessThanOrEqual tests.
            expect(mpMediaContentTimeSpent).to.greaterThanOrEqual(300);
            expect(mpMediaContentTimeSpent).to.lessThanOrEqual(400);
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
                placement: 'first',
                position: 0,
            };

            mpMedia.logAdStart(adContent);

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Ad Start'",
            ).to.eq(MediaEventType.AdStart);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(
                bond.args[0][0].adContent,
                'Expected to have a valid Ad Content Payload',
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
                placement: 'first',
                position: 0,
            };

            mpMedia.logAdStart(adContent);

            expect(mpMedia.adContent).to.exist.and.eq(adContent);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const adContent: AdContent = {
                id: '1121220',
                advertiser: 'Planet Express',
                title: 'Good News Everbody!',
                campaign: 'Omicron Persei 8 Dinner Tours',
                duration: 60000,
                creative: "We'll be happy to have you for dinner",
                siteid: 'op8',
                placement: 'first',
                position: 0,
            };

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logAdStart(adContent, options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
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
                placement: 'first',
                position: 0,
            };

            mpMedia.adContent = adContent;
            mpMedia.logAdEnd();

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Ad End'",
            ).to.eq(MediaEventType.AdEnd);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);

            expect(
                bond.args[0][0].adContent,
                'Expected valid Ad Content in payload',
            ).to.eql(adContent);
        });

        it('should call core.logBaseEvent with an AdSummary Event with a valid payload', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const adContent: AdContent = {
                id: '1121220',
                advertiser: 'Planet Express',
                title: 'Good News Everbody!',
                campaign: 'Omicron Persei 8 Dinner Tours',
                duration: 60000,
                creative: "We'll be happy to have you for dinner",
                siteid: 'op8',
                placement: 'first',
                position: 0,
                adStartTimestamp: 201,
            };

            mpMedia.adContent = adContent;
            mpMedia.logAdEnd();

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[1][0].eventType,
                "Expected Event to be of type 'Ad Summary'",
            ).to.eq(MediaEventType.AdSummary);
            expect(
                bond.args[1][0].customAttributes[
                    ValidMediaAttributeKeys.adContentEndTimestampKey
                ],
                'Expected valid media adContentEndTimestampKey in payload',
            ).to.exist;
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
                placement: 'first',
                position: 0,
            };

            mpMedia.adContent = adContent;
            mpMedia.logAdEnd();

            expect(mpMedia.adContent).to.eq(undefined);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logAdEnd(options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
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
                placement: 'first',
                position: 0,
            };

            mpMedia.adContent = adContent;
            mpMedia.logAdSkip();

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Ad Skip'",
            ).to.eq(MediaEventType.AdSkip);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(
                bond.args[0][0].adContent,
                'Expected to have a valid Ad Content Payload',
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
                placement: 'first',
                position: 0,
            };

            mpMedia.adContent = adContent;
            mpMedia.logAdSkip();

            expect(mpMedia.adContent).to.eq(undefined);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logAdSkip(options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
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
                placement: 'first',
                position: 0,
            };

            mpMedia.logAdClick(adContent);

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Ad Click'",
            ).to.eq(MediaEventType.AdClick);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(
                bond.args[0][0].adContent,
                'Expected to have a valid Ad Content Payload',
            ).to.eql(adContent);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const adContent: AdContent = {
                id: '1121220',
                advertiser: 'Planet Express',
                title: 'Good News Everbody!',
                campaign: 'Omicron Persei 8 Dinner Tours',
                duration: 60000,
                creative: "We'll be happy to have you for dinner",
                siteid: 'op8',
                placement: 'first',
                position: 0,
            };

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logAdClick(adContent, options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
        });
    });

    describe('#logBufferStart', () => {
        it('should call core.logBaseEvent with a valid payload', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logBufferStart(320, 20, 201);
            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);

            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Buffer Start'",
            ).to.eq(MediaEventType.BufferStart);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(bond.args[0][0].bufferDuration).to.eq(320);
            expect(bond.args[0][0].bufferPercent).to.eq(20);
            expect(bond.args[0][0].bufferPosition).to.eq(201);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logBufferStart(320, 20, 201, options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
        });
    });

    describe('#logBufferEnd', () => {
        it('should call core.logBaseEvent with a valid payload', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logBufferEnd(99, 2, 341);

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Buffer End'",
            ).to.eq(MediaEventType.BufferEnd);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(bond.args[0][0].bufferDuration).to.eq(99);
            expect(bond.args[0][0].bufferPercent).to.eq(2);
            expect(bond.args[0][0].bufferPosition).to.eq(341);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logBufferEnd(99, 2, 341, options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
        });
    });

    describe('#logSeekStart', () => {
        it('should call core.logBaseEvent with a valid payload', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logSeekStart(421);

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Seek Start'",
            ).to.eq(MediaEventType.SeekStart);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(bond.args[0][0].seekPosition).to.eq(421);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logSeekStart(341, options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
        });
    });

    describe('#logSeekEnd', () => {
        it('should call core.logBaseEvent with a valid payload', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logSeekEnd(999);

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Seek End'",
            ).to.eq(MediaEventType.SeekEnd);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(bond.args[0][0].seekPosition).to.eq(999);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logSeekEnd(111, options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
        });
    });

    describe('#logPlayheadPosition', () => {
        it('should call core.logBaseEvent with a valid payload', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logPlayheadPosition(1234);

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Playhead Position'",
            ).to.eq(MediaEventType.UpdatePlayheadPosition);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(bond.args[0][0].playheadPosition).to.eq(1234);
        });
    });

    describe('#logMediaSessionStart', () => {
        it('should call core.logBaseEvent with a valid payload', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logMediaSessionStart();

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Media Start'",
            ).to.eq(MediaEventType.SessionStart);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logMediaSessionStart(options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
        });

        it('accepts currentPlayheadPosition with a value of 0', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 0,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logMediaSessionStart(options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(0);
        });
    });

    describe('#logMediaSessionEnd', () => {
        it('should call core.logBaseEvent with a valid payload', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logMediaSessionEnd();

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Media End'",
            ).to.eq(MediaEventType.SessionEnd);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logMediaSessionEnd(options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
        });

        it('returns false if media is not complete', () => {
            const bond = sinon.fake();

            const finiteMediaObject = new MediaSession(
                mp,
                song.contentId,
                song.title,
                song.duration,
                song.contentType,
                song.streamType,
            );

            finiteMediaObject.mediaEventListener = bond;
            finiteMediaObject.mediaContentCompleteLimit = 50;

            finiteMediaObject.logMediaSessionStart();
            finiteMediaObject.logPlay();
            finiteMediaObject.logPlayheadPosition(song.duration / 4);

            // Intentionally firing without logMediaContentComplete
            // to test calculation in logEvent
            finiteMediaObject.logMediaSessionEnd();

            expect(bond.args[4][0].customAttributes.media_content_complete).to
                .be.false;
        });

        it('returns true if media mediaContentCompletLimit is reached', () => {
            const bond = sinon.fake();

            const finiteMediaObject = new MediaSession(
                mp,
                song.contentId,
                song.title,
                song.duration,
                song.contentType,
                song.streamType,
            );

            finiteMediaObject.mediaEventListener = bond;
            finiteMediaObject.mediaContentCompleteLimit = 50;

            finiteMediaObject.logMediaSessionStart();
            finiteMediaObject.logPlay();

            // Assume 60% has played
            finiteMediaObject.logPlayheadPosition(song.duration * 0.6);

            // Intentionally firing without logMediaContentComplete
            // to test calculation in logEvent
            finiteMediaObject.logMediaSessionEnd();

            expect(bond.args[4][0].customAttributes.media_content_complete).to
                .be.true;
        });
    });

    describe('#logPlay', () => {
        it('should call core.logBaseEvent with a valid payload', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logPlay();

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Play'",
            ).to.eq(MediaEventType.Play);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };
            mpMedia.logPlay(options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
        });
    });

    describe('#logPause', () => {
        it('should call core.logBaseEvent with a valid payload', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logPause();

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Pause'",
            ).to.eq(MediaEventType.Pause);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };
            mpMedia.logPause(options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
        });

        it('should pause mediaContentTimeSpent', async () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                customAttributes: {
                    content_rating: 'epic',
                },
                currentPlayheadPosition: 0,
            };

            // logPlay is triggered to start media content time tracking.
            mpMedia.logPlay(options);
            // 100ms delay added to account for the time spent on media content.
            await new Promise(f => setTimeout(f, 100));
            mpMedia.logPause(options);
            // Another 100ms delay added after logPause is triggered to account for time spent on media session (total = +200ms).
            await new Promise(f => setTimeout(f, 100));
            mpMedia.logMediaSessionEnd(options);

            // the 4th event in bond.args is the Media Session Summary which contains the mediaContentTimeSpent and mediaTimeSpent.
            const mpMediaContentTimeSpent =
                bond.args[3][0].options.customAttributes
                    .media_content_time_spent;
            const mpMediaTimeSpent =
                bond.args[3][0].options.customAttributes.media_time_spent;

            expect(mpMediaContentTimeSpent).to.not.eql(mpMediaTimeSpent);

            // the mediaContentTimeSpent varies in value each test run by a millisecond or two (i,e value is could be 100ms, 101ms, 102ms)
            // and we can't determine the exact value, hence the greaterThanOrEqual and lessThanOrEqual tests.
            expect(mpMediaContentTimeSpent).to.greaterThanOrEqual(100);
            expect(mpMediaContentTimeSpent).to.lessThanOrEqual(200);

            // the mediaTimeSpent varies in value each test run by a millisecond or two (i,e value is could be 200ms, 201ms, 202ms)
            // and we can't determine the exact value, hence the greaterThanOrEqual and lessThanOrEqual tests.
            expect(mpMediaTimeSpent).to.greaterThanOrEqual(200);
            expect(mpMediaTimeSpent).to.lessThanOrEqual(300);
        });
    });

    describe('#logMediaContentEnd', () => {
        it('should call core.logBaseEvent with a valid payload', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logMediaContentEnd();

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Media Content Start'",
            ).to.eq(MediaEventType.ContentEnd);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
        });

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };
            mpMedia.logMediaContentEnd(options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
        });

        it('should pause mediaContentTimeSpent', async () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                customAttributes: {
                    content_rating: 'epic',
                },
                currentPlayheadPosition: 0,
            };

            // logPlay is triggered to start media content time tracking.
            mpMedia.logPlay(options);
            // 100ms delay added to account for the time spent on media content.
            await new Promise(f => setTimeout(f, 100));
            mpMedia.logMediaContentEnd(options);
            // Another 100ms delay added after logMediaContentEnd is triggered to account for time spent on media session (total = +200ms).
            await new Promise(f => setTimeout(f, 100));
            mpMedia.logMediaSessionEnd(options);

            // the 4th event in bond.args is the Media Session Summary which contains the mediaContentTimeSpent and mediaTimeSpent.
            const mpMediaContentTimeSpent =
                bond.args[3][0].options.customAttributes
                    .media_content_time_spent;
            const mpMediaTimeSpent =
                bond.args[3][0].options.customAttributes.media_time_spent;

            expect(mpMediaContentTimeSpent).to.not.eql(mpMediaTimeSpent);

            // the mediaContentTimeSpent varies in value each test run by a millisecond or two (i,e value is could be 100ms, 101ms, 102ms)
            // and we can't determine the exact value, hence the greaterThanOrEqual and lessThanOrEqual tests.
            expect(mpMediaContentTimeSpent).to.greaterThanOrEqual(100);
            expect(mpMediaContentTimeSpent).to.lessThanOrEqual(200);

            // the mediaTimeSpent varies in value each test run by a millisecond or two (i,e value is could be 200ms, 201ms, 202ms)
            // and we can't determine the exact value, hence the greaterThanOrEqual and lessThanOrEqual tests.
            expect(mpMediaTimeSpent).to.greaterThanOrEqual(200);
            expect(mpMediaTimeSpent).to.lessThanOrEqual(300);
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
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Segment Start'",
            ).to.eq(MediaEventType.SegmentStart);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(
                bond.args[0][0].segment,
                'Expect to have a valid Segment',
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

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const segment: Segment = {
                title: 'The Gang Write Some Code',
                index: 4,
                duration: 36000,
            };

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };
            mpMedia.logSegmentStart(segment, options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
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
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Segment End'",
            ).to.eq(MediaEventType.SegmentEnd);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(
                bond.args[0][0].segment,
                'Expect to have a valid Segment',
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

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logSegmentEnd(options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
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
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'Segment Skip'",
            ).to.eq(MediaEventType.SegmentSkip);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(
                bond.args[0][0].segment,
                'Expect to have a valid Segment',
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

        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const options = {
                currentPlayheadPosition: 32,
                customAttributes: {
                    content_rating: 'epic',
                },
            };
            mpMedia.logSegmentSkip(options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );
            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(32);
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

            mpMedia.logQoS({
                startupTime: qos.startupTime,
                fps: qos.fps,
                bitRate: qos.bitRate,
                droppedFrames: qos.droppedFrames,
            });

            expect(
                bond.called,
                'Expected logBaseEvent to have been called',
            ).to.eq(true);
            expect(
                bond.args[0][0].eventType,
                "Expected Event to be of type 'QoS'",
            ).to.eq(MediaEventType.UpdateQoS);
            expect(
                bond.args[0][0].messageType,
                "Expected Event to have a messageType of 'Media'",
            ).to.eq(MessageType.Media);
            expect(
                bond.args[0][0].qos,
                'Expect to have a valid QoS object',
            ).to.eql(qos);
        });

        it("should update the session's QoS object", () => {
            const qos: QoS = {
                startupTime: 201,
                fps: 42,
                bitRate: 2,
                droppedFrames: 3,
            };
            mpMedia.logQoS({
                startupTime: qos.startupTime,
            });

            mpMedia.logQoS({
                fps: qos.fps,
            });

            mpMedia.logQoS({
                bitRate: qos.bitRate,
            });

            mpMedia.logQoS({
                droppedFrames: qos.droppedFrames,
            });

            const {
                qos_fps,
                qos_startup_time,
                qos_bitrate,
                qos_dropped_frames,
            } = mpMedia.getQoSAttributes();

            expect(qos_startup_time).to.eq(qos.startupTime);
            expect(qos_fps).to.eq(qos.fps);
            expect(qos_bitrate).to.eq(qos.bitRate);
            expect(qos_dropped_frames).to.eq(qos.droppedFrames);
        });
        it('accepts optional parameters', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            const qos: QoS = {
                startupTime: 201,
                fps: 42,
                bitRate: 2,
                droppedFrames: 3,
            };
            const options = {
                currentPlayheadPosition: 42,
                customAttributes: {
                    content_rating: 'epic',
                },
            };

            mpMedia.logQoS(qos, options);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                options.customAttributes,
            );

            expect(bond.args[0][0].options.currentPlayheadPosition).to.eq(
                options.currentPlayheadPosition,
            );
        });
    });

    describe('#createPageEvent', () => {
        it('should trigger a custom event', () => {
            const customEvent = mpMedia.createPageEvent('Milestone', {
                reached: '95%',
                integerValue: 201,
            });

            expect(customEvent).to.eql({
                name: 'Milestone',
                messageType: MessageType.PageEvent,
                eventType: EventType.Media,
                data: {
                    content_title: 'Immigrant Song',
                    content_id: '023134',
                    content_duration: 120000,
                    content_type: 'Video',
                    stream_type: 'OnDemand',
                    media_session_id: '', // Media Session ID is a blank uuid that gets set on Media Session Start
                    reached: '95%',
                    integerValue: 201,
                },
            });
        });
    });

    describe('Custom Attributes', () => {
        it('should include session attributes in Events when provided', () => {
            const mediaSessionAttributes = {
                session_name: 'amazing-current-session',
                session_start_time: 'right-now',
                custom_session_value: 'this-is-custom',
            };

            const customSession: MediaSession = new MediaSession(
                mp,
                song.contentId,
                song.title,
                song.duration,
                song.contentType,
                song.streamType,
                false,
                true,
                false,
                mediaSessionAttributes,
            );

            const bond = sinon.spy(mp, 'logBaseEvent');

            customSession.logMediaSessionStart();

            expect(bond.called).to.eq(true);

            expect(bond.args[0][0].options.customAttributes).to.eqls(
                mediaSessionAttributes,
            );
        });

        it('should allow Events to override Session Custom Attributes', () => {
            const customSession: MediaSession = new MediaSession(
                mp,
                song.contentId,
                song.title,
                song.duration,
                song.contentType,
                song.streamType,
                false,
                true,
                false,
                {
                    session_name: 'amazing-current-session',
                    session_start_time: 'right-now',
                    custom_session_value: 'this-is-custom',
                },
            );

            const bond = sinon.spy(mp, 'logBaseEvent');

            customSession.logMediaSessionStart({
                customAttributes: {
                    custom_event_value: 'start-session',
                },
            });

            customSession.logPlay({
                customAttributes: {
                    custom_session_value: 'override-session-attributes',
                },
            });

            customSession.logMediaSessionEnd();

            expect(bond.called).to.eq(true);

            const sessionStartEventAttrs =
                bond.args[0][0].options.customAttributes;
            const mediaPlayEventAttrs =
                bond.args[1][0].options.customAttributes;
            const sessionEndEventAttrs =
                bond.args[2][0].options.customAttributes;

            expect(
                sessionStartEventAttrs,
                'Session Start: Add New Event Custom Attribute',
            ).to.eqls({
                custom_event_value: 'start-session',
                session_name: 'amazing-current-session',
                session_start_time: 'right-now',
                custom_session_value: 'this-is-custom',
            });

            expect(
                mediaPlayEventAttrs,
                'Media Play: Override Session Attribute',
            ).to.eqls({
                custom_session_value: 'override-session-attributes',
                session_name: 'amazing-current-session',
                session_start_time: 'right-now',
            });

            expect(
                sessionEndEventAttrs,
                'Session End: Session Attributes Only',
            ).to.eqls({
                session_name: 'amazing-current-session',
                session_start_time: 'right-now',
                custom_session_value: 'this-is-custom',
            });
        });
    });

    describe('Media Session Attributes', () => {
        it('should get mediaTimeSpent based on current time', async () => {
            const options = {
                customAttributes: {
                    content_rating: 'epic',
                },
                currentPlayheadPosition: 0,
            };

            // logPlay is triggered to start media content time tracking.
            mpMedia.logPlay(options);
            // 100ms delay added to account for the time spent on media content.
            await new Promise(f => setTimeout(f, 100));
            mpMedia.logPause(options);
            // Another 100ms delay added after logPause is triggered to account for time spent on media session (total = +200ms).
            await new Promise(f => setTimeout(f, 100));

            const mpMediaTimeSpent = mpMedia['mediaTimeSpent']();
            // the mediaTimeSpent varies in value each test run by a millisecond or two (i,e value is could be 200ms, 201ms, 202ms)
            // and we can't determine the exact value, hence the greaterThanOrEqual and lessThanOrEqual tests.
            expect(mpMediaTimeSpent).to.greaterThanOrEqual(200);
            expect(mpMediaTimeSpent).to.lessThanOrEqual(300);
        });
    });
});

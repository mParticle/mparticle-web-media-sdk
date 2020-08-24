import MediaSession from '../src';
import { expect } from 'chai';
import sinon, { SinonSandbox } from 'sinon';
import { MediaEvent } from '../src/events';
import {
    MessageType,
    MediaContent,
    MediaContentType,
    MediaStreamType,
    MpSDKInstance,
    EventType,
    AdContent,
    Segment,
    ValidMediaAttributeKeys,
} from '../src/types';

let sandbox: SinonSandbox;
let mp: MpSDKInstance;
let mpMedia: MediaSession;
let song: MediaContent;

describe('TS Integration Tests', () => {
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

    // TODO: Maybe have tests that use event and session?
    describe('Media Event Listener', () => {
        beforeEach(() => {
            mpMedia.logPageEvent = false;
            mpMedia.logMediaEvent = false;
        });

        it('should fire a callback', () => {
            const bond = sinon.fake();

            mpMedia.mediaEventListener = bond;
            mpMedia.logPlay();
            mpMedia.logPause();
            mpMedia.logBufferStart(320, 20, 201);

            expect(
                bond.called,
                'Expected Media Event Listener Callback to have beeen called'
            ).to.eq(true);
            expect(bond.callCount).to.eq(3);

            expect(bond.args[0][0].name).to.eq('Play');
            expect(bond.args[1][0].name).to.eq('Pause');
            expect(bond.args[2][0].name).to.eq('Buffer Start');

            bond.args.forEach(arg => {
                expect(arg[0]).to.be.instanceOf(MediaEvent);
            });
        });

        it('should log MP Events', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logPlay();

            expect(
                bond.called,
                'Expected logBaseEvent to NOT have been called'
            ).to.eq(false);

            mpMedia.logPageEvent = true;
            mpMedia.logPlay();

            expect(
                bond.called,
                'Expected logBaseEvent to have been called'
            ).to.eq(true);
        });

        it('should log Media Events', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logPlay();

            expect(
                bond.called,
                'Expected logBaseEvent to NOT have been called'
            ).to.eq(false);

            mpMedia.logMediaEvent = true;
            mpMedia.logPlay();

            expect(
                bond.called,
                'Expected logBaseEvent to have been called'
            ).to.eq(true);
        });

        it('should fire an mp as a flat event', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logPageEvent = true;
            mpMedia.logMediaSessionStart();

            const expectedObject = {
                name: 'Media Session Start',
                messageType: MessageType.PageEvent,
                eventType: EventType.Media,
                data: {
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_duration: 120000,
                    content_type: 'Video',
                    stream_type: 'OnDemand',
                    playhead_position: 0,
                    media_session_id: mpMedia.sessionId,
                },
            };

            expect(
                bond.args[0][0],
                'Expected Media event to be an MPEvent'
            ).to.eqls(expectedObject);
        });

        it('should not fire update playhead position when logMpEvent is true', () => {
            const bond = sinon.spy(mp, 'logBaseEvent');

            mpMedia.logPageEvent = true;
            mpMedia.logPlayheadPosition(116);

            expect(
                bond.called,
                'Expected Media event NOT call Updated Playhead Position'
            ).to.eq(false);
        });

        it('should fire a sessionSummary', () => {
            const bond = sinon.fake();

            const segment: Segment = {
                title: 'The Gang Write Some Code',
                index: 0,
                duration: 36000,
            };

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

            mpMedia.mediaEventListener = bond;
            mpMedia.logMediaSessionStart();
            mpMedia.logPlay();
            mpMedia.logSegmentStart(segment);
            mpMedia.logSegmentEnd();
            mpMedia.logAdStart(adContent);
            mpMedia.logAdEnd();

            mpMedia.logMediaSessionEnd();

            expect(
                bond.called,
                'Expected Media Event Listener Callback to have beeen called'
            ).to.eq(true);
            expect(bond.callCount).to.eq(10);

            expect(bond.args[0][0].name).to.eq('Media Session Start');
            expect(bond.args[1][0].name).to.eq('Play');
            expect(bond.args[2][0].name).to.eq('Segment Start');
            expect(bond.args[3][0].name).to.eq('Segment End');
            expect(bond.args[4][0].name).to.eq('Media Segment Summary');
            expect(bond.args[5][0].name).to.eq('Ad Start');
            expect(bond.args[6][0].name).to.eq('Ad End');
            expect(bond.args[7][0].name).to.eq('Media Ad Summary');
            expect(bond.args[8][0].name).to.eq('Media Session End');
            expect(bond.args[9][0].name).to.eq('Media Session Summary');

            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.mediaSessionIdKey
                ]
            ).to.eq(mpMedia.sessionId);
            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.startTimestampKey
                ]
            );
            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.endTimestampKey
                ]
            );
            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.contentIdKey
                ]
            ).to.eq(mpMedia.contentId);
            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.contentTitleKey
                ]
            ).to.eq(mpMedia.title);
            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.mediaTimeSpentKey
                ]
            );
            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.contentTimeSpentKey
                ]
            );
            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.contentCompleteKey
                ]
            ).to.eq(false);
            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.totalSegmentsKey
                ]
            ).to.eq(1);
            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.totalAdTimeSpentKey
                ]
            );
            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.adTimeSpentRateKey
                ]
            );
            expect(
                bond.args[9][0].customAttributes[
                    ValidMediaAttributeKeys.totalAdsKey
                ]
            ).to.eq(1);
            expect(
                bond.args[3][0].customAttributes[
                    ValidMediaAttributeKeys.adIDsKey
                ]
            );

            bond.args.forEach(arg => {
                expect(arg[0]).to.be.instanceOf(MediaEvent);
            });
        });

        it('should fire a Segment Summary', () => {
            const bond = sinon.fake();

            const segment: Segment = {
                title: 'The Gang Write Some Code',
                index: 0,
                duration: 36000,
            };

            mpMedia.mediaEventListener = bond;
            mpMedia.logMediaSessionStart();
            mpMedia.logPlay();
            mpMedia.logSegmentStart(segment);
            mpMedia.logSegmentEnd();

            expect(
                bond.called,
                'Expected Media Event Listener Callback to have beeen called'
            ).to.eq(true);
            expect(bond.callCount).to.eq(5);

            expect(bond.args[0][0].name).to.eq('Media Session Start');
            expect(bond.args[1][0].name).to.eq('Play');
            expect(bond.args[2][0].name).to.eq('Segment Start');
            expect(bond.args[3][0].name).to.eq('Segment End');
            expect(bond.args[4][0].name).to.eq('Media Segment Summary');

            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.mediaSessionIdKey
                ]
            ).to.eq(mpMedia.sessionId);
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.contentIdKey
                ]
            ).to.eq(mpMedia.contentId);
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.segmentIndexKey
                ]
            ).to.eq(0);
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.segmentTitleKey
                ]
            ).to.eq('The Gang Write Some Code');
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.segmentStartTimestampKey
                ]
            );
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.segmentEndTimestampKey
                ]
            );
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.segmentTimeSpentKey
                ]
            );
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.segmentSkippedKey
                ]
            ).to.eq(false);
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.segmentCompletedKey
                ]
            ).to.eq(true);

            bond.args.forEach(arg => {
                expect(arg[0]).to.be.instanceOf(MediaEvent);
            });
        });

        it('should fire a Ad Summary', () => {
            const bond = sinon.fake();

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

            mpMedia.mediaEventListener = bond;
            mpMedia.logMediaSessionStart();
            mpMedia.logPlay();
            mpMedia.logAdStart(adContent);
            mpMedia.logAdEnd();

            expect(
                bond.called,
                'Expected Media Event Listener Callback to have beeen called'
            ).to.eq(true);
            expect(bond.callCount).to.eq(5);

            expect(bond.args[0][0].name).to.eq('Media Session Start');
            expect(bond.args[1][0].name).to.eq('Play');
            expect(bond.args[2][0].name).to.eq('Ad Start');
            expect(bond.args[3][0].name).to.eq('Ad End');
            expect(bond.args[4][0].name).to.eq('Media Ad Summary');

            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.mediaSessionIdKey
                ]
            ).to.eq(mpMedia.sessionId);
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.adBreakIdKey
                ]
            ).to.eq(undefined);
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.adContentIdKey
                ]
            ).to.eq(adContent.id);
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.adContentTitleKey
                ]
            ).to.eq(adContent.title);
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.adContentStartTimestampKey
                ]
            );
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.adContentEndTimestampKey
                ]
            );
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.segmentTimeSpentKey
                ]
            );
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.adContentSkippedKey
                ]
            ).to.eq(false);
            expect(
                bond.args[4][0].customAttributes[
                    ValidMediaAttributeKeys.adContentCompletedKey
                ]
            ).to.eq(true);

            bond.args.forEach(arg => {
                expect(arg[0]).to.be.instanceOf(MediaEvent);
            });
        });
    });

    describe('Properties', () => {
        describe('currentPlayheadPosition', () => {
            it('should update via custom attributes', () => {
                expect(mpMedia.getAttributes().playhead_position).equal(0);
                mpMedia.logPlay({ currentPlayheadPosition: 42 });
                expect(mpMedia.getAttributes().playhead_position).equal(42);
            });

            it('should maintain playhead position for every log method', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');
                expect(mpMedia.getAttributes().playhead_position).equal(0);
                mpMedia.logPlayheadPosition(60);

                expect(mpMedia.getAttributes().playhead_position).equal(60);
                expect(
                    bond.args[0][0].playheadPosition,
                    'Logging playhead position should persist'
                ).equal(60);

                mpMedia.logPlay({ currentPlayheadPosition: 97 });

                expect(mpMedia.getAttributes().playhead_position).equal(97);
                expect(
                    bond.args[1][0].playheadPosition,
                    'Passing playhead position as option should persist'
                ).equal(97);

                mpMedia.logPause();
                expect(mpMedia.getAttributes().playhead_position).equal(97);
                expect(
                    bond.args[2][0].playheadPosition,
                    'Playhead position from session should persist'
                ).equal(97);
            });
        });
    });
});

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
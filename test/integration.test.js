const sinon = require('sinon');
const { expect } = require('chai');
const MediaSession = require('../dist/mparticle-media.common');

let sandbox;
let song;
let mp;
let mpMedia;

describe('JS Integration Tests', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mp = {
            logBaseEvent: (event) => {},
            logger: (message) => {},
        };

        song = {
            contentId: '023134',
            title: 'Immigrant Song',
            duration: 120000,
            contentType: 'Video',
            streamType: 'OnDemand',
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
                messageType: 4, // PageEvent
                eventType: 9, // Media
                data: {
                    content_id: '023134',
                    content_title: 'Immigrant Song',
                    content_duration: 120000,
                    content_type: 'Video',
                    stream_type: 'OnDemand',
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
                expect(mpMedia.getAttributes().playhead_position).to.be
                    .undefined;
                mpMedia.logPlay({ currentPlayheadPosition: 42 });
                expect(mpMedia.getAttributes().playhead_position).equal(42);
            });

            it('should maintain playhead position for every log method', () => {
                const bond = sinon.spy(mp, 'logBaseEvent');
                expect(mpMedia.getAttributes().playhead_position).to.be
                    .undefined;

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

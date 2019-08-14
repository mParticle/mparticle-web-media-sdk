import {
    MediaContentType,
    MediaStreamType,
    MediaEventType,
    MessageType,
    AdContent,
    Segment,
    AdBreak,
    QoS,
} from './types';

import { getNameFromType, uuid } from './utils';

/**
 * Server Representation of an Event
 */
export type EventAPIObject = {
    /**
     *  The name of the event or a valid [[MessageType]]
     */
    EventName: string | number;
    /**
     * Corresponds to [[EventType]] in Core SDK
     */
    EventCategory: number;
    /**
     * Corresponds to [[MessageType]]
     */
    EventDataType: number;
    /**
     * A nested object of custom event attributes
     */
    EventAttributes?: { [key: string]: string };
    /**
     * @hidden
     */
    // tslint:disable-next-line: no-any
    [key: string]: any;
};

/**
 * Represents a Base event for mParticle Core
 */

export abstract class BaseEvent {
    /**
     *
     * @param name The name of the event
     * @param type an Event Type that corresponds to [EventType](https://github.com/mParticle/mparticle-web-sdk/blob/master/src/types.js) in Core SDK
     * @param messageType A message type that corresponds to MessageType
     */
    constructor(
        public name: string,
        public type: number,
        public messageType: MessageType
    ) {}

    /**
     * @hidden Abstract representation of a Base Event for the Server model in Core SDK
     */
    abstract toEventAPIObject = (): void => {};
}

/**
 * Represents a single media event. Generally you won't call this class directly. The Media SDK calls this class internally when you invoke methods on [[MediaSession]].
 */
export class MediaEvent extends BaseEvent {
    id: string = uuid();

    adContent?: AdContent;
    adBreak?: AdBreak;
    segment?: Segment;
    seekPosition?: number;
    bufferDuration?: number;
    bufferPercent?: number;
    bufferPosition?: number;
    playheadPosition?: number;
    qos?: QoS;

    /**
     * Constructor for Media Event
     * @param type Type of action being performed, i.e. play, pause, seek, etc.
     * @param contentTitle Title of the Media Content
     * @param contentId Unique Identifier for the Media Content
     * @param duration Length of time for the Media Content
     * @param contentType Content Type. i.e. video vs audio
     * @param streamType Stream Type i.e. live vs on demaind
     * @returns An instance of a Media Event
     */
    constructor(
        public type: MediaEventType,
        public contentTitle: string,
        public contentId: string,
        public duration: number,
        readonly contentType: MediaContentType,
        readonly streamType: MediaStreamType
    ) {
        super(getNameFromType(type), type, MessageType.Media);
    }

    /**
     * @hidden Representation of the Media Event for the server model
     */
    toEventAPIObject = (): EventAPIObject => {
        return {
            // Core Event Attributes
            EventName: this.name,
            EventCategory: this.type,
            EventDataType: this.messageType,

            AdContent: this.adContent,
            AdBreak: this.adBreak,
            Segment: this.segment,
            SeekPosition: this.seekPosition,
            BufferDuration: this.bufferDuration,
            BufferPercent: this.bufferPercent,
            BufferPosition: this.bufferPosition,
            PlayheadPosition: this.playheadPosition,
            QoS: this.qos,
            ContentTitle: this.contentTitle,
            ContentId: this.contentId,
            Duration: this.duration,
            ContentType: MediaContentType[this.contentType],
            StreamType: MediaStreamType[this.streamType],
        };
    };
}

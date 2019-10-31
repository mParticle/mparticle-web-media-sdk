import { MediaEventType, MediaEventName } from './types';

export const uuid = (): string => {
    // Thanks to StackOverflow user Briguy37
    // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const getNameFromType = (type: MediaEventType): string => {
    return MediaEventName[MediaEventType[type]];
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNameFromType = exports.uuid = void 0;
var types_1 = require("./types");
var uuid = function () {
    // Thanks to StackOverflow user Briguy37
    // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
exports.uuid = uuid;
var getNameFromType = function (type) {
    return types_1.MediaEventName[types_1.MediaEventType[type]];
};
exports.getNameFromType = getNameFromType;

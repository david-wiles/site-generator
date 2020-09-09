"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferPipeline = void 0;
var BufferPipeline = /** @class */ (function () {
    function BufferPipeline() {
        this.steps = new Array();
    }
    BufferPipeline.prototype.add = function () {
        var _a;
        var step = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            step[_i] = arguments[_i];
        }
        (_a = this.steps).push.apply(_a, step);
    };
    BufferPipeline.prototype.execute = function (buf, path) {
        this.steps.forEach(function (step) {
            buf = step.execute(buf, path);
        });
    };
    return BufferPipeline;
}());
exports.BufferPipeline = BufferPipeline;

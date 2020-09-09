"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineFactory = void 0;
var Markdown_1 = __importDefault(require("./Markdown"));
var DefaultEngine = /** @class */ (function () {
    function DefaultEngine() {
    }
    DefaultEngine.prototype.executeEngine = function (buf) {
        return buf;
    };
    return DefaultEngine;
}());
// Return the markup engine to used based on configuration
function EngineFactory(config) {
    switch (config.builder) {
        case "md": return new Markdown_1.default(config);
        default: return new DefaultEngine();
    }
}
exports.EngineFactory = EngineFactory;

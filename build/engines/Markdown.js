"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var markdown_it_1 = __importDefault(require("markdown-it"));
var MarkdownEngine = /** @class */ (function () {
    function MarkdownEngine(config) {
        this.md = new markdown_it_1.default();
    }
    MarkdownEngine.prototype.executeEngine = function (buf) {
        return Buffer.from(this.md.render(buf.toString()));
    };
    return MarkdownEngine;
}());
exports.default = MarkdownEngine;

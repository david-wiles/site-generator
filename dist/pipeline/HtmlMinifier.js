"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var html_minifier_1 = require("html-minifier");
var HtmlMinifier = /** @class */ (function () {
    function HtmlMinifier() {
    }
    HtmlMinifier.prototype.execute = function (buf, path) {
        return Buffer.from(html_minifier_1.minify(buf.toString()));
    };
    return HtmlMinifier;
}());
exports.default = HtmlMinifier;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
/**
 * Path provides a convenient way to get an absolute path from a relative one and store info related to the path
 */
var Path = /** @class */ (function () {
    function Path(p) {
        if (!p) {
            console.error("oops");
        }
        this.abs = p.charAt(0) === "/" ?
            p : process.cwd() + "/" + p;
        this.info = path.parse(this.abs);
    }
    // Construct a path from parts of a string
    Path.fromParts = function () {
        var parts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            parts[_i] = arguments[_i];
        }
        parts.forEach(function (part, idx, arr) {
            if (part[0] === "/" && idx != 0) {
                arr[idx] = part.substring(1);
            }
            if (part[part.length - 1] === "/") {
                arr[idx] = part.substring(0, part.length - 2);
            }
        });
        return new Path(parts.join("/"));
    };
    Path.prototype.absPath = function () {
        return this.abs;
    };
    Path.prototype.dir = function () {
        return this.info.dir;
    };
    Path.prototype.base = function () {
        return this.info.base;
    };
    return Path;
}());
exports.default = Path;

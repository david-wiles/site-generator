"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walkDir = exports.trimPrefix = void 0;
var Path_1 = __importDefault(require("./Path"));
var fs_1 = __importDefault(require("fs"));
// Remove the entire prefix from a string, if it exists
function trimPrefix(prefix, str) {
    var i = 0;
    if (prefix.length >= str.length)
        return str;
    else {
        while (i < prefix.length && prefix[i] === str[i])
            i += 1;
    }
    return str.substring(i);
}
exports.trimPrefix = trimPrefix;
// Recursive walk all directory entries, starting from a specific Path
function walkDir(dir, walkFn) {
    try {
        var entries = fs_1.default.readdirSync(dir.absPath());
        entries.forEach(function (entry) {
            walkFn(Path_1.default.fromParts(dir.absPath(), entry));
        });
    }
    catch (err) {
        console.error("Error:", err);
    }
}
exports.walkDir = walkDir;

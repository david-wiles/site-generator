"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Path_1 = __importDefault(require("./common/Path"));
var Config = /** @class */ (function () {
    function Config(root, templates, out, builder, writer, steps) {
        this.root = new Path_1.default(root);
        this.templates = Path_1.default.fromParts(root, templates);
        this.out = new Path_1.default(out);
        this.builder = builder;
        this.writer = writer;
        this.steps = steps;
    }
    Config.fromArgs = function (args) {
        return new Config(args.root, args.templates, args.out, args.builder, args.writer, args.steps);
    };
    return Config;
}());
exports.default = Config;
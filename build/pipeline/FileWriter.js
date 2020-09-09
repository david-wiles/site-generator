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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Path_1 = __importDefault(require("../common/Path"));
var fs_1 = __importDefault(require("fs"));
var utils = __importStar(require("../common/utils"));
var FileWriter = /** @class */ (function () {
    function FileWriter(config) {
        this.out = config.out;
        this.root = config.root;
    }
    FileWriter.prototype.execute = function (buf, inPath) {
        var outPath = new Path_1.default(this.out.absPath().concat(utils.trimPrefix(this.root.absPath(), inPath.absPath())));
        fs_1.default.mkdirSync(outPath.dir(), { recursive: true });
        fs_1.default.writeFile(outPath.absPath(), buf, function (err) { if (err)
            console.error("Error:", err); });
        return buf;
    };
    return FileWriter;
}());
exports.default = FileWriter;

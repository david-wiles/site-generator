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
exports.DataTemplate = exports.StaticTemplate = void 0;
var escape_string_regexp_1 = __importDefault(require("escape-string-regexp"));
var utils = __importStar(require("../common/utils"));
var fs = __importStar(require("fs"));
var StaticTemplate = /** @class */ (function () {
    function StaticTemplate(tmplDir, path, builder) {
        this.tmplDir = tmplDir;
        this.path = path;
        this.builder = builder;
    }
    StaticTemplate.prototype.build = function (page, useCache) {
        var text = this.builder.buildTemplates(this.path, useCache);
        var re = new RegExp("{{\\s*template\\s*\"" + escape_string_regexp_1.default(utils.relativePath(this.tmplDir, this.path)) + "\"\\s*}}", 'g');
        return page.replace(re, text);
    };
    StaticTemplate.prototype.setAsDependency = function (path) {
        this.builder.setTemplateDependency(path, this.path);
    };
    return StaticTemplate;
}());
exports.StaticTemplate = StaticTemplate;
var DataTemplate = /** @class */ (function () {
    function DataTemplate(tmplDir, path, dataPath, builder) {
        this.tmplDir = tmplDir;
        this.path = path;
        this.dataPath = dataPath;
        this.data = JSON.parse(fs.readFileSync(dataPath.absPath()).toString());
        this.builder = builder;
    }
    DataTemplate.prototype.build = function (page) {
        var text = this.builder.buildTemplates(this.path, false);
        // Replace placeholders with data from json string
        for (var _i = 0, _a = Object.entries(this.data); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], val = _b[1];
            var re_1 = new RegExp("{{\\s*" + escape_string_regexp_1.default(key) + "\\s*}}", 'g');
            text = text.replace(re_1, val.toString());
        }
        var re = new RegExp("{{\\s*template\\s*\"" + escape_string_regexp_1.default(utils.relativePath(this.tmplDir, this.path)) + "\"\\s*\"" + escape_string_regexp_1.default(utils.relativePath(this.tmplDir, this.dataPath)) + "\"\\s*}}", 'g');
        return page.replace(re, text);
    };
    DataTemplate.prototype.setAsDependency = function (path) {
        this.builder.setTemplateDependency(path, this.path);
        this.builder.setTemplateDependency(path, this.dataPath);
    };
    return DataTemplate;
}());
exports.DataTemplate = DataTemplate;
//# sourceMappingURL=Template.js.map
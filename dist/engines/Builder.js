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
var escape_string_regexp_1 = __importDefault(require("escape-string-regexp"));
var utils = __importStar(require("../common/utils"));
var Engines_1 = require("./Engines");
/**
 * class Builder
 *
 * This is the implementation of the simple templating engine used by the program. Many different engines can also
 * be used with it to transform text markup into HTML
 */
var Builder = /** @class */ (function () {
    function Builder(config, deps) {
        // Cache of all templates that have already been built
        // If a template or page is modified, that template will not be used from the cache
        // but any non-modified templates will still be used
        this.tmplCache = new Map();
        this.templateDir = config.templates;
        this.deps = deps;
        this.engine = Engines_1.EngineFactory(config);
    }
    /**
     * Build a page at a given path and return the page as a Buffer
     * @param {Path} path - the Path giving the location of the page to build
     * @param {boolean} rebuild - represents whether this template or page should be rebuilt, meaning the cache should
     *                            be ignored
     * @returns {Buffer} - the fully built template or page
     */
    Builder.prototype.build = function (path, rebuild) {
        var _this = this;
        var cached = this.tmplCache.get(path.absPath());
        if (cached && !rebuild) {
            return cached;
        }
        var data = fs_1.default.readFileSync(path.absPath());
        var fileStr = data.toString();
        var dependents = this.gatherDependents(data);
        dependents.forEach(function (tmpl) {
            _this.setTemplateDependency(path, tmpl);
            fileStr = _this.pasteTemplate(tmpl, fileStr, rebuild);
        });
        fileStr = this.replaceTemplate(path, fileStr, rebuild);
        var buf = this.engine.executeEngine(Buffer.from(fileStr));
        this.tmplCache.set(path.absPath(), buf);
        return buf;
    };
    // Parse the template and gather the paths for all templates used on the page
    Builder.prototype.gatherDependents = function (data) {
        var paths = new Array();
        var str = data.toString();
        var matches = str.toString().matchAll(/{{\s*template\s*"([.0-9a-zA-Z/]+)"\s*}}/g);
        var result = matches.next();
        while (!result.done) {
            paths.push(Path_1.default.fromParts(this.templateDir.absPath(), result.value[1]));
            result = matches.next();
        }
        return paths;
    };
    // Set the current template as a dependency for the page or template currently being built
    Builder.prototype.setTemplateDependency = function (path, tmpl) {
        var parent = this.deps.get(tmpl.absPath());
        if (parent === undefined) {
            this.deps.set(tmpl.absPath(), new Set([path.absPath()]));
        }
        else {
            parent.add(path.absPath());
        }
    };
    // Get the path to the template based on the currently set template directory
    Builder.prototype.getRelativeTmplPath = function (tmpl) {
        var path = utils.trimPrefix(this.templateDir.absPath(), tmpl.absPath());
        return path.startsWith("/") ?
            path.substring(1) :
            path;
    };
    // Paste the template into the current page
    Builder.prototype.pasteTemplate = function (tmpl, page, rebuild) {
        var templateStr = this.build(tmpl, rebuild).toString();
        var re = new RegExp("{{\\s*template\\s*\"" + escape_string_regexp_1.default(this.getRelativeTmplPath(tmpl)) + "\"\\s*}}", 'g');
        return page.replace(re, templateStr);
    };
    // Paste the current page into the given template
    Builder.prototype.replaceTemplate = function (path, page, rebuild) {
        // Find layout template if this template is a decorator and replace the layout's decorator area with the template
        var layoutMatch = page.match(/{{\s*#replace#\s*"([.0-9a-zA-Z/]+)"\s*}}/);
        if (layoutMatch) {
            var layout = Path_1.default.fromParts(this.templateDir.absPath(), layoutMatch[1]);
            var templateStr = this.build(layout, rebuild).toString();
            page = templateStr.replace(/{{\s*#replace#\s*}}/g, page.substring(layoutMatch[0].length));
            this.setTemplateDependency(path, layout);
            return page;
        }
        else {
            return page;
        }
    };
    return Builder;
}());
exports.default = Builder;

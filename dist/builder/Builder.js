"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Path_1 = __importDefault(require("../common/Path"));
var fs_1 = __importDefault(require("fs"));
var Template_1 = require("./Template");
/**
 * class Builder
 *
 * This is the implementation of the simple templating builder used by the program. Many different builder can also
 * be used with it to transform text markup into HTML
 */
var Builder = /** @class */ (function () {
    function Builder(config, deps) {
        // Cache of all templates that have already been built
        // If a template or page is modified, that template will not be used from the cache
        // but any non-modified templates will still be used
        this.cache = new Map();
        this.templateDir = config.templates;
        this.deps = deps;
    }
    /**
     * Build a page at a given path and return the page as a Buffer
     * @param {Path} path - the Path giving the location of the page to build
     * @param {boolean} useCache - represents whether this template or page should be rebuilt, meaning the cache should
     *                            be ignored
     * @returns {Buffer} - the fully built template or page
     */
    Builder.prototype.buildPage = function (path, useCache) {
        var cached = this.cache.get(path.absPath());
        if (cached && useCache) {
            return Buffer.from(cached);
        }
        var text = fs_1.default.readFileSync(path.absPath()).toString();
        // Find layout template if this template is a decorator and replace the layout's decorator area with the template
        var layoutMatch = text.match(/{{\s*#replace#\s*"([.0-9a-zA-Z/-]+)"\s*}}/);
        if (layoutMatch) {
            var layout = Path_1.default.fromParts(this.templateDir.absPath(), layoutMatch[1]);
            var templateStr = this.buildTemplates(layout, useCache);
            text = templateStr.replace(/{{\s*#replace#\s*}}/g, text.substring(layoutMatch[0].length));
            this.setTemplateDependency(path, layout);
        }
        return Buffer.from(this.buildDependencies(text, path, useCache));
    };
    /**
     * Builds a template. Works similar to build except layout templates are not parsed
     * @param {string} path
     * @param {boolean} useCache
     * @returns string
     */
    Builder.prototype.buildTemplates = function (path, useCache) {
        var cached = this.cache.get(path.absPath());
        if (cached && useCache) {
            return cached;
        }
        var text = fs_1.default.readFileSync(path.absPath()).toString();
        return this.buildDependencies(text, path, useCache);
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
    // Build all the templates contained in the text string
    Builder.prototype.buildDependencies = function (text, path, useCache) {
        var templates = this.gatherTemplates(text);
        templates.forEach(function (tmpl) {
            tmpl.setAsDependency(path);
            text = tmpl.build(text, useCache);
        });
        this.cache.set(path.absPath(), text);
        return text;
    };
    // Get an array of all the templates found in a given string
    Builder.prototype.gatherTemplates = function (text) {
        var templates = new Array();
        var matches = text.matchAll(/{{\s*template\s*"([.0-9a-zA-Z/-]+)"\s*"?([.0-9a-zA-Z/-]+)?"?\s*}}/g);
        var result = matches.next();
        while (!result.done) {
            if (result.value[2]) {
                templates.push(new Template_1.DataTemplate(this.templateDir, Path_1.default.fromParts(this.templateDir.absPath(), result.value[1]), Path_1.default.fromParts(this.templateDir.absPath(), result.value[2]), this));
            }
            else {
                templates.push(new Template_1.StaticTemplate(this.templateDir, Path_1.default.fromParts(this.templateDir.absPath(), result.value[1]), this));
            }
            result = matches.next();
        }
        return templates;
    };
    return Builder;
}());
exports.default = Builder;
//# sourceMappingURL=Builder.js.map
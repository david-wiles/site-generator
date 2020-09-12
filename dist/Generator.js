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
var utils = __importStar(require("./common/utils"));
var fs = __importStar(require("fs"));
var events_1 = require("events");
var Config_1 = __importDefault(require("./common/Config"));
var Builder_1 = __importDefault(require("./engines/Builder"));
var Path_1 = __importDefault(require("./common/Path"));
var BufferPipeline_1 = require("./pipeline/BufferPipeline");
var FileWriter_1 = __importDefault(require("./pipeline/FileWriter"));
/**
 * class Generator
 * The Generator is the facade object which orchestrates the template builder and pipelines.
 */
var Generator = /** @class */ (function () {
    function Generator(config) {
        this.deps = new Map();
        this.emitter = new events_1.EventEmitter();
        this.config = config;
        this.root = config.root;
        this.out = config.out;
        this.builder = new Builder_1.default(config, this.deps);
        this.pipeline = BufferPipeline_1.BufferPipeline.from(new FileWriter_1.default(config));
    }
    // Creates a generator from a commander object
    Generator.from = function (program) {
        return new Generator(Config_1.default.fromArgs(program));
    };
    /**
     * Start the site generator. This will build the entire site from scratch and then listen for file changes if
     * the daemon flag is set. On file change, all pages which depend on a template will be rebuilt.
     */
    Generator.prototype.buildSite = function () {
        var _this = this;
        this.emitter.emit("build:start");
        utils.walkDir(this.root, this.gatherPages.bind(this), new Array())
            .forEach(function (path) { return _this.executePipeline(path, false); });
        this.emitter.emit("build:done");
    };
    Generator.prototype.watch = function () {
        var _this = this;
        this.buildSite();
        this.emitter.emit("watch:start");
        fs.watch(this.root.absPath(), {
            persistent: true,
            recursive: true
        }, function (event, filename) {
            if (filename) {
                var file = Path_1.default.fromParts(_this.root.absPath(), filename);
                if (!fs.statSync(file.absPath()).isDirectory()) {
                    _this.gatherDeps(file)
                        .forEach(function (file) { return _this.executePipeline(file, true); });
                }
            }
            else {
                console.error("Error:", event);
            }
        });
    };
    Generator.prototype.addStep = function (step) {
        this.pipeline.add(step);
    };
    Generator.prototype.on = function (event, cb) {
        this.emitter.on(event, cb);
    };
    // Build a page a path and then execute the BufferPipeline for the resulting buffer
    Generator.prototype.executePipeline = function (path, rebuild) {
        // Stop execution of pipeline for files located in template directory
        if (!path.absPath().startsWith(this.config.templates.absPath())) {
            var buf = this.builder.build(path, rebuild);
            this.pipeline.execute(buf, path);
        }
    };
    // Gather all dependencies for a file
    Generator.prototype.gatherDeps = function (file) {
        var _this = this;
        var _a;
        var paths = new Array();
        if (!file.absPath().startsWith(this.config.templates.absPath())) {
            paths.push(file);
        }
        // TODO detect circular dependencies
        (_a = this.deps.get(file.absPath())) === null || _a === void 0 ? void 0 : _a.forEach(function (dep) { return paths.push.apply(paths, _this.gatherDeps(new Path_1.default(dep))); });
        return paths;
    };
    // Gather all pages to build by walking all files in the root directory, excluding the ones in the template folder
    Generator.prototype.gatherPages = function (path, paths) {
        if (!path.absPath().startsWith(this.config.templates.absPath())) {
            if (fs.statSync(path.absPath()).isDirectory()) {
                paths = utils.walkDir(path, this.gatherPages.bind(this), paths);
            }
            else {
                if (path.absPath().endsWith(".html")) {
                    paths.push(path);
                }
            }
        }
        return paths;
    };
    return Generator;
}());
exports.default = Generator;

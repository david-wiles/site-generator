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
var Builder_1 = __importDefault(require("./engines/Builder"));
var Path_1 = __importDefault(require("./common/Path"));
var utils = __importStar(require("./common/utils"));
var fs = __importStar(require("fs"));
var BufferPipeline_1 = require("./pipeline/BufferPipeline");
var writers_1 = require("./pipeline/writers");
var steps_1 = require("./pipeline/steps");
/**
 * class Generator
 * The Generator is the facade object which orchestrates the template builder and pipelines.
 */
var Generator = /** @class */ (function () {
    function Generator(config) {
        var _a, _b;
        this.paths = new Array();
        // TODO find a better data structure for this
        this.tmplDependencies = new Map();
        this.config = config;
        this.root = config.root;
        this.out = config.out;
        this.builder = new Builder_1.default(config, this.tmplDependencies);
        this.pipeline = new BufferPipeline_1.BufferPipeline();
        (_a = this.pipeline).add.apply(_a, writers_1.WriterFactory(config));
        (_b = this.pipeline).add.apply(_b, steps_1.PipelineStepFactory(config));
    }
    /**
     * Start the site generator. This will build the entire site from scratch and then listen for file changes if
     * the daemon flag is set. On file change, all pages which depend on a template will be rebuilt.
     * @param daemon
     */
    Generator.prototype.start = function (daemon) {
        var _this = this;
        utils.walkDir(this.root, this.gatherPages.bind(this));
        this.paths.forEach(function (path) { return _this.executePipeline(path, false); });
        if (daemon) {
            fs.watch(this.root.absPath(), {
                persistent: true,
                recursive: true
            }, function (event, filename) {
                if (filename) {
                    if (!fs.statSync(filename).isDirectory()) {
                        _this.recursiveRebuild(filename);
                    }
                }
                else {
                    console.error("Error:", event);
                }
            });
            // Exit on exception
            while (true)
                ;
        }
    };
    // Build a page a path and then execute the BufferPipeline for the resulting buffer
    Generator.prototype.executePipeline = function (path, rebuild) {
        var buf = this.builder.build(path, rebuild);
        this.pipeline.execute(buf, path);
    };
    // Rebuild a page or template and also rebuild any pages which are dependent on it
    Generator.prototype.recursiveRebuild = function (filename) {
        var _this = this;
        this.executePipeline(new Path_1.default(filename), true);
        this.tmplDependencies.get(filename)
            .forEach(function (tmpl) { return _this.recursiveRebuild(tmpl); });
    };
    // Gather all pages to build by walking all files in the root directory, excluding the ones in the template folder
    Generator.prototype.gatherPages = function (path) {
        if (!path.absPath().startsWith(this.config.templates.absPath())) {
            if (fs.statSync(path.absPath()).isDirectory()) {
                utils.walkDir(path, this.gatherPages.bind(this));
            }
            else {
                if (path.absPath().endsWith(".html")) {
                    this.paths.push(path);
                }
            }
        }
    };
    return Generator;
}());
exports.default = Generator;

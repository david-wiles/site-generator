"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriterFactory = void 0;
var FileWriter_1 = __importDefault(require("./FileWriter"));
function WriterFactory(config) {
    switch (config.writer) {
        default: return [new FileWriter_1.default(config)];
    }
}
exports.WriterFactory = WriterFactory;

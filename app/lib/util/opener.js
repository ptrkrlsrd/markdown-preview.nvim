"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/*
 * fork from https://github.com/domenic/opener
 */
const child_process_1 = tslib_1.__importDefault(require("child_process"));
module.exports = function opener(args, tool) {
    const platform = process.platform;
    args = [].concat(args);
    let command;
    switch (platform) {
        case 'darwin': {
            command = 'open';
            if (tool) {
                args.unshift(tool);
                args.unshift('-a');
            }
            break;
        }
        default: {
            command = tool || 'xdg-open';
            break;
        }
    }
    return child_process_1.default.spawn(command, args, {
        shell: false,
        detached: true
    });
};

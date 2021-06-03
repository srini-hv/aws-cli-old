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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadExtractInstall = void 0;
const exec_1 = require("@actions/exec");
const tool_cache_1 = require("@actions/tool-cache");
const path = __importStar(require("path"));
const util_1 = require("./util");
const io_1 = require("@actions/io");
const IS_WINDOWS = process.platform === 'win32' ? true : false;
class DownloadExtractInstall {
    constructor(downloadUrl) {
        this.downloadUrl = downloadUrl;
        this.fileType = this.downloadUrl.substr(-4);
    }
    async _getCommandOutput(command, args, logFile) {
        let stdErr = '';
        const options = {
            windowsVerbatimArguments: false,
            listeners: {
                stderr: (data) => {
                    stdErr += data.toString();
                }
            }
        };
        if (IS_WINDOWS)
            command = `cmd /c ${command}`;
        await exec_1.exec(command, args, options);
        return IS_WINDOWS ? await util_1._readFile(logFile, {}) : stdErr;
    }
    async _getVersion(installedBinary, logFile) {
        const versionCommandOutput = IS_WINDOWS ? await this._getCommandOutput(`${installedBinary} --version > ${logFile}`, [], logFile) : await this._getCommandOutput(installedBinary, ['--version'], logFile);
        const installedVersion = util_1._filterVersion(versionCommandOutput);
        return installedVersion;
    }
    async downloadFile() {
        const filePath = await tool_cache_1.downloadTool(this.downloadUrl);
        const destPath = `${filePath}${this.fileType}`;
        await io_1.mv(filePath, destPath);
        return destPath;
    }
    async extractFile(filePath) {
        const extractDir = path.dirname(filePath);
        // await extractZip(this.downloadedFile) // This command currently throws an error on linux TODO
        // Error: spawn /home/runner/work/action-aws-cli/action-aws-cli/node_modules/@actions/tool-cache/scripts/externals/unzip EACCES
        if (process.platform === 'linux') { // Workaround
            await exec_1.exec(`unzip ${filePath}`, ['-d', extractDir]);
            return extractDir;
        }
        return await tool_cache_1.extractZip(filePath, extractDir);
    }
    async installPackage(installCommand, installArgs) {
        return await exec_1.exec(installCommand, installArgs);
    }
    async cacheTool(installedBinary, logFile) {
        const installedVersion = await this._getVersion(installedBinary, logFile);
        const cachedPath = await tool_cache_1.cacheDir(path.parse(installedBinary).dir, 'aws', installedVersion);
        return cachedPath;
    }
}
exports.DownloadExtractInstall = DownloadExtractInstall;
//# sourceMappingURL=toolHandler.js.map
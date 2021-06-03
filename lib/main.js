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
Object.defineProperty(exports, "__esModule", { value: true });
exports._installTool = void 0;
const core_1 = require("@actions/core/lib/core");
const toolHandler_1 = require("./toolHandler");
const path = __importStar(require("path"));
const IS_WINDOWS = process.platform === 'win32' ? true : false;
async function _installTool() {
    const downloadUrl = IS_WINDOWS ? 'https://s3.amazonaws.com/aws-cli/AWSCLISetup.exe' : 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip';
    const tool = new toolHandler_1.DownloadExtractInstall(downloadUrl);
    // const toolPath: string = find('aws', '*')
    // if (toolPath) return toolPath
    // const awsPath: string = await which('aws', true)
    // if (awsPath) {
    //   const toolCachePath = await tool.cacheTool(awsPath, path.join(path.parse(awsPath).dir, 'log.txt'))
    //   console.log(awsPath)
    //   return toolCachePath
    // }
    let filePath = await tool.downloadFile();
    if (path.parse(filePath).ext === '.zip') {
        const extractedPath = await tool.extractFile(filePath);
        filePath = path.join(extractedPath, 'awscli-bundle', 'install');
    }
    const installDestinationDir = IS_WINDOWS ? 'C:\\PROGRA~1\\Amazon\\AWSCLI' : path.join(path.parse(filePath).dir, '.local', 'lib', 'aws');
    const installArgs = IS_WINDOWS ? ['/install', '/quiet', '/norestart'] : ['-i', installDestinationDir];
    try {
        await tool.installPackage(filePath, installArgs);
    }
    catch (err) {
        core_1.debug(err);
    }
    const binFile = IS_WINDOWS ? 'aws.exe' : 'aws';
    const installedBinary = path.join(installDestinationDir, 'bin', binFile);
    const logFile = path.normalize(path.join(path.parse(filePath).dir, 'log.txt'));
    const toolCachePath = await tool.cacheTool(installedBinary, logFile);
    await core_1.addPath(toolCachePath);
    return toolCachePath;
}
exports._installTool = _installTool;
if (process.env.NODE_ENV != 'test')
    (async () => await _installTool())();
//# sourceMappingURL=main.js.map
/**
 * Module of IDE, this module contains api for compile code and run code.
 *
 * @author chandan
 */

const express = require('express');
const bodyParser = require('body-parser');
const log = require('../../log/log.js');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const spawn = require('child_process').spawn;
const os = require("os");

const statusCode = {
    'ERROR': 'ERROR',
    'SUCCESS': 'SUCCESS'
};

const errorCode = {
    'INTERNAL_ERROR': '500',
    'BAD_REQUEST': '400',
    'ACCESS_DENIED': '403',
    'COMPILATION_ERROR': 'COMPILATION_ERROR'
};

const programKey = "Program";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/**
 * API for code compile.
 */
app.post('/compile', function (req, res) {
    console.log("Request received for code compile");
    console.log(req.body);
    var sourceCode = req.body.sourceCode;
    var language = req.body.language;
    var response = {};
    var errorMessage = '';
    generateSourceCodeFile(sourceCode, language, function (err, data) {
        if(err) {
            log.error("Failed in generating source code file.");
            response.status = statusCode.ERROR;
            response.errorCode = errorCode.INTERNAL_ERROR;
        } else {
            var sourceCodeFile = data.filePath;
            var compileCommand = getCompileExeCommand(language);
            var compileCode = spawn(compileCommand, [sourceCodeFile]);
            compileCode.stdout.on('data', function (data) {
                log.debug('Compile code, stdout: ' + data);
            });
            compileCode.stderr.on('data', function (data) {
                errorMessage += String(data);
            });
            compileCode.on('close', function (data) {
                if(data === 0) {
                    response.status = statusCode.SUCCESS;
                } else {
                    log.error("Error occurred while compiling code: " + errorMessage);
                    errorMessage = errorMessage.replace(sourceCodeFile, programKey);
                    response.errorCode = errorCode.COMPILATION_ERROR;
                    response.status = statusCode.ERROR;
                    response.errorMessage = errorMessage;
                }
                // delete the generated file
                deleteSourceCodeFile(sourceCodeFile);
                res.send(response);
            });
        }
    });
});

/**
 * Delete source code file.
 *
 * @param sourceCodeFile
 * @param callback
 */
var deleteSourceCodeFile = function (sourceCodeFile) {
    fs.unlink(sourceCodeFile, function(err) {
        if(err) {
            log.error("Failed to delete sourceCodeFile " + sourceCodeFile + " exception: " + err);
        } else {
            log.info("SourceCodeFile " + sourceCodeFile + " deleted successfully");
        }
    });
};

/**
 * Generate sourceCode file.
 *
 * @param sourceCode
 * @param programmingLanguage
 * @param callback
 */
function generateSourceCodeFile(sourceCode, programmingLanguage, callback) {
    var baseFileName = "soureCode-";
    var fileExtension = getExtensionForSourceCodeFile(programmingLanguage);
    var temporaryDir = os.tmpdir();
    var temporarySourceFileName = baseFileName + uuidv4() + fileExtension;
    var temporarySourceFileAbsolutePath = temporaryDir + temporarySourceFileName;
    var response = {};
    fs.writeFile(temporarySourceFileAbsolutePath, sourceCode, function (err, data) {
        if(err) {
            response.error = err;
        } else {
            log.info("Successfully saved the source code at path: " + temporarySourceFileAbsolutePath);
            response.filePath = temporarySourceFileAbsolutePath;
        }
        return callback(err, response);
    });
}

/**
 * Get fileExtension for a given programming language.
 *
 * @param language
 * @returns {undefined}
 */
var getExtensionForSourceCodeFile = function(programmingLanguage) {
    var fileExtension = undefined;
    switch (programmingLanguage) {
        case "C":
            fileExtension = ".c";
            break;
        case "CPP":
            fileExtension = ".cpp";
            break;
        case "JAVA":
            fileExtension = ".java";
            break;
        case "PYTHON":
            fileExtension = ".py";
            break;
        default:
            break;
    }
    log.info("File extension for the language: " + programmingLanguage + " is : " + fileExtension);
    return fileExtension;
};

var getCompileExeCommand = function (programmingLanguage) {
    var compileExeCommand = undefined;
    switch (programmingLanguage) {
        case "C":
            compileExeCommand = "g++";
            break;
        case "CPP":
            compileExeCommand = "g++";
            break;
        case "JAVA":
            compileExeCommand = "javac";
            break;
        case "PYTHON":
            compileExeCommand = "python";
            break;
        default:
            break;
    }
    log.info("Compile execution command for the language: " + programmingLanguage
        + " is : " + compileExeCommand);
    return compileExeCommand;
};

var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    log.info("Example app listening at host = " + host + ", post: " + port);
});
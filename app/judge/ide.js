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
const {spawn} = require('child_process');
const os = require("os");
const temporaryDir = os.tmpdir();


const statusCode = {
    'ERROR': 'ERROR',
    'SUCCESS': 'SUCCESS'
};

const errorCode = {
    'INTERNAL_ERROR': '500',
    'BAD_REQUEST': '400',
    'ACCESS_DENIED': '403',
    'COMPILATION_ERROR': 'COMPILATION_ERROR',
    'RUNTIME_ERROR': 'RUNTIME_ERROR'
};

const programKey = "Program";
const inputFileName = "input.txt";
const outputFileName = "output.txt";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/**
 * API for code compile.
 *
 * req.sourceCode - required
 * req.language - required
 */
app.post('/compile', function (req, res) {
    var sourceCode = req.body.sourceCode;
    var language = req.body.language;
    log.info("Request received for code compile, sourceCode: " + sourceCode + " language " + language);

    compileCode(sourceCode, language, function (response) {
        // delete the generated source file
        deleteSourceCodeFile(response.sourceCodeFilePath);
        res.send(response);
    });
});

/**
 * API for code run.
 *
 * req.sourceCode - required
 * req.language - required
 * req.timeLimit - required
 * req.input - optional
 */
app.post('/run', function (req, res) {
    var sourceCode = req.body.sourceCode;
    var language = req.body.language;
    var input = req.body.input;
    log.info("Request received for code run, sourceCode: " + sourceCode + " language " + language);
    compileCode(sourceCode, language, function (compileResponse) {
        var sourceCodeFilePath = compileResponse.sourceCodeFilePath;
        if(compileResponse.status === statusCode.SUCCESS) {
            log.info("Code compiled successfully.");
            // run the code
            runCode(sourceCodeFilePath, language, input, function (response) {
                deleteSourceCodeFile(sourceCodeFilePath);
                res.send(response);
            });
        } else {
            deleteSourceCodeFile(sourceCodeFilePath);
            res.send(compileResponse);
        }
    });
});

/**
 * Run the code.
 *
 * @param sourceCodeFilePath
 * @param language
 * @param input
 * @param callback
 */
var runCode = function (sourceCodeFilePath, language, input, callback) {
    var response = {};
    var errorMessage = '';
    var stdOutput = '';
    var runCommand = getRunExeCommand(language);
    var uuid = uuidv4();
    var inputFilePath = temporaryDir + uuid + inputFileName;
    var outputFilePath = temporaryDir + uuid + outputFileName;
    createInputFile(inputFilePath, input, function (err, data) {
        if(err) {
            response.errorCode = errorCode.INTERNAL_ERROR;
            response.status = statusCode.ERROR;
            return callback(response);
        }
        log.info("InputFilePath: " + inputFilePath + " OutputFilePath: " + outputFilePath);
        const runCodeSpawn = spawn(runCommand, [sourceCodeFilePath, '<', inputFilePath, '>', outputFilePath], { shell: true });
        runCodeSpawn.stdout.on('data', function (data) {
            log.debug('Running code, stdout: ' + data);
            stdOutput += String(data);
        });
        runCodeSpawn.stderr.on('data', function (data) {
            errorMessage += String(data);
        });
        runCodeSpawn.on('close', function (data) {
            if(data === 0) {
                readFromFile(outputFilePath, function (err, data) {
                    if(err) {
                        response.errorCode = errorCode.INTERNAL_ERROR;
                        response.status = statusCode.ERROR;
                        return callback(response);
                    }
                    response.status = statusCode.SUCCESS;
                    response.message = stdOutput;
                    response.output = data.toString('utf8');
                    return callback(response);
                });
            } else {
                log.error("Error occurred while compiling code: " + errorMessage);
                errorMessage = errorMessage.replace(sourceCodeFilePath, programKey);
                response.errorCode = errorCode.RUNTIME_ERROR;
                response.status = statusCode.ERROR;
                response.errorMessage = errorMessage;
                return callback(response);
            }
        });
    });
};

/**
 * Compile the source code.
 *
 * @param sourceCode
 * @param language
 * @param callback
 */
var compileCode = function (sourceCode, language, callback) {
    var response = {};
    var errorMessage = '';
    generateSourceCodeFile(sourceCode, language, function (err, data) {
        if(err) {
            log.error("Failed in generating source code file.");
            response.status = statusCode.ERROR;
            response.errorCode = errorCode.INTERNAL_ERROR;
            return callback(response);
        } else {
            var sourceCodeFilePath = String(data.sourceCodeFilePath);
            response.sourceCodeFilePath = sourceCodeFilePath;
            var compileCommand = getCompileExeCommand(language);
            var compileCodeSpawn = spawn(compileCommand, [sourceCodeFilePath], { shell: true });
            compileCodeSpawn.stdout.on('data', function (data) {
                log.debug('Compile code, stdout: ' + data);
            });
            compileCodeSpawn.stderr.on('data', function (data) {
                errorMessage += String(data);
            });
            compileCodeSpawn.on('close', function (data) {
                if(data === 0) {
                    response.status = statusCode.SUCCESS;
                } else {
                    log.error("Error occurred while compiling code: " + errorMessage);
                    errorMessage = errorMessage.replace(sourceCodeFilePath, programKey);
                    response.errorCode = errorCode.COMPILATION_ERROR;
                    response.status = statusCode.ERROR;
                    response.errorMessage = errorMessage;
                }
                return callback(response);
            });
        }
    });
};

/**
 * Read from input file.
 *
 * @param filePath
 * @param callback
 */
var readFromFile = function (filePath, callback) {
    fs.readFile(filePath, function (err, data) {
        if(err) {
            log.error("Not able to read the file: " + err);
        } else {
            log.info("Successfully read " + data + " from the file " + filePath);
        }
        return callback(err, data);
    });
};

/**
 * Create file and write data in it.
 *
 * @param inputFilePath
 * @param input
 * @param callback
 */
var createInputFile = function (inputFilePath, input, callback) {
    fs.writeFile(inputFilePath, input, function (err, data) {
        if(err) {
            log.error("Not able to create input file: " + err);
        } else {
            log.info("Successfully write the input in file " + inputFilePath);
        }
        return callback(err, data);
    });
};
/**
 * Delete source code file.
 *
 * @param sourceCodeFile
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
    var fileExtension = getExtensionForSourceCodeFile(programmingLanguage);
    var temporarySourceFileName = programKey + uuidv4() + fileExtension;
    var temporarySourceFileAbsolutePath = temporaryDir + temporarySourceFileName;
    var response = {};
    fs.writeFile(temporarySourceFileAbsolutePath, sourceCode, function (err, data) {
        if(err) {
            response.error = err;
        } else {
            log.info("Successfully saved the source code at path: " + temporarySourceFileAbsolutePath);
            response.sourceCodeFilePath = temporarySourceFileAbsolutePath;
        }
        return callback(err, response);
    });
}

/**
 * Get fileExtension for a given programming language.
 *
 * @param language
 * @returns fileExtension
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

/**
 * Get execution command for code compile.
 *
 * @param programmingLanguage
 * @returns {compileExeCommand}
 */
var getCompileExeCommand = function (programmingLanguage) {
    var compileExeCommand = undefined;
    switch (programmingLanguage) {
        case "C":
            compileExeCommand = 'g++';
            break;
        case "CPP":
            compileExeCommand = 'g++';
            break;
        case "JAVA":
            compileExeCommand = 'javac';
            break;
        case "PYTHON":
            compileExeCommand = 'python -m py_compile';
            break;
        default:
            break;
    }
    log.info("Compile execution command for the language: " + programmingLanguage
        + " is : " + compileExeCommand);
    return compileExeCommand;
};

/**
 * Get execution command for code compile.
 *
 * @param programmingLanguage
 * @returns {runExeCommand}
 */
var getRunExeCommand = function (programmingLanguage) {
    var runExeCommand = undefined;
    switch (programmingLanguage) {
        case "C":
            runExeCommand = './a.out';
            break;
        case "CPP":
            runExeCommand = './a.out';
            break;
        case "JAVA":
            runExeCommand = 'java';
            break;
        case "PYTHON":
            runExeCommand = 'python';
            break;
        default:
            break;
    }
    log.info("Run execution command for the language: " + programmingLanguage
        + " is : " + runExeCommand);
    return runExeCommand;
};

const { urlToRequest } = require('loader-utils');

function replaceTemplateUrl(variableName, lines) {
    const regEx = /(^\s*templateUrl\s*:\s*)['"](.*)['"](\s*,?\s*)$/;
    const lineNumbers = lines.reduce((result, line, i) => (/templateUrl/.test(line) ? result.concat(i) : result), []);

    if (!lineNumbers.length) {
        return lines;
    }

    let counter = 1;
    const templateRequires = lineNumbers.map((lineNumber) => {
        const [, , templateUrl] = regEx.exec(lines[lineNumber]) || [];

        if (!templateUrl) {
            return null;
        }

        const lineReplacement = lines[lineNumber].replace(regEx, `$1${variableName}${counter++}$3`);

        return {
            templateUrl,
            lineNumber,
            lineReplacement
        };
    }).filter(x => x !== null);

    if (templateRequires.length === 0) {
        return lines;
    }

    const updatedLines = lines;

    templateRequires.forEach((x) => {
        updatedLines[x.lineNumber] = x.lineReplacement;
    });

    return [
        ...templateRequires.map((x, i) => `const ${variableName}${i + 1} = require('${urlToRequest(x.templateUrl)}');`),
        ``,
        ...updatedLines
    ];
}

module.exports = {
    replaceTemplateUrl
};

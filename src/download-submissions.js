const axios = require('axios');
const fs = require('fs');

const TIMEOUT = 15000;
const cookie = require('./config.json').cookie;
if (!cookie) {
    console.error('Please provide your cookie in "config.json"!');
    process.exit();
}
const requestParams = {
    method: 'get',
    headers: {
        Cookie: cookie,
    },
};

const dataPath = '../data';

const submissions = require('./submissions.json');
const codeRegex = /submissionCode: '(.*)',\n  editCodeUrl/;
const extensionsMap = {
    bash: 'sh',
    c: 'c',
    cpp: 'cpp',
    csharp: 'cs',
    golang: 'go',
    java: 'java',
    javascript: 'js',
    mysql: 'sql',
    python: 'py',
    python3: 'py',
    ruby: 'rb',
    scala: 'scala',
    swift: 'swift',
};

console.log(`Downloading ${submissions.length} submissions`);
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
}

Promise.all(
    submissions.map(submission => {
        return new Promise(resolve => {
            const { id, slug, url, language } = submission;
            const timer = setTimeout(() => {
                console.log(`Timeout for ${id}-${slug}`);
                resolve();
            }, TIMEOUT);
            axios
                .request(
                    Object.assign(requestParams, {
                        url: `https://leetcode.com${url}`,
                    }),
                )
                .then(({ data }) => {
                    // Pad ID to 4 digits.
                    let idStr = id.toString();
                    const num = idStr.length;
                    for (let i = 0; i < 4 - num; i++) {
                        idStr = '0' + idStr;
                    }
                    const matches = data.match(codeRegex);
                    const code =
                        matches[1].replace(/\\u[\dA-F]{4}/gi, match => {
                            return String.fromCharCode(
                                parseInt(match.replace(/\\u/g, ''), 16),
                            );
                        }) + '\n';
                    const filename = `${idStr}-${slug}.${
                        extensionsMap[language]
                    }`;
                    fs.writeFileSync(dataPath + '/' + filename, code);
                    console.log(`Downloaded ${filename}`);
                })
                .catch(error => {
                    console.warn(error);
                })
                .then(() => {
                    clearTimeout(timer);
                    resolve();
                });
        });
    }),
).then(() => {
    console.log('\nDone fetching');
    process.exit();
});

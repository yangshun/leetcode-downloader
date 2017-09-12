const axios = require('axios');
const fs = require('fs');

const TIMEOUT = 10000;
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

const zeroSubmissionsAccepted = [];
const submissions = [];

axios.request(Object.assign(requestParams, {
    url: 'https://leetcode.com/api/problems/all/',
})).then(response => {
    const questions = response.data.stat_status_pairs;
    console.log(`${questions.length} questions found`);
    const promises = [];
    questions.filter(question => question.status === 'ac').forEach(question => {
        const id = question.stat.question_id;
        const slug = question.stat.question__title_slug;
        const promise = new Promise(resolve => {
            const timer = setTimeout(() => {
                console.log(`Timeout for ${id}-${slug}`);
                resolve();
            }, TIMEOUT);
            axios.request(Object.assign(requestParams, {
                url: `https://leetcode.com/api/submissions/${slug}`,
            })).then(response => {
                const numberOfSubmissions = response.data.submissions_dump.length;
                if (numberOfSubmissions === 0) {
                    zeroSubmissionsAccepted.push({ id, slug });
                    return;
                }
                console.log(`${id}-${slug}: ${response.data.submissions_dump.length} submissions`);
                for (let i = 0; i < numberOfSubmissions; i++) {
                    const submission = response.data.submissions_dump[i];
                    if (submission.status_display === 'Accepted') {
                        submissions.push({
                            id,
                            slug,
                            url: submission.url,
                            language: submission.lang,
                        });
                        break;
                    }
                }
            }).catch(error => {
                console.warn(error);
            }).then(() => {
                clearTimeout(timer);
                resolve();
            });
        });
        promises.push(promise);
    });
    return Promise.all(promises);
}).then(() => {
    console.log('\nDone fetching');
    zeroSubmissionsAccepted.sort((a, b) => a.id - b.id);
    submissions.sort((a, b) => a.id - b.id);
    fs.writeFileSync('zero-submissions.json', JSON.stringify(zeroSubmissionsAccepted, null, 2));
    fs.writeFileSync('submissions.json', JSON.stringify(submissions, null, 2));
    process.exit();
});

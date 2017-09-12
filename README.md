LeetCode Downloader
==

Download your accepted submissions from LeetCode!

## Getting Started

```
$ npm install
$ cp src/config.json.example src/config.json
```

Copy your LeetCode cookie from the browser and paste it in `config.json`. Open your browser debugger, select the "Network" tab, and refresh the page. Look for the `Cookie` string under the `Request-Headers` section for the first network request made. The string should be in the form of `LEETCODE_SESSION=...`.

## Usage

```
$ cd src
$ node fetch-submissions.js
$ node download-submissions.js
````

The first command fetches the URLs to your submissions into a `submissions.json` file. Some of your accepted questions may not have submissions if they were accepted only via contest. Those questions will be written in `zero-submissions.json`.

The second command reads the submissions from `submissions.json` and fetches the code for each submission. The downloaded code will be written into the `data` directory. If the downloading hangs, kill it and restart again. LeetCode servers sometimes fail to give a response.

## License

MIT

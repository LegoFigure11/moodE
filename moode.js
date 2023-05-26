"use strict";

const path = require("path");

const colors = require("@colors/colors/safe");

const dateOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

function timeStampString(text) {
  return `${colors.grey(timeStamp())} ${text}`;
}

function timeStamp() {
  const d = new Date();
  return `[${d.toLocaleDateString("en-AU", dateOptions)} ${d.toTimeString().split(" ")[0]}]`;
}

function moodeText(text) {
  return timeStampString(`${colors.yellow("moodE: ")}${text}`);
}

void (async () => {
  require(path.join(__dirname, "build.js"))().then(() => {
    require(path.join(__dirname, "built", "index.js"))();
    // Launch Discord
    console.log(moodeText("Launching Discord"));
    require(path.join(__dirname, "built", "discord", "index.js"));
  }).catch(e => {
    console.log(e);
    process.exit(1);
  });
})();

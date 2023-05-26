"use strict";

const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const util = require("util");

const colors = require("@colors/colors/safe");

const builtFolder = path.join(__dirname, "built");

const exec = util.promisify(child_process.exec);

// https://github.com/sirDonovan/Lanette/blob/2c827a473b265c2c6f3630fe71ef225e140313ff/build.js#L21-L91
function deleteFolderRecursive(folder) {
  folder = folder.trim();
  if (!folder || folder === "/" || folder === ".") return;
  let exists = false;
  try {
    fs.accessSync(folder);
    exists = true;
  } catch (e) {}
  if (exists) {
    const contents = fs.readdirSync(folder);
    for (let i = 0; i < contents.length; i++) {
      const curPath = path.join(folder, contents[i]);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    }

    if (folder !== builtFolder) fs.rmdirSync(folder);
  }
}

function listFilesRecursive(folder) {
  folder = folder.trim();
  if (!folder || folder === "/" || folder === ".") return [];
  let fileList = [];
  let exists = false;
  try {
    fs.accessSync(folder);
    exists = true;
  } catch (e) {}
  if (exists) {
    const contents = fs.readdirSync(folder);
    for (let i = 0; i < contents.length; i++) {
      const curPath = path.join(folder, contents[i]);
      if (fs.lstatSync(curPath).isDirectory()) {
        fileList = fileList.concat(listFilesRecursive(curPath));
      }
      fileList.push(curPath);
    }
  }
  return fileList;
}

function pruneBuiltFiles(source) {
  const builtFiles = listFilesRecursive(builtFolder);
  const srcFiles = listFilesRecursive(source);
  for (let i = 0; i < builtFiles.length; i++) {
    if (!builtFiles[i].endsWith(".js") && !builtFiles[i].endsWith(".js.map")) {
      if (fs.lstatSync(builtFiles[i]).isDirectory()) {
        if (!srcFiles.includes(
          path.join(source, builtFiles[i].substr(builtFolder.length + 1))
        )
        ) {
          fs.rmdirSync(builtFiles[i]);
        }
      }
      continue;
    }

    const filepath = builtFiles[i].substr(builtFolder.length + 1);
    let filename;
    if (filepath.endsWith(".js.map")) {
      filename = filepath.substr(0, filepath.length - 7);
    } else {
      filename = filepath.substr(0, filepath.length - 3);
    }

    if (!srcFiles.includes(path.join(source, `${filename}.ts`))) {
      fs.unlinkSync(builtFiles[i]);
    }
  }
}

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

module.exports = async (options) => {
  if (!options) options = {};
  console.log(timeStampString("Preparing to build files..."));
  if (options.incrementalBuild) {
    pruneBuiltFiles();
    console.log(timeStampString("Pruned built folder"));
  } else {
    deleteFolderRecursive(builtFolder);
    console.log(timeStampString("Deleted old built folder"));
  }

  console.log(timeStampString("Running tsc..."));
  const cmd = await exec("npm run tsc").catch(e => console.log(timeStampString(e)));
  if (!cmd || cmd.Error) {
    throw new Error("tsc error");
  }

  console.log(timeStampString("Successfully built files"));

  return Promise.resolve();
};

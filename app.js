const glob = require("glob");
const fs = require("fs");

const args = process.argv;
let mode;
if (args.indexOf("--mode") === -1) {
  throw "Must supply the --mode agument [all | rename | patch].";
} else {
  mode = args[args.indexOf("--mode") + 1];
}

let folder;
if (args.indexOf("--folder") === -1) {
  throw "Must supply root folder path.";
} else {
  folder = args[args.indexOf("--folder") + 1];
}

console.log(`Mode: ${mode}`);
console.log(`Folder: ${folder}`);

const doRename = mode !== "patch";
const doPatch = mode !== "rename";

folder += "/**/*.{tsx,ts}";
console.log(`Beginning processing at root folder:  ${folder}...`);

const replaceHtmlInImportRegexs = [
  new RegExp(
    /((import\s.*)|(\sfrom\s.*)|(import\(.*)|(jest.mock\(.*)|(require\(.*))(\.html)/,
    "g"
  ),
  new RegExp(/(jest\.requireActual\(\n?.*)(\.html)/, "g")
];
const files = glob.sync(folder);

files.forEach((file) => {
  console.log(`Processing file: ${file}...`);

  if (doRename) {
    if (file.indexOf(".html") !== -1) {
      const newPath = file.replace(".html", "");
      console.log(`Changing file name: ${file} to ${newPath}`);
      fs.renameSync(file, newPath);
      file = newPath;
    }
  }

  if (doPatch) {
    let data = fs.readFileSync(file, "utf-8");
    if (data.indexOf(".html")) {
      console.log("Fixing *.html imports");
      replaceHtmlInImportRegexs.forEach((i) => {
        data = data.replace(i, "$1");
      });
      fs.writeFileSync(file, data, "utf-8");
    }
  }
});

process.exitCode = 0;

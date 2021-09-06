#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const { exec } = require("child_process");

var {
  n: appName,
  h: help,
  i: installDeps,
} = require("minimist")(process.argv.slice(2), {
  boolean: ["h"],
  string: ["n"],
  boolean: ["i"],
});

if (!!help) {
  printHelp();
  return;
}

if (fs.existsSync(appName)) {
  console.error(`Folder name already exists for ${appName}`);
  return;
}

const packageJson = require("../package.json");

// TODO: define start scripts
const scripts = `"start": "webpack-dev-server --mode=development --open --hot",
"build": "webpack --mode=production"`;

const babel = require("../.babelrc.js");
// const babel = `"babel": ${JSON.stringify(packageJson.babel)}`;

const getDeps = (deps) =>
  Object.entries(deps)
    .map((dep) => `${dep[0]}@${dep[1]}`)
    .toString()
    .replace(/,/g, " ")
    .replace(/^/g, "")
    .replace(/fs-extra[^\s]+/g, "");

const devDeps = getDeps(packageJson.devDependencies);
const deps = getDeps(packageJson.dependencies);

console.log("Initializing project..");

exec(
  `mkdir ${appName} && cd $_ && npm init -f`,

  (initErr, initStdout, initStderr) => {
    if (initErr) {
      console.error(`ERROR: ${initErr}`);
      return;
    }

    console.log(`mkdir ${appName} -- done`);
    console.log("npm init -- done\n");

    const packageJSON = `${appName}/package.json`;

    // replace the default scripts
    fs.readFile(packageJSON, (err, file) => {
      if (err) throw err;

      console.log(`Create custom package.json with default scripts\n`);
      const data = file
        .toString()
        .replace(
          '"test": "echo \\"Error: no test specified\\" && exit 1"',
          scripts
        );

      fs.writeFile(packageJSON, data, (err2) => err2 || true);
    });

    const filesToCopy = ["webpack.config.js", ".babelrc.js"];
    console.log(`Copy files: ${filesToCopy.join(", ")}`);

    for (let i = 0; i < filesToCopy.length; i += 1) {
      fs.createReadStream(path.join(__dirname, `../${filesToCopy[i]}`)).pipe(
        fs.createWriteStream(`${appName}/${filesToCopy[i]}`)
      );
    }

    // installing dependencies

    const devDeps = getDeps(packageJson.devDependencies);
    const deps = getDeps(packageJson.dependencies);

    exec(
      `cd ${appName} && git init && node -v && npm -v`,
      (npmErr, npmStdout, npmStderr) => {
        if (npmErr) {
          console.error(npmErr);
          return;
        }

        console.log(npmStdout);

        console.log(`Copying /src files...`);

        // copy additional source files
        fs.copy(path.join(__dirname, "../src"), `${appName}/src`)
          .then(() => {
            console.log("Copying /src files -- done\n");
            if (!installDeps)
              console.log(`All done! Run npm i && npm run start`);
          })
          .catch((err) => console.error(err));

        if (installDeps) {
          console.log(
            "\nInstalling dependencies -- this may take a few minutes.."
          );

          exec(
            `npm i -D ${devDeps} && npm i -S ${deps}`,
            (iErr, iStdout, iStderr) => {
              if (iErr) {
                console.error(`Some error while installing dependencies
          ${iErr}`);
                return;
              }

              console.log(iStdout);
              console.log(`Dependencies installed\n`);

              console.log(`All done! Run npm run start`);
            }
          );
        }
      }
    );
  }
);

function printHelp() {
  console.log("example usage: ");
  console.log("");
  console.log("-n         app name");
  console.log("-i         install dependencies");
  console.log("-h         help");
}

// package.json  - starter
//	- pull all deps
//
// Create App
//  - npm i
//  - npm i devDeps & deps (use package.json)

// npm i devDependencies
// npm i dependencies

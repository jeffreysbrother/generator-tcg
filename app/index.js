'use strict';
const Generator = require('yeoman-generator');
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');

const cwd = process.cwd();
const regex = /(^|\/)\.[^\/\.]/ig;
const pattern = /\b[a-zA-Z]{2}(-)\d{2,3}\b/g;
const pathToSection = `${cwd}/source/sections`;

let section;
let originalDir;
let newDir;
let originalNamespace;
let newNamespace;
let oldPath;
let newPath;
let target;
let oldTarget;

// ------------------------------ POLYFILL FOR OBJECT.VALUES
const reduce = Function.bind.call(Function.call, Array.prototype.reduce);
const isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable);
const concat = Function.bind.call(Function.call, Array.prototype.concat);
const keys = Reflect.ownKeys;

if (!Object.values) {
	Object.values = function values(O) {
		return reduce(keys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), []);
	};
}
// ----------------------------- END POLYFILL FOR OBJECT.VALUES

module.exports = class extends Generator {

  prompting() {

    const prompts = [{
      type: 'input',
      name: 'section',
      message: 'What section are you working on?',
      validate: function (value) {
        // ensure that section exists
        if (fse.existsSync(`${pathToSection}/${value}/`) === true) {
          return true;
        } else {
          console.log(chalk.yellow(" Section doesn't exist!"));
          return false;
        }
      }
    },{
      type: 'input',
      name: 'originalDir',
      message: 'Which directory do you wish to copy?',
      validate: function (value) {
        // ensure user input is two letters, a hyphen, and 2-3 digits
        const check = value.match(pattern);
        if (check) {
          return true;
        } else {
          console.log(chalk.yellow(' Invalid directory name!'));
          return false;
        }
      }
    },{
      type: 'input',
      name: 'newDir',
      message: 'What would you like to call it?',
      validate: function (value) {
        // ensure user input is two letters, a hyphen, and 2-3 digits
        const check = value.match(pattern);
        if (check) {
          return true;
        } else {
          console.log(chalk.yellow(' Invalid directory name!'));
          return false;
        }
      }
    }];

    return this.prompt(prompts).then(answers => {

      // user input
      section = answers.section;
      originalDir = answers.originalDir;
      newDir = answers.newDir;

      // derive new/old namespaces
      originalNamespace = originalDir.substr(0, originalDir.indexOf('-'));
      newNamespace = newDir.substr(0, newDir.indexOf('-'));

      // generate path relative to /funnel
      oldPath = `source/sections/${section}/${originalNamespace}/${originalDir}`;
      newPath = `source/sections/${section}/${newNamespace}/${newDir}`;

      // generate absolute path
      oldTarget = `${cwd}/${oldPath}`;
      target = `${cwd}/${newPath}`;

    });
  }

  copy() {
    // newDir already exists
    if (fse.existsSync(target) === true && fse.existsSync(oldTarget) === false) {
      console.log(chalk.yellow(`Damn, bro! ${originalDir} doesn't exist and ${newDir} already does! Aborting.`));
      process.exit();
    } else if (fse.existsSync(target) === true) {
      console.log(chalk.yellow(`${newDir} already exists! Aborting.`));
      process.exit();
    // originalDir doesn't exist
    } else if (fse.existsSync(oldTarget) === false) {
      console.log(chalk.yellow(`${originalDir} doesn't exist! Aborting.`));
      process.exit();
    } else {
      try {
        fse.copySync(oldPath, newPath);
        console.log(chalk.yellow('Files copied!'));
      } catch (err) {
        console.error(err);
      }
    }
  }

  renameNameSpace() {
    fse.readdir(target, (err, files) => {
      // ensure that hidden files are not considered
      files = files.filter(item => !(regex).test(item));
      files.forEach((file) => {
        const x = `${target}/${file}`;
        fse.rename(x, x.replace(originalNamespace, newNamespace), (err) => {
          if (err) {
            throw err;
          }
        });
      });
      console.log(chalk.yellow('Files renamed!'));
    });
  }

  renameSuffix() {
    setTimeout(() => {
      fse.readdir(target, (err, files) => {
        // ensure that hidden files are not considered
        files = files.filter(item => !(regex).test(item));
        files.forEach((file) => {
          const x = `${target}/${file}`;
          fse.rename(x, x.replace(file.substring(0, 5), newDir), (err) => {
            if (err) {
              throw err;
            }
          });
        });
        console.log(chalk.yellow('Suffixes renamed!'));
      });
    }, 20);
  }

};

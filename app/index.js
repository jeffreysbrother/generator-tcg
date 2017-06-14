'use strict';
const Generator = require('yeoman-generator');
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');

const cwd = process.cwd();
const regex = /(^|\/)\.[^\/\.]/ig;

let section;
let originalDir;
let newDir;
let originalNamespace;
let newNamespace;
let oldPath;
let newPath;
let target;
let oldTarget;

module.exports = class extends Generator {

  prompting() {

    const prompts = [{
      type: 'input',
      name: 'section',
      message: 'What section are you working on?'
    },{
      type: 'input',
      name: 'originalDir',
      message: 'Which directory do you wish to copy?'
    },{
      type: 'input',
      name: 'newDir',
      message: 'What would you like to call it?'
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
    if (fse.existsSync(target) === true) {
      console.log(`${chalk.yellow(newPath)} already exists! Aborting.`);
      process.exit();
    } else if (fse.existsSync(oldTarget) === false) {
      console.log(`The directory you're attempting to copy (${chalk.yellow(oldPath)}) doesn't exist! Aborting.`);
      process.exit();
    } else {
      try {
        fse.copySync(oldPath, newPath);
        console.log('files copied!');
      } catch (err) {
        console.error(err);
      }
    }
  }

  // after copying, this will rename all files with the new namespace
  renameNameSpace() {
    fse.readdir(target, (err, files) => {
      // ensure that hidden files are not considered
      files = files.filter(item => !(regex).test(item));
      files.forEach((file) => {
        let x = `${target}/${file}`;
        fse.rename(x, x.replace(originalNamespace, newNamespace), (err) => {
          if (err) {
            throw err;
          }
        });
      });
      console.log('files renamed!');
    });
  }

  renameSuffix() {
    setTimeout(() => {
      fse.readdir(target, (err, files) => {
        // ensure that hidden files are not considered
        files = files.filter(item => !(regex).test(item));
        files.forEach((file) => {
          let x = `${target}/${file}`;
          fse.rename(x, x.replace(file.substring(0, 5), newDir), (err) => {
            if (err) {
              throw err;
            }
          });
        });
        console.log('Suffixes renamed!');
      });
    }, 20);
  }

};

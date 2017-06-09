'use strict';
const Generator = require('yeoman-generator');
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');

const cwd = process.cwd();
const regex = /(^|\/)\.[^\/\.]/ig;

let originalNamespace;
let newNamespace;
let oldPath;
let newPath;
let newSuffix;
let newScheme;
let target;
let oldTarget;

module.exports = class extends Generator {

  prompting() {

    const prompts = [{
      type: 'input',
      name: 'originalNamespace',
      message: 'Which directory do you wish to copy?'
    },{
      type: 'input',
      name: 'originalSubdirectory',
      message: 'Which subdirectory?'
    },{
      type: 'input',
      name: 'newNamespace',
      message: 'Desired prefix?'
    },{
      type: 'input',
      name: 'newSuffix',
      message: 'Desired suffix?'
    }];

    return this.prompt(prompts).then(answers => {

      originalNamespace = answers.originalNamespace;
      newNamespace = answers.newNamespace;
      oldPath = `${answers.originalNamespace}/${answers.originalSubdirectory}`;
      newPath = `${answers.newNamespace}/${answers.newNamespace}-${answers.newSuffix}`;
      newSuffix = answers.newSuffix;

      newScheme = `${newNamespace}\-${newSuffix}`;
      oldTarget = `${cwd}/${oldPath}`;
      target = `${cwd}/${newPath}`;

    });
  }

  copy() {
    if (fse.existsSync(target) === true) {
      console.log('Parent and child directories already exist! Aborting.');
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
          fse.rename(x, x.replace(file.substring(0, 5), newScheme), (err) => {
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

'use strict';
const Base = require('yeoman-generator').Base;
const fse = require('fs-extra');
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

module.exports = class extends Base {

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
      target = `${cwd}/${newPath}`;

    });
  }

  copy() {
    if (fse.existsSync(target) === true) {
      console.log('Parent and child directories already exist!');
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
  }

};

'use strict';
const generators = require('yeoman-generator');
const yosay = require('yosay');
const fse = require('fs-extra');
const path = require('path');
const beautify = require('js-beautify').js_beautify;

const cwd = process.cwd();
const re = /^.{2}/g;

let originalNamespace = "",
    newNamespace = "",
    origin = "",
    mod = "",
    newPath = "";

module.exports = generators.Base.extend({

  constructor: function () {
    generators.Base.apply(this, arguments);
  },

  prompting: function () {
    this.log(yosay('Hey TCG, whadyawant?'));

    let prompts = [{
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
    }];

    return this.prompt(prompts).then(function (answers) {

      originalNamespace = answers.originalNamespace;
      newNamespace = answers.newNamespace;
      origin = `${answers.originalNamespace}/${answers.originalSubdirectory}`;
      mod = answers.originalSubdirectory.replace(re, answers.newNamespace);
      newPath = `${answers.newNamespace}/${mod}`;

    }.bind(this));
  },

  copy: function () {
    if (fse.existsSync(`${cwd}/${newPath}`)) {
      console.log('Parent and child directories already exist!');
      process.exit();
    } else if (fse.existsSync(`${cwd}/${newNamespace}`)) {
      console.log('Parent directory already exists!');
      process.exit();
    } else {
      try {
        fse.copySync(origin, newPath);
        console.log('files copied!');
      } catch (err) {
        console.error(err);
      }
    }
  },

  // after copying, this will rename all files with the new namespace
  rename: function () {
      let target = `${cwd}/${newPath}`;

      fse.readdir(target, function (err, files) {
        files.forEach(function (file) {

          fse.rename(`${target}/${file}`, `${target}/${file}`.replace(originalNamespace, newNamespace), function (err) {
            if (err) {
              throw err;
            }
          });

        });
        console.log('files renamed!');
      });
  },

  // this renames all .jsrc files to .js
  renameJS: function () {
    let target2 = `${cwd}/${newPath}`;
    // setTimeout() is being used because we need to force synchronous execution. Is there a better way?
    setTimeout(function () {
      fse.readdir(target2, function (err, files) {
        files.forEach(function (file) {
          if (path.extname(file) == ".jsrc") {
            fse.rename(`${target2}/${file}`, `${target2}/${file}`.replace('.jsrc', '.js'), function (err) {
              if (err) {
                throw err;
              }
            });
            console.log(`...and "${file}" has been renamed to "${file.replace('.jsrc', '.js')}"`);
          }
        });
      });
    }, 1000);
  }

});

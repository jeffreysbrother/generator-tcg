'use strict';
const generators = require('yeoman-generator');
const yosay = require('yosay');
const fse = require('fs-extra');
const path = require('path');

const cwd = process.cwd();
const re = /^.{2}/g;

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

      global.originalNamespace = answers.originalNamespace;
      global.newNamespace = answers.newNamespace;
      global.origin = `${answers.originalNamespace}/${answers.originalSubdirectory}`;
      global.mod = answers.originalSubdirectory.replace(re, answers.newNamespace);
      global.newPath = `${answers.newNamespace}/${global.mod}`;

    }.bind(this));
  },

  copy: function () {
    // copy files from origin to new subdirectory
    try {
      fse.copySync(global.origin, global.newPath);
      console.log('files copied!');
    } catch (err) {
      console.error(err);
    }
  },

  rename: function () {
      let target = `${cwd}/${global.newPath}`;

      fse.readdir(target, function (err, files) {
        files.forEach(function (file) {

          fse.rename(`${target}/${file}`, `${target}/${file}`.replace(global.originalNamespace, global.newNamespace), function (err) {
            if (err) {
              throw err;
            }
          });

        });
        console.log('files renamed!');
      });
  }


});

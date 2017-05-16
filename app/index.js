'use strict';
const generators = require('yeoman-generator');
const yosay = require('yosay');
const mkdirp = require('mkdirp');
const fs = require('fs');
let path = require('path');
let ncp = require('ncp').ncp;

let cwd = process.cwd();
let re = /^.{2}/g;

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

  directories: function (prompts) {
    // create parent and sub directories
    mkdirp.sync(global.newPath, function (err) {
      if (err) {
        return console.error(err);
      }
    });
    console.log("dirs made!");
  },

  files: function () {
    // copy files from origin to new subdirectory
    ncp(global.origin, global.newPath, function (err) {
      if (err) {
        return console.error(err);
      }
    });
    console.log("files copied!");
  },

  rename: function () {
      let target = `${cwd}/${global.newPath}`;
      fs.readdir(target, function(err, files) {
        files.forEach(function(file) {
          console.log(file);

            // fs.rename(file, file.replace(global.originalNamespace, global.newNamespace), function(err) {
            //   if (err) {
            //     throw err;
            //   }
            // });

        });
      });
  }


});

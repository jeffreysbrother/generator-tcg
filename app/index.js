'use strict';
const generators = require('yeoman-generator');
const yosay = require('yosay');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
let path = require('path');
let ncp = require('ncp').ncp;
// let shell = require('shelljs');

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

      var re = /^.{2}/g

      global.originalNamespace = answers.originalNamespace;
      global.newNamespace = answers.newNamespace;

      global.originalSubdirectory = answers.originalSubdirectory;
      global.newSubdirectory = answers.newSubdirectory;

      global.origin = `${answers.originalNamespace}/${answers.originalSubdirectory}`;
      global.mod = answers.originalSubdirectory.replace(re, answers.newNamespace);
      global.newPath = `${answers.newNamespace}/${mod}`;

      global.oldPhpFile = `${answers.originalNamespace}/${answers.originalSubdirectory}/${answers.originalSubdirectory}.php`;
      global.newPhpFile = `${answers.newNamespace}/${answers.newSubdirectory}/${answers.newSubdirectory}.php`;

      global.renamePHP = `${answers.newNamespace}/${answers.newSubdirectory}/${answers.originalSubdirectory}.php`;
      global.newPHP = `${answers.newNamespace}/${answers.newSubdirectory}/${answers.newSubdirectory}.php`;

    }.bind(this));
  },

  writing: function (prompts) {

    // this successfully creates the parent and sub directories
    mkdirp.sync(global.newPath, function (err) {
      if (err) console.error(err)
      else console.log('pow!');
    });

    // copy files from origin to new subdirectory
    ncp(global.origin, global.newPath, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log('done!');
    });

    // rename: this is not working
    var target = global.newPath;

    fs.readdir(target, function(err, files) {
      files.forEach(function(file) {
        if (path.extname == ".jsrc") {
          fs.rename(file, file.replace(".jsrc", ".js"), function(err) {
            if (err) {
              throw err;
            }
          });
        } else {
          fs.rename(file, file.replace(global.originalNamespace, global.newNamespace), function(err) {
            if (err) {
              throw err;
            }
          });
        }
      });
    });





  },

  end: function () {

  }

});

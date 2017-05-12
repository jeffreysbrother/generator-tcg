'use strict';
const generators = require('yeoman-generator');
const yosay = require('yosay');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
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

      global.originalNamespace = answers.originalNamespace;
      global.newNamespace = answers.newNamespace;

      global.originalSubdirectory = answers.originalSubdirectory;
      global.newSubdirectory = answers.newSubdirectory;

      global.target = `${answers.originalNamespace}/${answers.originalSubdirectory}`;
      global.mod = answers.originalSubdirectory.replace(/^.{2}/g, answers.newNamespace);
      global.newPath = `${answers.newNamespace}/${mod}`;

      global.oldPhpFile = `${answers.originalNamespace}/${answers.originalSubdirectory}/${answers.originalSubdirectory}.php`;
      global.newPhpFile = `${answers.newNamespace}/${answers.newSubdirectory}/${answers.newSubdirectory}.php`;

    }.bind(this));
  },

  writing: function (prompts) {

    // this successfully creates the parent and sub directories
    mkdirp.sync(global.newPath, function (err) {
      if (err) console.error(err)
      else console.log('pow!');
    });

    // this does not WRITE the contents of the file
    ncp(global.target, global.newPath, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log('done!');
    });


  },

  end: function () {
    // might not need this
  }

});

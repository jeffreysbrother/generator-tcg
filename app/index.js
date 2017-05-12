'use strict';
const generators = require('yeoman-generator');
const yosay = require('yosay');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
let ncp = require('ncp').ncp;

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

      global.target = `${answers.originalNamespace}/${answers.originalSubdirectory}`;
      global.mod = answers.originalSubdirectory.replace(/^.{2}/g, answers.newNamespace);
      global.newPath = `${answers.newNamespace}/${mod}`;

    }.bind(this));
  },

  writing: function (prompts) {

    let fileArray = [];

    // this successfully creates the parent and sub directories
    mkdirp.sync(global.newPath, function (err) {
      if (err) console.error(err)
      else console.log('pow!');
    });

    // read files out of the target dir (but we don't want to simply READ, we want to copy, then rename)
    // fs.readdir(global.target, function (err, files, answers) {
    //   files.forEach(function (file) {
    //     fileArray = file;
    //     console.log(fileArray);
    //   });
    // });


    // this.log(global.target);
    // this.log(global.mod);
    // this.log(global.newPath);
    //
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

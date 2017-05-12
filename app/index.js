'use strict';
const generators = require('yeoman-generator');
const yosay = require('yosay');
const chalk = require('chalk');
const wiredep = require('wiredep');
const mkdirp = require('mkdirp');
const ncp = require('ncp');

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

      let target = `${answers.originalNamespace}/${answers.originalSubdirectory}`;
      let mod = answers.originalSubdirectory.replace(/^.{2}/g, answers.newNamespace);
      let newPath = `${answers.newNamespace}/${mod}`;

    }.bind(this));
  },

  writing: function () {
    ncp(this.target, this.newPath, function (err) {
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

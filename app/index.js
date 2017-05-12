'use strict';
const generators = require('yeoman-generator');
const yosay = require('yosay');
const chalk = require('chalk');
const wiredep = require('wiredep');
const mkdirp = require('mkdirp');
const ncp = require('ncp').ncp;
const _s = require('underscore.string');

module.exports = generators.Base.extend({

  constructor: function () {
    generators.Base.apply(this, arguments);
  },

  prompting: function () {
    if (!this.options['skip-welcome-message']) {
      this.log(yosay('Hey TCG, whadyawant?'));
    }

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

      console.log(target);
      console.log(mod);
      console.log(newPath);

    }.bind(this));
  },

  writing: {
    // create: function () {
    //   this.fs.copyTpl(
    //     this.templatePath = path
    //     this.destinationPath('gulpfile.js'),
    //     {
    //       date: (new Date).toISOString().split('T')[0],
    //       name: this.pkg.name,
    //       version: this.pkg.version,
    //       includeBootstrap: this.includeBootstrap,
    //       includeUncss: this.includeUncss,
    //       includeBabel: this.options['babel'],
    //       testFramework: this.options['test-framework']
    //     }
    //   );
    // }

    // ncp(target, newPath, function (err) {
    //   if (err) {
    //     return console.error(err);
    //   }
    //   console.log(newPath);
    // });

  },

  end: function () {

  }

});

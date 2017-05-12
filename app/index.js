'use strict';
let generators = require('yeoman-generator');
let yosay = require('yosay');
let chalk = require('chalk');
let wiredep = require('wiredep');
let mkdirp = require('mkdirp');
let _s = require('underscore.string');

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
      name: 'directory',
      message: 'Which directory do you wish to copy?',
      store: false
    }];

    return this.prompt(prompts).then(function (answers) {
      let directory = answers.directory;

      console.log(answers.directory);

    }.bind(this));
  },

  writing: {
    // gulpfile: function () {
    //   this.fs.copyTpl(
    //     this.templatePath('gulpfile.js'),
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
    // },

  },

  end: function () {

  }

});

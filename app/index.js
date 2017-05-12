'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');
var mkdirp = require('mkdirp');
var _s = require('underscore.string');

module.exports = generators.Base.extend({
  constructor: function () {

    generators.Base.apply(this, arguments);

  },


  prompting: function () {
    if (!this.options['skip-welcome-message']) {
      // commented out becasue this dumps the message AND the default ASCII ART
      this.log(yosay('Hey TCG, whadyawant?'));
    }

    var prompts = [{
      type: 'input',
      name: 'directory',
      message: 'Which directory do you wish to copy?',
      store: true
    }
  ];

    return this.prompt(prompts).then(function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      };

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeSass = hasFeature('includeSass');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeTagManager = hasFeature('includeTagManager');
      this.includeUncss = hasFeature('includeUncss');
      this.includeJQuery = answers.includeJQuery;

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
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    // wire Bower packages to .html
    wiredep({
      bowerJson: bowerJson,
      directory: 'bower_components',
      exclude: ['bootstrap-sass', 'bootstrap.js'],
      ignorePath: /^(\.\.\/)*\.\./,
      src: 'app/index.html'
    });

  }
});

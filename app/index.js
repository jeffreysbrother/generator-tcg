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

      // this.log(target);
      // this.log(mod);
      // this.log(newPath);

    }.bind(this));
  },

  writing: function (prompts) {
    // this.log(global.target);
    // this.log(global.mod);
    // this.log(global.newPath);

    // mkdirp(global.newPath, function (err) {
    //     if (err) console.error(err)
    //     else console.log('pow!')
    // });

    ncp(global.target, global.newPath, function (err) {
      if (!fs.existsSync(global.newPath)) {
        mkdirp.sync(global.newPath, function (err) {
          if (err) console.error(err)
          else console.log('pow!');
        });
      }

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

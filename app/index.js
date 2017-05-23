'use strict';
const generators = require('yeoman-generator'),
      yosay = require('yosay'),
      fse = require('fs-extra'),
      path = require('path'),
      cwd = process.cwd(),
      regex = /(^|\/)\.[^\/\.]/ig;

let originalNamespace,
    newNamespace,
    origin,
    newPath,
    newSuffix,
    target;

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
    },{
      type: 'input',
      name: 'newSuffix',
      message: 'Desired suffix?'
    }];

    return this.prompt(prompts).then(function (answers) {

      originalNamespace = answers.originalNamespace;
      newNamespace = answers.newNamespace;
      origin = `${answers.originalNamespace}/${answers.originalSubdirectory}`;
      newPath = `${answers.newNamespace}/${answers.newNamespace}-${answers.newSuffix}`;
      newSuffix = answers.newSuffix;

      target = `${cwd}/${newPath}`;

    }.bind(this));
  },

  copy: function () {
    if (fse.existsSync(target)) {
      console.log('Parent and child directories already exist!');
      process.exit();
    } else {
      try {
        fse.copySync(origin, newPath);
        console.log('files copied!');
      } catch (err) {
        console.error(err);
      }
    }
  },

  // after copying, this will rename all files with the new namespace
  renameNameSpace: function () {
      fse.readdir(target, function (err, files) {
        // ensure that hidden files are not considered
        files = files.filter(item => !(regex).test(item));
        files.forEach(function (file) {
          fse.rename(`${target}/${file}`, `${target}/${file}`.replace(originalNamespace, newNamespace), function (err) {
            if (err) {
              throw err;
            }
          });
        });
        console.log('files renamed!');
      });
  },

  // this renames all .jsrc files to .js
  renameJS: function () {
    // setTimeout() is being used because we need to force synchronous execution. Is there a better way?
    setTimeout(function () {
      fse.readdir(target, function (err, files) {
        // ensure that hidden files are not considered
        files = files.filter(item => !(regex).test(item));
        files.forEach(function (file) {
          if (path.extname(file) == ".jsrc") {
            fse.rename(`${target}/${file}`, `${target}/${file}`.replace('.jsrc', '.js'), function (err) {
              if (err) {
                throw err;
              }
            });
            console.log(`...and "${file}" has been renamed to "${file.replace('.jsrc', '.js')}"`);
          }
        });
      });
    }, 1000);
  },

  renameSuffix: function () {
      fse.readdir(target, function (err, files) {
        // ensure that hidden files are not considered
        files = files.filter(item => !(regex).test(item));
        files.forEach(function (file) {
          fse.rename(`${target}/${file}`, `${target}/${file}`.replace(file.substring(0, 5), `${newNamespace}\-${newSuffix}`), function (err) {
            if (err) {
              throw err;
            }
          });
        });
        console.log('Suffixes renamed!');
      });
  }

});

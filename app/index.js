'use strict';
const Generator = require('yeoman-generator');
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');

const cwd = process.cwd();
const ignoreHiddenFiles = /(^|\/)\.[^\/\.]/ig;
const restrictUserInputPattern = /\b[a-zA-Z]{2}(-)\d{2,3}\b/g;
const pathToSection = `${cwd}/source/sections`;
const osenv = require('osenv');
const user = osenv.user();
const pathToConfig = `${cwd}/config.json`;
const devInitials = require(pathToConfig).developer;

let section;
let originalDir;
let howMany;
let originalNamespace;
let newNamespace = [];
let oldPath;
let oldTarget;
let target = [];
let newPathToUser;
let existingFiles = [];
let lastFile;
let lastFileSuffix;
let newFileSuffixes = [];

module.exports = class extends Generator {

  prompting() {
    const prompts = [{
      type: 'input',
      name: 'section',
      message: 'What section are you working on?',
      validate: value => {
        // ensure that section exists
        if (fse.existsSync(`${pathToSection}/${value}/`) === true) {
          return true;
        } else {
          console.log(chalk.yellow(" Section doesn't exist!"));
          return false;
        }
      }
    },{
      type: 'input',
      name: 'originalDir',
      message: 'Which directory do you wish to copy?',
      validate: value => {
        // ensure user input is two letters, a hyphen, and 2-3 digits
        const check = value.match(restrictUserInputPattern);
        if (check) {
          return true;
        } else {
          console.log(chalk.yellow(' Invalid directory name!'));
          return false;
        }
      }
    },{
      type: 'number',
      name: 'howMany',
      message: 'How many variations would you like?'
    }];

    return this.prompt(prompts).then(answers => {

      // user input
      section = answers.section;
      originalDir = answers.originalDir;
			howMany = answers.howMany;

      // derive new & old namespaces
      originalNamespace = originalDir.substr(0, originalDir.indexOf('-'));

      // generate path relative to funnel/
      oldPath = `source/sections/${section}/${originalNamespace}/${originalDir}`;
			newPathToUser = `${cwd}/source/sections/${section}/${devInitials}`;

			// get array of existing files
			fse.readdirSync(newPathToUser).forEach(file => {
				existingFiles.push(file);
			});

			// find last file ... and last file suffix from array of existing files
			lastFile = existingFiles[existingFiles.length - 1];
			lastFileSuffix = lastFile.substring(lastFile.indexOf('-') + 1, lastFile.length);

			// create array of numerically next suffixes
			for (let i = 1; i <= howMany; i++) {
				newFileSuffixes.push(parseFloat(lastFileSuffix) + i);
			}

			// populate array of new directories
			newFileSuffixes.forEach(i => {
				target.push(`${cwd}/source/sections/${section}/${devInitials}/${devInitials}-${i}`);
			});

      // generate absolute path (old)
      oldTarget = `${cwd}/${oldPath}`;

    });
  }

  copy() {
		target.forEach( i => {
			let newFileName = path.basename(i);
			// if newDir already exists
	    if (fse.existsSync(i) === true && fse.existsSync(oldTarget) === false) {
	      console.log(chalk.yellow(`Damn, bro! ${originalDir} doesn't exist and ${newFileName} already does! Aborting.`));
	      process.exit();
	    } else if (fse.existsSync(i) === true) {
	      console.log(chalk.yellow(`${newFileName} already exists! Aborting.`));
	      process.exit();
	    // if originalDir doesn't exist
	    } else if (fse.existsSync(oldTarget) === false) {
	      console.log(chalk.yellow(`${originalDir} doesn't exist! Aborting.`));
	      process.exit();
			// if successful...
	    } else {
				try {
	        fse.copySync(oldPath, i);
	      } catch (err) {
	        console.error(err);
	      }
			}
		});
		console.log(chalk.yellow('Files copied!'));
  }

  rename() {
		// for each new absolute path to directory (e.g. ...jc-01/ ...jc-02/ )
		target.forEach( i => {
			fse.readdir(i, (err, files) => {
	      // skip hidden files
	      files = files.filter(item => !(ignoreHiddenFiles).test(item));
	      files.forEach(file => {
	        let fullPath = `${i}/${file}`;
					let newPart = path.basename(path.dirname(fullPath));
					let oldPart = file.substring(0, file.indexOf('.'));
					fse.rename(fullPath, fullPath.replace(oldPart, newPart)), err => {
						if (err) {
							throw err;
						}
					};
	      });
	    });
		});
		console.log(chalk.yellow('Files renamed!'));
  }

};

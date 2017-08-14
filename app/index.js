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
let oldPath;
let oldTarget;
let target = [];
let newPathToUser;
let existingDirs = [];
let lastDir;
let lastSuffix;
let newSuffixes = [];

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

      // derive original namespaces
      originalNamespace = originalDir.substr(0, originalDir.indexOf('-'));

      // generate path relative to funnel/
      oldPath = `source/sections/${section}/${originalNamespace}/${originalDir}`;
			newPathToUser = `${cwd}/source/sections/${section}/${devInitials}`;

			// if the user folder does not exist, create it
			if (!fse.existsSync(newPathToUser)) {
				fse.mkdirSync(newPathToUser);
			}

			// get array of existing dirs
			fse.readdirSync(newPathToUser).forEach(file => {
				existingDirs.push(file);
			});

			// find last existing dir ... and last suffix from array of existing dirs
			lastDir = existingDirs[existingDirs.length - 1];
			lastSuffix = existingDirs.length == 0 ? "0" : lastDir.substring(lastDir.indexOf('-') + 1, lastDir.length);

			// create array of numerically next suffixes
			for (let i = 1; i <= howMany; i++) {
				newSuffixes.push(parseFloat(lastSuffix) + i);
			}

			// convert array of numbers to array of strings
			let suffixesStringy = newSuffixes.map(String);

			// populate array of new dirs, add padding if suffix is one digit
			suffixesStringy.forEach(i => {
				if (i.length == 1) {
					target.push(`${cwd}/source/sections/${section}/${devInitials}/${devInitials}-0${i}`);
				} else {
					target.push(`${cwd}/source/sections/${section}/${devInitials}/${devInitials}-${i}`);
				}
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

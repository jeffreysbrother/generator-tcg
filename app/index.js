'use strict';
const Generator = require('yeoman-generator');
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const osenv = require('osenv');

const cwd = process.cwd();
const user = osenv.user();
const ignoreHiddenFiles = /(^|\/)\.[^\/\.]/ig;
const restrictUserInputPattern = /\b[a-zA-Z]{2}(-)\d{2,3}\b/g;
const pathToSection = `${cwd}/source/sections`;
const pathToConfig = `${cwd}/config.json`;
const devInitials = require(pathToConfig).developer;

let section;
let originalDir;
let howMany;
let originalNamespace;
let oldPath;
let target = [];
let newPath;
let existingDirs = [];
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
        if (value.match(restrictUserInputPattern)) {
          return true;
        } else {
          console.log(chalk.yellow(' Invalid directory name!'));
          return false;
        }
      }
    },{
      type: 'number',
      name: 'howMany',
      message: 'How many variations would you like?',
			validate: value => {
				if (!isNaN(parseFloat(value)) && isFinite(value) && value % 1 === 0) {
					if (parseFloat(value) === 0) {
						console.log(chalk.yellow(' What? You don\'t want that.'));
						return false;
					} else if (parseFloat(value) > 10) {
						console.log(chalk.yellow(' Too many variations!'));
						return false;
					} else {
						return true;
					}
				} else {
					console.log(chalk.yellow(' Please enter a whole number.'));
					return false;
				}
			}
    }];

    return this.prompt(prompts).then(answers => {
      section = answers.section;
      originalDir = answers.originalDir;
			howMany = answers.howMany;
    });
  }

	manipulation() {
		// derive original namespaces
		originalNamespace = originalDir.substr(0, originalDir.indexOf('-'));

		// generate old/new path
		oldPath = `${pathToSection}/${section}/${originalNamespace}/${originalDir}`;
		newPath = `${pathToSection}/${section}/${devInitials}`;

		// if the user folder does not exist, create it
		if (!fse.existsSync(newPath)) {
			fse.mkdirSync(newPath);
		}

		// get array of existing dirs
		fse.readdirSync(newPath).forEach(dir => {
			existingDirs.push(dir);
		});

		// find last existing dir ... and last suffix from array of existing dirs
		let lastDir = existingDirs[existingDirs.length - 1];
		let lastSuffix = existingDirs.length == 0 ? "0" : lastDir.substring(lastDir.indexOf('-') + 1, lastDir.length);

		// create array of numerically next suffixes
		for (let i = 1; i <= howMany; i++) {
			newSuffixes.push(parseFloat(lastSuffix) + i);
		}

		// convert array of numbers to array of strings
		let suffixesStringy = newSuffixes.map(String);

		// populate array of new paths to variations, adding padding if suffix is one digit
		suffixesStringy.forEach(suffix => {
			if (suffix.length == 1) {
				target.push(`${newPath}/${devInitials}-0${suffix}`);
			} else {
				target.push(`${newPath}/${devInitials}-${suffix}`);
			}
		});
	}

  copy() {
		target.forEach( i => {
			let newFileName = path.basename(i);
			// if originalDir doesn't exist
			if (fse.existsSync(oldPath) === false) {
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
  }

	message() {
		let items = [];
		target.forEach(i => { items.push(path.basename(i)) });
		if (items.length > 1) {
			console.log(chalk.yellow(`${howMany} variations created: ${items.join(', ')}`));
		} else {
			console.log(chalk.yellow(`${howMany} variation created: ${items[0]}`));
		}
	}

};

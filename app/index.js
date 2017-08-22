'use strict';
const Generator = require('yeoman-generator');
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const osenv = require('osenv');
const simpleGit = require('simple-git');
const shell = require('shelljs');

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
let pathToOriginalDir;
let pathsToNewVariations = [];
let pathToNewDev;
let existingDirs = [];
let newSuffixes = [];
let doGitStuff;
let blurb;

module.exports = class extends Generator {

  prompting() {
    const prompts = [{
      type: 'input',
      name: 'section',
      message: 'What section are you working on?',
      validate: value => {
        if (fse.existsSync(`${pathToSection}/${value}`)) {
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
    },{
      type: 'input',
      name: 'blurb',
      message: 'Please enter a short branch description:',
			validate: value => {
				let trimmed = value.toLowerCase().replace(/\s/g,'');
				if (!shell.exec(`git rev-parse --verify ${devInitials}_${section}_${trimmed}`)) {
					console.log(chalk.yellow(' Local branch already exists.'));
					return false;
				// if (shell.exec(`git ls-remote --heads origin ${devInitials}_${section}_${trimmed}`).code !== 0) {
				// 	console.log(chalk.yellow(' Remote branch already exists.'));
				// 	return false;
				// 	process.exit();
				} else {
					return true;
				}
			}
    }];

    return this.prompt(prompts).then(answers => {
      section = answers.section;
      originalDir = answers.originalDir;
			howMany = answers.howMany;
			blurb = answers.blurb;
    });
  }

	manipulation() {
		originalNamespace = originalDir.substr(0, originalDir.indexOf('-'));

		pathToOriginalDir = `${pathToSection}/${section}/${originalNamespace}/${originalDir}`;
		pathToNewDev = `${pathToSection}/${section}/${devInitials}`;

		if (!fse.existsSync(pathToNewDev)) {
			fse.mkdirSync(pathToNewDev);
		}

		// get array of existing dirs
		fse.readdirSync(pathToNewDev).forEach(dir => {
			existingDirs.push(dir);
		});

		// find last existing dir
		let lastDir = existingDirs[existingDirs.length - 1];

		// get last suffix from array of existing dirs
		if (existingDirs.length == 0) {
			var lastSuffix = "0";
		} else {
			var lastSuffix = lastDir.substring(lastDir.indexOf('-') + 1, lastDir.length);
		}

		// create array of numerically next suffixes
		for (let i = 1; i <= howMany; i++) {
			newSuffixes.push(parseFloat(lastSuffix) + i);
		}

		// convert array of numbers to array of strings
		let suffixesStringy = newSuffixes.map(String);

		// populate array of paths to new variations, adding padding if suffix is one digit
		suffixesStringy.forEach(suffix => {
			if (suffix.length == 1) {
				pathsToNewVariations.push(`${pathToNewDev}/${devInitials}-0${suffix}`);
			} else {
				pathsToNewVariations.push(`${pathToNewDev}/${devInitials}-${suffix}`);
			}
		});
	}

  copy() {
		pathsToNewVariations.forEach(variation => {
			let newFileName = path.basename(variation);
			if (!fse.existsSync(pathToOriginalDir)) {
	      console.log(chalk.yellow(`${originalDir} doesn't exist! Aborting.`));
	      process.exit();
	    } else {
				try {
	        fse.copySync(pathToOriginalDir, variation);
	      } catch (err) {
	        console.error(err);
	      }
			}
		});
  }

  rename() {
		pathsToNewVariations.forEach(variation => {
			fse.readdir(variation, (err, files) => {
	      // skip hidden files
	      files = files.filter(item => !(ignoreHiddenFiles).test(item));
	      files.forEach(file => {
	        let fullPath = `${variation}/${file}`;
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
		pathsToNewVariations.forEach(variation => { items.push(path.basename(variation)) });
		if (items.length > 1) {
			console.log(chalk.yellow(`${howMany} variations created: ${[...items]}.`));
		} else {
			console.log(chalk.yellow(`${howMany} variation created: ${items}.`));
		}
	}

	end() {
		let newBranch = `${devInitials}_${section}_${blurb}`;
		try {
			simpleGit()
				.checkoutBranch(newBranch, 'master', (err, result) => {
					console.log(chalk.yellow(`Switched to new branch ${newBranch}`));
				})
				.add('./*')
				.commit(`copied ${originalDir}`, (err, result) => {
					console.log(chalk.yellow('Changes staged and committed'));
				})
				.push(['-u', 'origin', `${newBranch}`], (err, result) => {
					console.log(chalk.yellow('Pushed!'));
				});
		} catch (err) {
			console.error(err);
		}
	}

};

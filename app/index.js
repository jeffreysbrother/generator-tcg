'use strict';
const Generator = require('yeoman-generator');
const fse = require('fs-extra');
const fs = require('extfs');
const chalk = require('chalk');
const path = require('path');
const simpleGit = require('simple-git');
const shell = require('shelljs');

const cwd = process.cwd();
const ignoreHiddenFiles = /(^|\/)\.[^\/\.]/ig;
const restrictUserInputPattern = /\b[a-zA-Z]{2}(-)\d{2,3}\b/g;
const pathToSection = `${cwd}/source/sections`;

let isGit = true;
let pathToConfig ='';
let devInitials = '';
let jsonContents;
let section;
let originalDir;
let howMany;
let originalNamespace;
let pathToOriginalDir;
let pathsToNewVariations = [];
let pathToNewDev;
let existingDirs = [];
let newSuffixes = [];
let blurb;
let newBranch;
let lastSuffix;
let emptyFile;
let missing;
let inputJSONinitials;
let configMissing = false;

// if no .git file is found (if not a Git repository)
if (!fse.existsSync(`${cwd}/.git`)) {
	isGit = false;
}

emptyFile = fs.isEmptySync(`${cwd}/config.json`);

// check if config.json exists
if (fse.existsSync(`${cwd}/config.json`)) {
	pathToConfig = `${cwd}/config.json`;

  if (emptyFile === true) {
    console.log(chalk.red('Your config.json is empty!! Please see README for details.'));
    process.exit();
  }

	try {
		// try to get contents of JSON
		jsonContents = JSON.parse(fse.readFileSync(pathToConfig, 'utf8'));
		try {
			// try to set devInitials
			devInitials = require(pathToConfig).developer.replace(/\s/g,'');
		} catch(e) {
			console.log(chalk.red('config.json is misconfigured! See README for more details.'));
			process.exit();
		}
	} catch(e) {
		// if JSON is invalid
		console.log(chalk.red('config.json is invalid. Please fix and try again.'));
		process.exit();
	}

} else {
	console.log(chalk.red('Your config.json is missing!!'));
	configMissing = true;
	// process.exit();
}

module.exports = class extends Generator {

	constructor(args, opts) {
    super(args, opts);

    this.option('skip-git', {
      desc: 'Skips some Git stuff',
      type: Boolean
    });
  }

	initializing() {
		if (!this.options['skip-git'] && isGit === true) {
			simpleGit()
			.checkout('master')
			.pull('origin', 'master');
		}
	}

  prompting() {
    const prompts = [{
			when: configMissing === true,
      type: 'confirm',
      name: 'missing',
      message: 'Create config.json?'
    },{
			when: answers => answers.missing,
      type: 'input',
      name: 'inputJSONinitials',
      message: 'what are your initials?',
			filter: value => {
				return value.toLowerCase().replace(/\s/g,'');
			},
			validate: value => {
				if (value.length === 2) {
					return true;
				} else {
					console.log(chalk.yellow(' Please enter exactly two alphabetical characters.'));
				}
			}
    },{
      type: 'input',
      name: 'section',
      message: 'What section are you working on?',
			filter: value => {
				return value.toLowerCase().replace(/\s/g,'');
			},
      validate: value => {
				if (value === '' || !value.replace(/\s/g, '').length) {
					console.log(chalk.yellow(' Please enter a valid name.'));
				} else if (fse.existsSync(`${pathToSection}/${value}`)) {
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
			filter: value => {
				return value.toLowerCase().replace(/\s/g,'');
			},
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
			filter: value => {
				return value.toLowerCase().replace(/\s/g,'');
			},
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
			// show this prompt only if user doesn't add the --skip-git flag
			when: !this.options['skip-git'] && isGit === true,
      type: 'input',
      name: 'blurb',
      message: 'Please enter a short branch description:',
			filter: value => {
				return value.toLowerCase().replace(/\s/g,'');
			},
			validate: value => {
				if (value === '' || value === 'undefined') {
					console.log(chalk.yellow(' Invalid name!'));
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
			missing = answers.missing;
			inputJSONinitials = answers.inputJSONinitials;
    });
  }

	createJSON() {
		if (inputJSONinitials) {
			let fileContent = `{\n\t"developer": "${inputJSONinitials}"\n}`;
			let filePath = `${cwd}/config.json`;
			fs.writeFile(filePath, fileContent, err => {
				if (err) throw err;
				console.log('file created!');
			});
		}
	}

	manipulation() {
		originalNamespace = originalDir.substr(0, originalDir.indexOf('-'));
		pathToOriginalDir = `${pathToSection}/${section}/${originalNamespace}/${originalDir}`;
		pathToNewDev = `${pathToSection}/${section}/${devInitials}`;

		if (inputJSONinitials) {
			pathToNewDev = `${pathToSection}/${section}/${inputJSONinitials}`;
		}

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
		lastSuffix = existingDirs.length === 0 ? "0" : lastDir.substring(lastDir.indexOf('-') + 1, lastDir.length);

		// create array of numerically next suffixes
		for (let i = 1; i <= howMany; i++) {
			newSuffixes.push(parseFloat(lastSuffix) + i);
		}

		// convert array of numbers to array of strings
		let suffixesStringy = newSuffixes.map(String);

		// populate array of paths to new variations, adding padding if suffix is one digit
		if (devInitials) {
			suffixesStringy.forEach(suffix => {
				if (suffix.length === 1) {
					pathsToNewVariations.push(`${pathToNewDev}/${devInitials}-0${suffix}`);
				} else {
					pathsToNewVariations.push(`${pathToNewDev}/${devInitials}-${suffix}`);
				}
			});

			newBranch = `${devInitials}_${section}_${blurb}`;
		}

		if (inputJSONinitials) {
			suffixesStringy.forEach(suffix => {
				if (suffix.length === 1) {
					pathsToNewVariations.push(`${pathToNewDev}/${inputJSONinitials}-0${suffix}`);
				} else {
					pathsToNewVariations.push(`${pathToNewDev}/${inputJSONinitials}-${suffix}`);
				}
			});

			newBranch = `${inputJSONinitials}_${section}_${blurb}`;
		}


	}

	checkBranch() {
		if (!this.options['skip-git'] && isGit === true) {
			// check if the branch already exists locally
			if (shell.exec(`git rev-parse --verify --quiet \'${newBranch}\'`, {silent:true}).length > 0) {
				console.log(chalk.yellow('ERROR: local branch already exists. Terminating process.'));
				process.exit();
			// check if the branch already exists remotely
			} else if (shell.exec(`git ls-remote --heads origin \'${newBranch}\'`, {silent:true}).length > 0) {
				console.log(chalk.yellow('ERROR: remote branch already exists. Terminating process.'));
				process.exit();
			}
		}
	}

  copy() {
		pathsToNewVariations.forEach(variation => {
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
	        let fullPath = `${variation}/${file}`,
						newPart = path.basename(path.dirname(fullPath)),
						oldPart = file.substring(0, file.indexOf('.'));
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

	git() {
		if (!this.options['skip-git'] && isGit === true) {
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
	}

};

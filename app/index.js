'use strict';
const Generator = require('yeoman-generator'),
	fse = require('fs-extra'),
	fs = require('extfs'),
	chalk = require('chalk'),
	path = require('path'),
	simpleGit = require('simple-git'),
	shell = require('shelljs'),

	cwd = process.cwd(),
	ignoreHiddenFiles = /(^|\/)\.[^\/\.]/ig,
	restrictUserInputPattern = /\b[a-zA-Z]{2}(-)\d{2,3}\b/g,
	configRule = /\b[a-zA-Z]{2}\b/,
	pathToSection = `${cwd}/source/sections`;

let isGit = true,
	pathToConfig ='',
	devInitials = '',
	jsonContents,
	section,
	originalDir,
	howMany,
	originalNamespace,
	pathToOriginalDir,
	pathsToNewVariations = [],
	pathToNewDev,
	existingDirs = [],
	newSuffixes = [],
	blurb,
	newBranch,
	lastSuffix,
	emptyFile,
	createConfig = '',
	inputJSONinitials,
	configMissing = false,
	fileToReplace = true;

module.exports = class extends Generator {

	constructor(args, opts) {
    super(args, opts);

    this.option('skip-git', {
      desc: 'Skips some Git stuff',
      type: Boolean
    });

		this.option('skip-comment', {
      desc: 'Skips the PHP comments',
      type: Boolean
    });

		this.option('create-tree', {
			desc: 'create directory structure',
			type: Boolean
		});
  }

	initializing() {
		if (this.options['create-tree']) {
			if (!fse.existsSync(`${cwd}/funnel`)) {
				const dirStubs = [
					'funnel/source/sections/home/ga/ga-01',
					'funnel/source/sections/home/bm/bm-01',
					'funnel/source/sections/report-review/ga/ga-01',
					'funnel/source/sections/report-review/ga/ga-02',
					'funnel/source/sections/report-review/jc/jc-01'
				];

				const extensions = [
					'.php',
					'.js',
					'.less'
				];

				dirStubs.forEach(dir => {
					shell.exec(`mkdir -p ${dir}`);
					extensions.forEach(ext => {
						fs.closeSync(fs.openSync(`${dir}/${dir.slice(-5)}${ext}`, 'w'));
					});
				});

				console.log(chalk.yellow(`Directory structure and files generated!\nPlease move into the funnel/ directory and run \'yo tcg\'`));
				process.exit();
			} else {
				console.log(chalk.red('funnel/ directory already exists! Aborting.'));
				process.exit();
			}
		}

		// if no .git file is found (if not a Git repository)
		if (!fse.existsSync(`${cwd}/.git`)) {
			isGit = false;
		}

		if (!this.options['skip-git'] && isGit === true) {
			simpleGit()
				.checkout('master')
				.pull('origin', 'master');
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
					if (devInitials === '') {
						console.log(chalk.red('Please specify your initials in config.json'));
						process.exit();
					}
				} catch(err) {
					console.log(chalk.red('config.json is misconfigured! See README for more details.'));
					process.exit();
				}
			} catch(err) {
				// if JSON is invalid
				console.log(chalk.red('config.json is invalid. Please fix and try again.'));
				process.exit();
			}

		} else {
			console.log(chalk.red('Your config.json is missing!!'));
			configMissing = true;
		}
	}

  prompting() {
    const prompts = [{
			when: configMissing,
      type: 'confirm',
      name: 'createConfig',
      message: 'Create config.json?'
    },{
			when: answers => answers.createConfig,
      type: 'input',
      name: 'inputJSONinitials',
      message: 'What are your initials?',
			filter: value => {
				return value.toLowerCase().replace(/\s/g,'');
			},
			validate: value => {
				if (value.match(configRule)) {
					return true;
				} else {
					console.log(chalk.yellow(' Please enter exactly two alphabetical characters.'));
				}
			}
    },{
			when: answers => answers.createConfig || !configMissing,
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
			when: answers => answers.createConfig || !configMissing,
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
			when: answers => answers.createConfig || !configMissing,
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
			when: !this.options['skip-git'] && isGit === true && (answers => answers.createConfig || !configMissing),
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
			createConfig = answers.createConfig;
			inputJSONinitials = answers.inputJSONinitials;
    });
  }

	abandon() {
		if (createConfig === false) {
			console.log(chalk.yellow('Please create your config.json file and try again. Aborting.'));
			process.exit();
		}
	}

	createJSON() {
		if (inputJSONinitials) {
			let fileContent = `{\n\t"developer": "${inputJSONinitials}"\n}`,
				filePath = `${cwd}/config.json`;
			fs.writeFile(filePath, fileContent, err => {
				if (err) throw err;
				console.log(chalk.yellow('config.json created!'));
			});
		}
	}

	manipulation() {
		originalNamespace = originalDir.substr(0, originalDir.indexOf('-'));
		pathToOriginalDir = `${pathToSection}/${section}/${originalNamespace}/${originalDir}`;

		if (inputJSONinitials) {
			pathToNewDev = `${pathToSection}/${section}/${inputJSONinitials}`;
		} else {
			pathToNewDev = `${pathToSection}/${section}/${devInitials}`;
		}

		if (!fse.existsSync(pathToNewDev)) {
			fse.mkdirSync(pathToNewDev);
		}

		// get array of existing dirs
		fse.readdirSync(pathToNewDev).forEach(dir => existingDirs.push(dir));

		// put array items in numerical order (so last item will have the greatest numerical value)
		existingDirs.sort((a, b) => {
			let firstItem = parseFloat(a.substring(a.indexOf('-') + 1, a.length)),
				secondItem = parseFloat(b.substring(b.indexOf('-') + 1, b.length));
			if (firstItem < secondItem) {
		    return -1;
		  }
		  if (firstItem > secondItem) {
		    return 1;
		  }
		  return 0;
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

		function string(x) {
			suffixesStringy.forEach(suffix => {
				pathsToNewVariations.push(`${pathToNewDev}/${x}-${suffix.padStart(2, '0')}`);
			});
			// if first character is a slash
			if (section.charAt(0) === '/') {
				// remove initial slashes
				let sectionNoSlashes = section.replace(/^(\/)+/, '');
				if (sectionNoSlashes.includes('/')) {
					newBranch = `${x}_${sectionNoSlashes.substring(0, sectionNoSlashes.indexOf('/'))}_${blurb}`;
				} else {
					newBranch = `${x}_${sectionNoSlashes}_${blurb}`;
				}
			} else {
				if (section.includes('/')) {
					newBranch = `${x}_${section.substring(0, section.indexOf('/'))}_${blurb}`;
				} else {
					newBranch = `${x}_${section}_${blurb}`;
				}
			}
		}

		if (devInitials) {
			string(devInitials);
		} else if (inputJSONinitials) {
			string(inputJSONinitials);
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
	        console.log(err);
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
						newPart = path.basename(path.dirname(fullPath));
					fse.rename(fullPath, fullPath.replace(originalDir, newPart), err => {
						if (err) throw err;
					});
	      });
	    });
		});
  }

	message() {
		let items = [];
		pathsToNewVariations.forEach(variation => items.push(path.basename(variation)));

		if (items.length > 0) {
			console.log(chalk.yellow(`${howMany} variation${(items.length > 1) ? 's' : ''} created:${items.map(i => ' ' + i)}.`));
		} else {
			// not sure if this is the best place for this error message
			console.log(chalk.red('Something went wrong. Zero variations created.'));
			process.exit();
		}
	}

	insertPHPComment() {
		if (!this.options['skip-comment']) {
			pathsToNewVariations.forEach(variation => {
				fse.readdir(variation, (err, files) => {
					// skip hidden files
					files = files.filter(item => !(ignoreHiddenFiles).test(item));
					files.forEach(file => {
						let newFile = `${variation}/${file}`;
						if (path.extname(newFile) === '.php') {
							fs.readFile(newFile, 'utf8', (err, data) => {
								if (err) throw err;
								if (data.indexOf('<!-- copied from') >= 0) {
									let commentRegEx = /(\<\!\-{2}\scopied\sfrom\s.{0,6}\s\-{2}\>)/g,
										replacement = data.replace(commentRegEx, `<!-- copied from ${originalDir} -->`);
									fs.writeFile(newFile, replacement, 'utf8', err => {
								    if (err) throw err;
								  });
									// log this message only once
									if (fileToReplace === true) {
										if (howMany > 1) {
											console.log(chalk.yellow('existing comments replaced.'));
										} else {
											console.log(chalk.yellow('existing comment replaced.'));
										}
										fileToReplace = false;
									}
							  } else {
									fs.appendFileSync(newFile, `<!-- copied from ${originalDir} -->`);
								}
							});
						}
					});
				});
			});
		}
	}

	git() {
		if (!this.options['skip-git'] && isGit === true) {
			try {
				simpleGit()
					.checkoutBranch(newBranch, 'master', () => {
						console.log(chalk.yellow(`Switched to new branch ${newBranch}`));
					})
					.add('./*')
					.commit(`copied ${originalDir}`, () => {
						console.log(chalk.yellow('Changes staged and committed'));
					})
					.push(['-u', 'origin', `${newBranch}`], () => {
						console.log(chalk.yellow('Pushed!'));
					});
			} catch (err) {
				console.log(err);
			}
		}
	}

};

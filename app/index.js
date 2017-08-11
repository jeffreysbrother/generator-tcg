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
const pathToConfig = `/Users/${user}/vagrants/public-records/sites/public-records-app/public/truthfinder.com/funnel/config.json`;
const devInitials = require(pathToConfig).developer;

console.log(devInitials);
process.exit();

let section;
let originalDir;
let newDir;
let valueToArray;
let originalNamespace;
let newNamespace = [];
let oldPath;
let oldTarget;
let target = [];

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
      type: 'input',
      name: 'newDir',
      message: 'What would you like to call it?',
      validate: value => {
				// this could be better: currently eliminates all tabs and MULTIPLE spaces
				// (except for those at the beginning and end of the string)
				// would best to eliminate these too
				let multipleSpaceAndTabRemoval = value.replace(/\s{2,}|\t/g, ' ');
				valueToArray = multipleSpaceAndTabRemoval.split(' ');
				valueToArray.forEach(item => {
					// ensure user input is two letters, a hyphen, and 2-3 digits
					if (value.match(restrictUserInputPattern)) {
	          return true;
	        } else {
	          console.log(chalk.yellow(' Invalid directory name!'));
	          return false;
	        }
				});
				return true;
      }
    }];

    return this.prompt(prompts).then(answers => {

      // user input
      section = answers.section;
      originalDir = answers.originalDir;

      // derive new & old namespaces
      originalNamespace = originalDir.substr(0, originalDir.indexOf('-'));
      newNamespace = valueToArray[0].substr(0, valueToArray[0].indexOf('-'));

      // generate path relative to funnel/
      oldPath = `source/sections/${section}/${originalNamespace}/${originalDir}`;

      // generate absolute path (old)
      oldTarget = `${cwd}/${oldPath}`;

			// push (new) absolute paths into an array
			valueToArray.forEach( i => {
				target.push(`${cwd}/source/sections/${section}/${newNamespace}/${i}`);
			});

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

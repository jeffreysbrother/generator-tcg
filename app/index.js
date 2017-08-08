'use strict';
const Generator = require('yeoman-generator');
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');

const cwd = process.cwd();
const regex = /(^|\/)\.[^\/\.]/ig;
const pattern = /\b[a-zA-Z]{2}(-)\d{2,3}\b/g;
const pathToSection = `${cwd}/source/sections`;

let section;

let originalDir;
let newDir;

let valueToArray;

let originalNamespace;
let newNamespace = [];

let oldPath;
let newPath = [];

let oldTarget;
let target = [];

// ----------------------------------------- POLYFILL FOR OBJECT.VALUES
const reduce = Function.bind.call(Function.call, Array.prototype.reduce);
const isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable);
const concat = Function.bind.call(Function.call, Array.prototype.concat);
const keys = Reflect.ownKeys;

if (!Object.values) {
	Object.values = function values(O) {
		return reduce(keys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), []);
	};
}

// --------------------------------------- END POLYFILL FOR OBJECT.VALUES

// this will serve as potential variables names that will store
// individual values from the user's array input
let varNames = ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg'];
let myVariables = {};

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
        const check = value.match(pattern);
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
				valueToArray = value.split(' ');
        // ensure user input is two letters, a hyphen, and 2-3 digits
				valueToArray.forEach(item => {
					if (value.match(pattern)) {
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
      // newDir = answers.newDir;

			valueToArray.forEach((i, v) => {
				myVariables[varNames[v]] = valueToArray[v];
			});

      // derive new/old namespaces
      originalNamespace = originalDir.substr(0, originalDir.indexOf('-'));
      newNamespace = myVariables['aa'].substr(0, myVariables['aa'].indexOf('-'));

      // generate path relative to /funnel
      oldPath = `source/sections/${section}/${originalNamespace}/${originalDir}`;

			Object.values(myVariables).forEach(val => {
			  newPath.push(`source/sections/${section}/${newNamespace}/${val}`);
			});

      // generate absolute path
      oldTarget = `${cwd}/${oldPath}`;

			newPath.forEach( i => {
				target.push(`${cwd}/${i}`);
			});

    });
  }

	// REMOVE COMMENTS TO ILLUSTRATE THAT USER INPUT (ONE DIRECTORY OR MULTIPLE)
	// WILL BE STORED AS ITEMS IN AN ARRAY.
	// NEWNAMESPACE, NEWPATH, AND TARGET ARE WORKING

	// thing() {
	// 	console.log(newNamespace);
	// 	console.log(newPath)
	// 	console.log(target);
	// 	process.exit();
	// }

  copy() {
		target.forEach( i => {
			// newDir already exists
	    if (fse.existsSync(i) === true && fse.existsSync(oldTarget) === false) {
	      console.log(chalk.yellow(`Damn, bro! ${originalDir} doesn't exist and ${i} already does! Aborting.`));
	      process.exit();
	    } else if (fse.existsSync(i) === true) {
	      console.log(chalk.yellow(`${i} already exists! Aborting.`));
	      process.exit();
	    // originalDir doesn't exist
	    } else if (fse.existsSync(oldTarget) === false) {
	      console.log(chalk.yellow(`${originalDir} doesn't exist! Aborting.`));
	      process.exit();
	    } else {
				try {
	        fse.copySync(oldPath, i);
	        console.log(chalk.yellow('Files copied!'));
	      } catch (err) {
	        console.error(err);
	      }
			}
		});
  }

  renameNameSpace() {
		let x;
		target.forEach( i => {
			fse.readdir(i, (err, files) => {
	      // ensure that hidden files are not considered
	      files = files.filter(item => !(regex).test(item));
	      files.forEach((file) => {
	        x = `${i}/${file}`;
	        fse.rename(x, x.replace(originalNamespace, newNamespace), (err) => {
	          if (err) {
	            throw err;
	          }
	        });
	      });
	      console.log(chalk.yellow('Files renamed!'));
	    });
		});
  }


  renameSuffix() {
    setTimeout(() => {
			// for each new complete directory (e.g. ...jc-01/ ...jc-02/ )
			target.forEach( i => {
				// is this timeout necessary ?
				fse.readdir(i, (err, files) => {
					// skip hidden files
				  files = files.filter(item => !(regex).test(item));
					// log path, files
					console.log(i, files);
						// valueToArray.forEach(k => {
						// 	fse.rename(files, files.replace(k.substring(0, 5), k), (err) => {
						// 	  if (err) {
						// 	    throw err;
						// 	  }
						// 	});
						// });
				});
			});
    }, 20);
  }

};

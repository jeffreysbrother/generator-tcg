# This is a work in progress!

come back later...

Still need:

* all newly-generated files still need to be renamed with the new namespace.
* check if namespaced dir already exists, check which subfolders already exist and create the appropriate one (numerically speaking)
* rename .jsrc to .js? But sometimes both files exist!
  * if .jsrc and .js exist OR if only .js exists, do nothing.
  * if only .jsrc exists, convert to .js.
  * if neither exist, print a message: "No JSRC or JS files exist!"
* find a way to convert .jsrc file contents to ES6!
  * maybe there's an existing npm package for this
* probably want to assume that all commands will be run from the funnel/ directory

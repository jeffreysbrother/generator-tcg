# Generator-TCG

A command line utility for The Control Group split testing team. An existing directory (the default variation) is cloned and renamed with the desired prefix and suffix. The new files will then serve as a variation against which the control will be tested.

This tool assumes that the user will navigate to the `funnel/` directory before running any commands.

### How to Use:

When the command "yo tcg" is executed, the user must answer three questions. Here's an example of how one might answer:

* **What section are you working on?** [report-review]
* **Which directory do you wish to copy?** [ga-33]
* **What would you like to call it?** [jc-01]

The answers above will result in `ga/ga-33` (the folders and all files within) being duplicated and renamed to `jc/jc-01`. The parent directories ("ga" and "jc") are derived from "ga-33" and "jc-01", respectively, by grabbing the part of the string that precedes the hyphen. This is TCG's current naming convention, so as long as this remains in place, there should be no problems.

### Existing Features:

* The default variation is cloned into the appropriate directory/sub-directory (which is created if it doesn't yet exist) and all files are renamed according to the desired namespace and suffix.
* Hidden files are prevented from being copied and renamed (.DS_Store, for example).
* Cloning is prevented when the subdirectory already exists.
* Validation for user input
* The user is alerted when she attempts to copy a directory that does not exist.

### Future Features:

[] Create the appropriate subdirectory dynamically (numerically speaking). This would prevent us from having to input the desired suffix manually because it would find the subdirectory with the highest numerical value and then rename the duplicated directory (and the files within) with the **next** numerical value. If the most recent file name is `jc-44.js`, the program will create `jc-45.js`.
[] Allow for modification of the current working directory (with the default being "funnel")
[] Find a way to eliminate `setTimeout()`.
[] Maybe make validation messages more explicit (more direction for user)

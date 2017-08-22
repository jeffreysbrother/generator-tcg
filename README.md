# Generator-TCG

A command line utility for The Control Group split testing team. An existing directory (the default variation) is cloned and renamed according to a pre-established convention. The new files will then serve as a variation against which the control will be tested.

This tool assumes that the user will navigate to the `funnel/` directory before running any commands. Another assumption is that a `config.json` file exists in the `funnel/` directory. The purpose of this file is to specify the developer's initials; it should look something like this:

```
{
  "developer": "jc"
}
```

Please keep in mind that the utility of this tool is very dependent upon your directory structure; if the following structure is not realized, the damn thing probably won't do you any good at all:

```
funnel
└── source
    └── sections
        ├── home
        │   ├── ga
        │   │   └── ga-01
        │   │       ├── ga-01.js
        │   │       ├── ga-01.less
        │   │       └── ga-01.php
        │   └── bm
        │       └── bm-01
        │           ├── bm-01.js
        │           ├── bm-01.less
        │           └── bm-01.php
        └── report-review
            ├── ga
            │   ├── ga-01
            │   │   ├── ga-01.js
            │   │   ├── ga-01.less
            │   │   └── ga-01.php
            │   └── ga-02
            │       ├── ga-02.js
            │       ├── ga-02.less
            │       └── ga-02.php
            └── jc
                └── jc-01
                    ├── jc-01.js
                    ├── jc-01.less
                    └── jc-01.php
```

## Installation:

`npm install --global yo generator-tcg`

## How to Use:

When the command "yo tcg" is executed, the user must answer three questions. Here's an example of how one might answer:

* **What section are you working on?**  report-review
* **Which directory do you wish to copy?**  ga-33
* **How many variations would you like?**  1
* **Please enter a short branch description:**  nav

The answers above will result in `ga/ga-33` (the folders and all files within) being duplicated and renamed to `jc/jc-02` (since in the above example, `jc-02` immediately follows `jc-01`, numerically). TCG's current naming convention is enforced: user's initials (two letters), a hyphen, and 2-3 numbers. The numeric portion of the name will have left padding when the value is less than 10 (`jc-01` rather than `jc-1`).

The generator will then checkout a new branch `ga_report-review_nav`, stage all changes, commit them, and push (setting the upstream to the newly-created branch).

## Existing Features:

* The default variation is cloned into the appropriate directory/sub-directory (which is created if it doesn't yet exist) and all files are renamed according to whatever files already exist in the target directory (suffixes are incremented numerically).
* Developer initials are retrieved from `funnel/config.json`. This is used to rename the duplicated files and folders.
* Hidden files are prevented from being copied and renamed (.DS_Store, for example).
* User input validation.
* Maximum number of variations is set to 10 (in order to prevent a huge number of files being created inadvertently).
* Handle necessary Git commands to push a new branch to the remote, ensuring that the new branch doesn't already exist locally.

## Future Features:

- [x] Give user the ability to copy multiple directories.
- [x] Find a way to eliminate `setTimeout()`.
- [x] Create the appropriate subdirectory dynamically (numerically speaking). This would prevent us from having to input the desired suffix manually because it would find the subdirectory with the highest numerical value and then rename the duplicated directory (and the files within) with the **next** numerical value. If the most recent file name is `jc-44.js`, the program will create `jc-45.js`. We could ask the user "How many variations?" instead of expecting them to type the variation names manually. Adam also suggested that we retrieve the developer initials from the config file.
- [x] Allow the generator to also handle the necessary Git commands: checkout new branch, stage changes, commit with message "copied [default variation]", and push. This could be optional functionality (possibly selected as an option in the prompt, or maybe overridden with an additional flag such as "--no-git").
- [ ] Might want to add the ability to check if REMOTE branch exists.
- [ ] Write to each file, adding a comment denoting which variation was copied.

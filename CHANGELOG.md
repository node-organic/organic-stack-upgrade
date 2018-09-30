# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [2.0.0] - 2018-09-20

## breaking

* removed helper methods `configureAndMerge` and `configureMergeAndUpdateJSON`
* `configure` supports `sourceDirs` **only**

## additions

* `destSubDir` added to `merge` method
* `ask` method
* StackUpgrade constructor supports auto version and naming via providing path to existing package.json to read values from
* test coverage stats

## changes

* `merge` will auto-JSON.stringify provided answers if they are objects/arrays, strings and numbers are left unmodified.

## [1.3.0] - 2018-05-08

## changes

* will throw error when doing deep merge over non .json or gitignore files which
exists in respective destination

## additions

* added `forceOverride` option to force overriding of non .json or gitignore files

## [1.2.0] - 2018-04-11

### fixes and additions

* `gitignore` files are also processed as `.gitignore` and written with that name. This actually fixes https://github.com/npm/npm/issues/3763

## [1.1.1] - 2018-04-07

### fixes

* add missing `semver` dep

## [1.1.0] - 2018-04-06

### additions

* StackUpgrade.checkUpgrade(upgradeName, upgradeVersionRange)
* StackUpgrade.exec(cmd)

### changes

* updated README

## [1.0.1] - 2018-03-30

### fixes

* placeholders collection without duplicates


## [1.0.0] - 2018-03-30

Initial version release

# organic-stack-upgrade

lib for upgrading organic stem skeletons

## usage

```
let stack = new StackUpgrade({
  destDir: process.cwd(),
  name: 'myStack',
  version: '1.0.0'
})
let answers = await stack.configure({sourceDir: __dirname})
await stack.merge({sourceDir: __dirname, answers})
await stack.updateJSON()
```

## StackUpgrade class

### constructor({destDir, name, version})

Constructs class instance with `destDir`, `name` and `version` properties

### configure({sourceDir, answers}): result_answers

Configures stack upgrade. This method does the following:

1. globs in `sourceDir` for any
placeholders such as `{{{variable-name}}}` within file contents or file/directory paths
2. uses `answers` hash to provide values for found placeholders
3. prompts the user via `inquirer` to provide any missing answers to placeholders found from step 1
4. returns all placeholders with their respective answer values as `result_answers` hash

### merge({sourceDir, answers})

Merges stack upgrade into `destDir`. This method does the following:

1. globs in `sourceDir` for all files and folders and replaces any placeholders such as `{{{variable-name}}}` in all
file/directory path or file contents
2. writes resulted files and directories do the `destDir` by using the following merge strategies:
  * for `.json` files it does deep object merge and overrides existing keys
  * for `.gitignore` files it reconstructs the file by appending to the using existing file the content provided from `sourceDir`. It eliminates duplicated lines
  * for all other files it just overrides

### updateJSON()

Updates `<destDir>/package.json` by adding stack upgrade `name` and `version` within `stackUpgrades` key. This is useful way to record that given stack upgrade by name/version has been applied to the `destDir`

### configureAndMerge({sourceDir, answers})

A shorthand method which does:

1. configure
2. merge

### configureMergeAndUpdateJSON({sourceDir, answers})


A shorthand method which does:

1. configure
2. merge
3. updateJSON

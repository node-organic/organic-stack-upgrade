# organic-stack-upgrade

lib for upgrading organic stem skeletons

## StackUpgrade class

### constructor({destDir, name, version})

Constructs class instance with `destDir`, `name` and `version` properties

```
let stack = new StackUpgrade({
  destDir: process.cwd(),
  name: 'myStack',
  version: '1.0.0'
})
```

### constructor({destDir, packagejson})

Constructs class instance with `destDir` property. Fills `name` and `version` properties by reading `packagejson` as .json file

```
let stack = new StackUpgrade({
  destDir: process.cwd(),
  packagejson: __dirname + '/package.json'
})
```

### async configure({sourceDir, answers}): result_answers

Configures stack upgrade. This method does the following:

1. globs in `sourceDir` for any
placeholders such as `{{{variable-name}}}` within file contents or file/directory paths
2. uses `answers` hash to provide values for found placeholders
3. prompts the user via `inquirer` to provide any missing answers to placeholders found from step 1
4. returns all placeholders with their respective answer values as `result_answers` hash

```
let stack = new StackUpgrade(...)
let answers = await stack.configure({
  sourceDir: path.join(__dirname, 'seedTemplateFolder')
})

// `answers` will be a hash with provided answers to 
// any placeholders been found within `seedTemplateFolder`
```

### async merge({sourceDir, answers})

Merges stack upgrade into `destDir`. This method does the following:

1. globs in `sourceDir` for all files and folders and replaces any placeholders such as `{{{variable-name}}}` in all
file/directory path or file contents
2. writes resulted files and directories do the `destDir` by using the following merge strategies:
  * for `.json` files it does deep object merge and overrides existing keys
  * for `.gitignore` files it reconstructs the file by appending to the using existing file the content provided from `sourceDir`. It eliminates duplicated lines
  * for `gitignore` files it outputs `.gitignore` following the same rules as previous point
  * for all other files it just overrides

```
let stack = new StackUpgrade({
  destDir: ...,
  ...
})
await stack.merge({
  sourceDir: path.join(__dirname, 'seedTemplateFolder'),
  answers: {...}
})

// will merge `seedTemplateFolder` into `destDir`
// replacing any placeholders been found with provided `answers` hash
```

### async updateJSON()

Updates `<destDir>/package.json` by adding stack upgrade `name` and `version` within `stackUpgrades` key. This is useful way to record that given stack upgrade by name/version has been applied to the `destDir`

```
let stack = new StackUpgrade({
  destDir: process.cwd(),
  name: "my-upgrade",
  version: "1.0.1"
})
stack.updateJSON()

// will create or append the following to destDir/package.json
/*
{
  "stackUpgrades": {
    "my-upgrade": "1.0.1"
  }
}
*/
```

### async checkUpgrade(name, version): Boolean

Checks `<destDir>/package.json` for specific `stackUpgrades` key matching `name` having respective `version` compared via [compare-versions](https://www.npmjs.com/package/compare-versions)

Returns `true` when respective `version` is equal or greater than destination's

```
let stack = new StackUpgrade({
  destDir: process.cwd()
})

stack.checkUpgrade('my-upgrade', '^1.0.0') 

// returns 'true' when destDir has package.json like
/*
{
  "stackUpgrades": {
    "my-upgrade": "1.0.0"
  }
}
*/
```

### async exec(cmd)

Helper method to execute `cmd` on `destDir` and to pipe the output to `console`. Note that `destDir` is created if not exists.

```
let stack = new StackUpgrade({
  destDir: process.cwd()
})

stack.exec('echo TEST')
// will execute `echo TEST` command witin `destDir` 
// inheriting any process env variables
```

### async ensureDestDir()

Helper method to create destination directory if not found

### async ask(question, defaultValue) 

Helper method to use `inquirer` prompt and return the resulted answer

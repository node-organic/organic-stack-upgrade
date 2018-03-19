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

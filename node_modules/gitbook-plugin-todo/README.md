# gitbook-plugin-todo

[![Build Status](https://travis-ci.org/LingyuCoder/gitbook-plugin-todo.png)](https://travis-ci.org/LingyuCoder/gitbook-plugin-todo)
[![Dependency Status](https://david-dm.org/LingyuCoder/gitbook-plugin-todo.svg)](https://david-dm.org/LingyuCoder/gitbook-plugin-todo)
[![devDependency Status](https://david-dm.org/LingyuCoder/gitbook-plugin-todo/dev-status.svg)](https://david-dm.org/LingyuCoder/gitbook-plugin-todo#info=devDependencies)
[![NPM version](http://img.shields.io/npm/v/gitbook-plugin-todo.svg?style=flat-square)](http://npmjs.org/package/gitbook-plugin-todo)
[![node](https://img.shields.io/badge/node.js-%3E=_0.12-green.svg?style=flat-square)](http://nodejs.org/download/)
[![License](http://img.shields.io/npm/l/gitbook-plugin-todo.svg?style=flat-square)](LICENSE)
[![npm download](https://img.shields.io/npm/dm/gitbook-plugin-todo.svg?style=flat-square)](https://npmjs.org/package/gitbook-plugin-todo)

**Embed readonly todo list into your Gitbook**

[DEMO](http://read.lingyu.wang/index.html)

## Install

```shell
$ npm install --save gitbook-plugin-todo
```

## Usage

Add the plugin to your `book.json` like this:

```javascript
{
    "plugins": ["todo"]
}
```

then in your markdown file, you can embed readonly todo list like this:


```markdown
- [ ] write some articles
- [x] drink a cup of tea
```

## License
The MIT License (MIT)

Copyright (c) 2015 Lingyu Wang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

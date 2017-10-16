# Language Map

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/blakeembrey/language-map.svg)](https://greenkeeper.io/)

JSON map of programming languages to meta data. Converted from GitHub's [Linguist YAML file](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml).

**Useful Properties:**

* `type` - Either data, programming, markup, or undefined
* `aliases` - An array of additional lowercased aliases
* `filenames` - An array of filenames associated with the language
* `extensions` - An array of associated extensions
* `interpreters` - An array of associated interpreters

**GitHub Specific Properties:**

* `wrap` - Boolean flag to enable line wrapping
* `color` - CSS hex color to represent the language
* `group` - Associated language grouping
* `aceMode` - A string name of the ace mode
* `searchable` - Boolean flag to enable searching
* `searchTerm` - Deprecated: Some languages maybe indexed under a different alias

## Installation

```
npm install language-map --save
```

## Usage

```javascript
var map = require('language-map')

console.log(map["JavaScript"])
//=> { type: 'programming', aceMode: 'javascript', color: '#f15501', ... }
```

## License

MIT

```
Copyright (c) 2011-2014 GitHub, Inc.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
```

[npm-image]: https://img.shields.io/npm/v/language-map.svg?style=flat
[npm-url]: https://npmjs.org/package/language-map
[downloads-image]: https://img.shields.io/npm/dm/language-map.svg?style=flat
[downloads-url]: https://npmjs.org/package/language-map
[travis-image]: https://img.shields.io/travis/blakeembrey/language-map.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/language-map
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/language-map.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/language-map?branch=master

# gitbook-plugin-include-codeblock [![Build Status](https://travis-ci.org/azu/gitbook-plugin-include-codeblock.svg?branch=master)](https://travis-ci.org/azu/gitbook-plugin-include-codeblock)

GitBook Plugin for including file.


1. [Installation](#installation)
2. [Plugin options](#plugin-options)
3. [Usage](#usage)


## Installation

book.json

```json
{
  "plugins": [
    "include-codeblock"
  ]
}
```

and

```sh
gitbook install
```

## Plugin options

Several options can be set in `book.json` to customize the plugin.

| option | value | Description |
| --- | --- | --- |
| `template` | `{"default","full","ace",...}` or custom path | reindent code if marker or slice is used |
| `unindent` | `{true,false}` default:`false` | reindent code if marker or slice is used |
| `fixlang` | `{true,false}` default:`false` | fix some errors with code lang (e.g C++, ...) |
| `lang` | `{"c_cpp","javascript", ...}` | lang color syntax (not set => auto deduce, see [lang section](#hardcoded-class)). |
| `edit` | `{true,false}` | [allow edit code](https://github.com/ymcatar/gitbook-plugin-ace/blob/master/README.md) (**ace template required**) |
| `check` | `{true,false}` | [syntax validation](https://github.com/ymcatar/gitbook-plugin-ace/blob/master/README.md) (**ace template required**) |
| `theme` | `{"monokai","coffee",...}` | [check syntax](https://github.com/ymcatar/gitbook-plugin-ace/blob/master/README.md) (**ace template required**) |

Just add the desired optin under `pluginConfig` in the `book.json` file

```js
{
    "gitbook": "3.x.x",
    "pluginsConfig": {
        "include-codeblock": {
            "template": "ace",
            "unindent": true,
            "theme": "monokai"
        }
    }
}
```

### Templates

Templates let customize the rendered code. Several default templates are available

| template | description |
| --- | --- |
| `"default"` | default template, standard markdown code style |
| `"full"` | enable title, labeling, id, ... |
| `"ace"` | enable ace code rendering (**ace plugin required**) |
| `"acefull"` | enable ace code rendering with title, label, id, ... (**ace plugin required**) |

- :information_source: For ace template, see [Ace section](#ace-plugin)
- :information_source: For more template, consult the list in [template/](templates/).

Custom templates can be created to render the code by specifying a custom path
to the template file.
```js
{
    "gitbook": "3.x.x",
    "pluginsConfig": {
        "include-codeblock": {
            "template": __dirname + "/" + "path/to/custom.hbs",
        }
    }
}
```
See [templates/](templates/) and [examples/](examples/) for details.

Any contribution is welcome. Propose your new templates via pull-requests.

### Ace plugin

It is possible to use the gitbook ace plugin to have code numbering or custom themes
(See [gitbook-ace-plugin](https://github.com/ymcatar/gitbook-plugin-ace) for more details).
To use ace within include-codeblock, you have to **load the ace plugin after include-codeblock!**
and choose an ace temple (see [templates/](templates/))

```js
{
    "gitbook": "3.x.x",
    "plugins" : [
        "include-codeblock",
        "ace"
    ]
    "pluginsConfig": {
        "include-codeblock": {
            "template": "ace", // or acefull
        }
    }
}
```

## Usage


#### General usage:

```
[import:"tag",option0:"value0", ...](url/or/path/to/file)
```

where `<...>` are required tags, `<<...>>` are optional tags.

| tag               | description |
| --- | --- |
| `import`  | use `import` or `include` tag. |
| `tag` | optional tag to include code snippet (see [snippet](#snippet-code). |
| `optionX` |  optional `key:value` or `key=value` option (See [Command options](#command-options)). |

See [examples](#examples) for more details.

#### Examples

**fixtures/test.js**
```js
console.log("test");
```

Write following the link with `include` or `import` label.

```markdown
[include](fixtures/test.js)
```

or

```markdown
[import](fixtures/test.js)
```
Result

``` js
console.log("test");
```

:information_source: Do not inline!
``` js
// won't work
Example of code [import](fixtures/test.js)
```

You could import the same code directly from the repository with nice color template
```markdown
[import, template:"acefull", title:"example of code", theme:"monokai"](https://raw.githubusercontent.com/azu/gitbook-plugin-include-codeblock/master/test/fixtures/test.js)
```


### Command options

Option can be passed locally and may depend on the template your are using.

| option | value | Description |
| --- | --- | --- |
| `unindent` | `{"true","false"}` | reindent code if marker or slice is used |
| `title`| `"<your title>"` | Title for the code **full template required**|
| `name` | `"<your_filename>"` | name of the included file  **full template required** |
| `class` | `"<your_classname>"` | html class for the title  **full template required** |
| `id` | `"<your_id>"` | hmlt class for custom style **full template required** |
| `label` | `"<your_ref_label>"` | reference label (latex like) **full template required** |
| `edit` | `{"true","false"}` | allow edit code (**ace template required**) |
| `check` | `{"true","false"}` | check syntax (**ace template required**) |
| `template` | `{default,full,ace,...}` or custom path | reindent code if marker or slice is used |
| `lang` | `{"c_cpp","javascript", ...}` | lang color syntax (not set => auto deduce, see [lang section](#hardcoded-class)). |
| `fixlang` | `{true,false}` default:`false` | fix some errors with code lang (e.g C++, ...) |
| `theme` | `{"monokai","coffee",...}` | check syntax (**ace template required**) |

For more details see sections below.


### Hardcoded class

When you import a TypeScript file `.ts`:
The parser correctly finds `.ts` in the
[language-map](https://github.com/blakeembrey/language-map "language-map")
extensions for both TypeScript and XML, then automatically chooses `XML`.

If you want to specify language type, put `lang:"<lang-name>"` to label.

```markdown
[import, lang:"typescript"](hello-world.ts)
```

- :information_source: choose `<lang-name>` of `lang-<lang-name>` from language-map's `aceMode` value.
    - [blakeembrey/language-map: JSON version of the programming language map used in Linguist](https://github.com/blakeembrey/language-map "blakeembrey/language-map: JSON version of the programming language map used in Linguist")

e.g.) typescript's aceMode value is `typescript`.

- https://github.com/blakeembrey/language-map/blob/b72edb8c2cb1b05d098782aa85dd2f573ed96ba3/languages.json#L4140


### Sliced Code

If you want to slice imported code and show.

```markdown
[import:<start-lineNumber>-<end-lineNumber>](path/to/file)
```

- :information_source: lineNumber start with 1.

All Patterns:

```
All: [import, hello-world.js](../src/hello-world.js)
1-2: [import:1-2, hello-world.js](../src/hello-world.js)
2-3: [import:2-3, hello-world.js](../src/hello-world.js)
2>=: [import:2-, hello-world.js](../src/hello-world.js)
<=3: [import:-3, hello-world.js](../src/hello-world.js)
```

### Snippet code

You can also import snippet code delimited by a tag. It follows the
[doxygen snippet standard](https://www.stack.nl/~dimitri/doxygen/manual/commands.html#cmdsnippet)
Snippet is doxygen compatible.
(See also [how to document the code](https://www.stack.nl/~dimitri/doxygen/manual/docblocks.html))

```markdown
[import:'<marker0,marker1,...>'](path/to/file)
```

#### Remarks
- :information_source: **marker name** begins with an alphabet character
- :information_source: tags follows the doxygen standard: **language comment for documenting code** + **tag between bracket**
- :information_source: Several markers separated by a comma will concatene snippets into a unique snippet. Spaces are taken into account.

For example, considering the following C++ source code

```cpp
// test.cpp source code
int main()
{
    /// [marker0]
    int a;
    //! [marker1]
    int b;
    //! [marker1]
    int c;
    /// [marker0]

    // [notmarked]
    int d;
    // [notmarked]

    //! [marker2]
    int e;
    //! [marker2]
}

```
In GitBook, the following commands

```markdown
[import:'marker1'](path/to/test.cpp)
```

will result to

```cpp
    int b;
```

The command `[import:'marker0'](path/to/test.cpp)` will result to

```cpp
    int a;
    int b;
    int c;
```

The command `[import:'marker1,marker2'](path/to/test.cpp)` will result to
```cpp
    int b; 
    int e;
```

But the command `[import:'notmarked'](path/to/test.cpp)` will fail as it
does not respect the doxygen documenting standard.
(See [documenting the code](https://www.stack.nl/~dimitri/doxygen/manual/docblocks.html))

### Unindented code

Consider the following source code:

```java
class Hello {
    /// [some-marker]
    void world() {
        // nice
    }
    /// [some-marker]
}
```

And the following command:

```
[import:"some-marker",unindent:"true"](path/to/test.java)
```

This will result in unindented code:

```java
void world() {
    // nice
}
```

Unindent behaviour can also be specified globally in the plugin configuration.

## Example

Please See [examples/](examples/).

[![screenshot](https://monosnap.com/file/ydUDWzqXtC2bvPPBmqtplldO8l2QJK.png)](example/)

## FAQ

### How to migrate Version 1.x to 2.x

Version 2.0 contain a breaking change.

- [Breaking Change: change default template by azu · Pull Request #31 · azu/gitbook-plugin-include-codeblock](https://github.com/azu/gitbook-plugin-include-codeblock/pull/31 "Breaking Change: change default template by azu · Pull Request #31 · azu/gitbook-plugin-include-codeblock")

It change default template for displaying embed code.

Version 1.x template.

    {{#if title}}
    {{#if id}}
    {% if file.type=="asciidoc" %}
    > [[{{id}}]]link:{{originalPath}}[{{title}}]
    {% else %}
    > <a id="{{id}}" href="{{originalPath}}">{{title}}</a>
    {% endif %}
    {{else}}
    {% if file.type=="asciidoc" %}
    > [[{{title}}]]link:{{originalPath}}[{{title}}]
    {% else %}
    > <a id="{{title}}" href="{{originalPath}}">{{title}}</a>
    {% endif %}
    {{/if}}
    {{else}}
    {% if file.type=="asciidoc" %}
    > [[{{fileName}}]]link:{{originalPath}}[{{fileName}}]
    {% else %}
    > <a id="{{fileName}}" href="{{originalPath}}">{{fileName}}</a>
    {% endif %}
    {{/if}}

    ``` {{lang}}
    {{{content}}}
    ```

Version 2.x template.

    ``` {{lang}}
    {{{content}}}
    ```

If you want to use Version 1.x template, please set `template` option to `book.json` or `book.js`

```js
const fs = require("fs");
module.exports = {
    "gitbook": "3.x.x",
    "title": "gitbook-plugin-include-codeblock example",
    "plugins": [
        "include-codeblock"
    ],
    "pluginsConfig": {
        "include-codeblock": {
            // Before, create user-template.hbs
            "template": fs.readFileSync(__dirname + "/user-template.hbs", "utf-8")
        }
    }
};
```

If you want to know more details, please see [templates/](templates/).

## Tests

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT

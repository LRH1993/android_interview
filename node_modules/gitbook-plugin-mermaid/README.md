## Mermaid plugin for GitBook 
[![Build Status](https://travis-ci.org/JozoVilcek/gitbook-plugin-mermaid.svg?branch=master)](https://travis-ci.org/JozoVilcek/gitbook-plugin-mermaid)
[![NPM version](https://badge.fury.io/js/gitbook-plugin-mermaid.svg)](http://badge.fury.io/js/gitbook-plugin-mermaid)

Plugin for [GitBook](https://github.com/GitbookIO/gitbook) which renders [Mermaid](https://github.com/knsv/mermaid) diagrams and flow charts detected in the book markdown.

### How to install it?

You can use install via **NPM**:

```
$ npm install gitbook-plugin-mermaid
```

And use it for your book with in the book.json:

```
{
    "plugins": ["mermaid"]
}
```

### How to use it?

There are two options how can be graph put into the gitbook.
To use ~~embedded~~ graph, put in your book block as:
```
{% mermaid %}
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;
{% endmermaid %}
```
Plugin will pick up block body and replace it with generated svg diagram.
To load graph ~~from file~~, put in your book block as:
```
{% mermaid src="./diagram.mermaid" %}
{% endmermaid %}
```
If not absolute, plugin will resolve path given in `src` attribute relative to the current book page, 
load its content and generate svg diagram.

# Template

- Should remove space each line
- `{{` and `}}` is GitBook template
    - [Templating · GitBook Toolchain Documentation](http://toolchain.gitbook.com/templating/)
- `{%` and `%}` is handlebar template
    - [Handlebars.js: Minimal Templating on Steroids](http://handlebarsjs.com/)

## Values

- `{{lang}}`: language for highlight
- `{{{content}}}`: Code
- `{{originalPath}}`: file path
- `{{fileName}}`: file name
- `{{count}}` : number of CodeBlock
- `{{title}}`: if label contain `title:` like this `[import, title:<value>]`
- `{{id}}`: if label contain `id:` like this `[import, id:<value>]`
- `{{class}}`: if label contain `class:` like this `[import, class:<value>]`

### ace plugin specific

- {{edit}} : allow code edition
- {{check}} : allow syntax validation
- {{theme}} : label for the theme

## Limitation

You should write with no space(indent).
Spacing conflict GitBook behavior.

## Template Example

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

### Compile Example

If use version 1.x template

    [import](test.rs)
    
to be
    
    {% if file.type=="asciidoc" %}
    > [[test.rs]]link:test.rs[test.rs]
    {% else %}
    > <a id="test.rs" href="test.rs">test.rs</a>
    {% endif %}
    
    ``` rust
    extern crate num;
    ```

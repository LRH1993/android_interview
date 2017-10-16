/**
 * 本插件修改源插件的功能：综合修复了原有的bug和兼容性
 * 1. 基于 https://github.com/zhangzq/gitbook-plugin-navigator
 * 2. 基于 https://github.com/yaneryou/gitbook-plugin-anchor-navigation
 * 3. 修复 bug ：gitbook-plugin-anchor-navigation 不正常显示
 * 4. 该插件依赖 https://plugins.gitbook.com/plugin/anchors 插件，所以 anchors 插件的必须在本插件之前
 */
var cheerio = require('cheerio');
var slug = require('github-slugid');

/**
 * 处理默认参数
 * @param defaultOption
 * @param configOption
 */
function handlerOption(defaultOption, configOption) {
    if (configOption) {
        for (var item in defaultOption) {
            if (item in configOption) {
                defaultOption[item] = configOption[item];
            }
        }
    }
}

/**
 * 处理toc相关，同时处理标题和id
 * @param $
 * @param option
 * @param section
 * @returns {Array} 返回处理好的tocs合集
 */
function handlerTocs($, option, section) {
    var tocs = [];
    var count = {
        h1: 0,
        h2: 0,
        h3: 0
    }
    var h1 = 0, h2 = 0, h3 = 0;
    $(':header').each(function (i, elem) {
        var header = $(elem);
        var id = header.attr('id');
        if (!id) {
            id = slug(header.text());
            header.attr("id", id);
        }

        // console.log('header = ' + header);
        if (id) {
            switch (elem.tagName) {
                case "h1":
                    handlerH1Toc(option, count, header, tocs);
                    break;
                case "h2":
                    handlerH2Toc(option, count, header, tocs);
                    break;
                case "h3":
                    handlerH3Toc(option, count, header, tocs);
                    break;
                default:
                    handlerTitle(option, header, id, header.text());
                    break;
            }
        }
    });
    return tocs;
}

/**
 * 辅助处理标题，默认增加锚点效果
 * @param option
 * @param id
 * @param title
 */
function handlerTitle(option, header, id, title) {
    header.text(title);
    header.prepend('<a name="' + id + '" class="anchor-navigation-ex-anchor" '
        + 'href="#' + id + '">'
        + '<i class="fa fa-link" aria-hidden="true"></i>'
        + '</a>');
}

/**
 * 处理h1
 * @param count 计数器
 * @param header
 * @param tocs 根节点
 */
function handlerH1Toc(option, count, header, tocs) {
    var title = header.text();
    var id = header.attr('id');
    if (option.isRewritePageTitle) {
        count.h1 = count.h1 + 1;
        count.h2 = 0;
        count.h3 = 0;
        title = count.h1 + ". " + title;
    }
    handlerTitle(option, header, id, title);
    tocs.push({
        name: title,
        url: id,
        children: []
    });
}
/**
 * 处理h2
 * @param count 计数器
 * @param header
 */
function handlerH2Toc(option, count, header, tocs) {
    var title = header.text();
    var id = header.attr('id');
    if (tocs.length <= 0) {
        handlerTitle(option, header, id, title);
        return;
    }
    var h1Index = tocs.length - 1;
    var h1Toc = tocs[h1Index];
    if (option.isRewritePageTitle) {
        count.h2 = count.h2 + 1;
        count.h3 = 0;
        title = (count.h1 + '.' + count.h2 + ". " + title);
    }
    handlerTitle(option, header, id, title);
    h1Toc.children.push({
        name: title,
        url: id,
        children: []
    });
}
/**
 * 处理h3
 * @param count 计数器
 * @param header
 */
function handlerH3Toc(option, count, header, tocs) {
    var title = header.text();
    var id = header.attr('id');
    if (tocs.length <= 0) {
        handlerTitle(option, header, id, title);
        return;
    }
    var h1Index = tocs.length - 1;
    var h1Toc = tocs[h1Index];
    var h2Tocs = h1Toc.children;
    if (h2Tocs.length <= 0) {
        handlerTitle(option, header, id, title);
        return;
    }
    var h2Toc = h1Toc.children[h2Tocs.length - 1];
    if (option.isRewritePageTitle) {
        count.h3 = count.h3 + 1;
        title = (count.h1 + "." + count.h2 + "." + count.h3 + ". " + title);
    }
    handlerTitle(option, header, id, title);
    h2Toc.children.push({
        name: title,
        url: id,
        children: []
    });
}

/**
 * 拼接锚点导航html，并添加到html末尾，利用css 悬浮
 * @param option
 * @param tocs
 * @param section
 */
function handlerAnchorsNavbar($, option, tocs, section) {
    var html = "<div id='anchor-navigation-ex-navbar'><i class='fa fa-anchor'></i><ul>";
    if (tocs.length <= 0) {
        return;
    }
    for (var i = 0; i < tocs.length; i++) {
        html += "<li><a href='#" + tocs[i].url + "'>" + tocs[i].name + "</a></li>";
        if (tocs[i].children.length > 0) {
            html += "<ul>"
            for (var j = 0; j < tocs[i].children.length; j++) {
                html += "<li><a href='#" + tocs[i].children[j].url + "'>" + tocs[i].children[j].name + "</a></li>";
                if (tocs[i].children[j].children.length > 0) {
                    html += "<ul>";
                    for (var k = 0; k < tocs[i].children[j].children.length; k++) {
                        html += "<li><a href='#" + tocs[i].children[j].children[k].url + "'>" + tocs[i].children[j].children[k].name + "</a></li>";
                    }
                    html += "</ul>";
                }
            }
            html += "</ul>"
        }
    }

    html += "</ul></div><a href='#" + tocs[0].url + "' id='anchorNavigationExGoTop'><i class='fa fa-arrow-up'></i></a>";

    section.content = html + $.html();
}

function start(bookIns, page) {
    const defaultOption = {
        //是否重写页面标题，true:将会覆盖anchors插件锚点效果
        isRewritePageTitle: true
    }
    /**
     * [configOption: config option]
     * @type {Object}
     */
    var configOption = bookIns.config.get('pluginsConfig')['anchor-navigation-ex'];
    // 处理配置参数
    handlerOption(defaultOption, configOption);
    var $ = cheerio.load(page.content);
    // 处理toc相关，同时处理标题和id
    var tocs = handlerTocs($, defaultOption, page);
    // 设置处理之后的内容
    if (tocs.length == 0) {
        page.content = $.html();
        return page;
    }
    //拼接锚点导航html，并添加到html末尾，利用css 悬浮
    handlerAnchorsNavbar($, defaultOption, tocs, page);
}

module.exports = start;

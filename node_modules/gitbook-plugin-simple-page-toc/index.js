var toc = require('markdown-toc');

module.exports = {
	hooks: {
			"page:before": function (page) 
			{
				var _maxDepth = 3;
				var _skipFirstH1 = true;

				var config = this.config.values.pluginsConfig["simple-page-toc"];

				if (config)
				{
					_maxDepth = config.maxDepth ? config.maxDepth : _maxDepth;
					_skipFirstH1 = config.skipFirstH1 ? config.skipFirstH1 : _skipFirstH1;
				};
				
				page.content = toc.insert(page.content, {
					maxdepth: _maxDepth,
					firsth1: _skipFirstH1
				});
				
				return page;
			}
    }
};
(function ($) {
	$.fn.toc = function (options) {
		var defaults = {
			status: false,
			selectors: 'h1, h2, h3',
			container: $('body'),
			placeholder: 'Empty',
			listTag: 'ol',
			onOpen: function () {},
			onClose: function () {}
		};

		var settings = $.extend({}, defaults, options);

		var $btn = this,
			$container = settings.container,
			selectors = settings.selectors,
			listTag = '<' + settings.listTag + '/>';

		if (settings.status) {
			openToc();
		}

		$btn.on('click', function () {
			if (settings.status) {
				closeToc();
			} else {
				openToc();
			}
		});

		function openToc() {
			var tocItems = [],
				j = 1,
				list = [$(listTag)];

			$container
				.find(selectors)
				.each(function (i, item) {
					var index = item.id || 'toc-' + j++,
						text = $('<div/>').text(item.textContent.trim()).html(),
						tagName = item.tagName.toLowerCase();

					if (item.id != index) {
						$(item).data('toc-id', true);
						item.id = index;
					}

					tocItems.push({
						index: index,
						text: text,
						tagName: tagName
					});
				});

			if (tocItems.length) {
				var selectorsArr = selectors.split(','),
					currentLevel = 0;

				$.each(tocItems, function (i, item) {
					var level = $.map(selectorsArr, function (selector, j) {
						return item.tagName === selector.trim() ? j : undefined;
					})[0];

					if (level > currentLevel) {
						var parentLi = list[0].children('li:last')[0];

						if (parentLi) {
							list.unshift($(listTag).appendTo(parentLi));
						}
					} else {
						list.splice(0, Math.min(currentLevel - level, Math.max(list.length - 1, 0)));
					}

					list[0].append('<li><a href="#' + item.index + '">' + item.text + '</a></li>');
					$('#' + item.index).prepend('<a class="post-headline-link" href="#' + item.index + '">#</a>');
					currentLevel = level;
				});
			} else {
				list[0].append('<span class="toc-empty">' + settings.placeholder + '</span>');
			}
			settings.status = true;
			settings.onOpen.call($btn, list[list.length - 1]);
		}

		function closeToc() {
			$container
				.find(settings.selectors)
				.each(function (i, item) {
					if ($(item).data('toc-id')) {
						$(item)
							.removeAttr('id')
							.removeData('toc-id');
					}
				});

			settings.status = false;
			settings.onClose.call($btn);
		}
	};
}(jQuery));

var $categories = getAll('.bd-category');
if ($categories.length > 0) {
	$categories.forEach(function (el) {
		var toggle_el = el.querySelector('.bd-category-toggle');

		toggle_el.addEventListener('click', function (event) {
			el.classList.toggle('is-active');
		});
	});
}

var back_to_top = $('#back-to-top');

$(window).scroll(function () {
	if ($(window).scrollTop() > 300) {
		back_to_top.addClass('show');
	} else {
		back_to_top.removeClass('show');
	}
});

back_to_top.on('click', function (e) {
	e.preventDefault();
	$('html, body').animate({
		scrollTop: 0
	}, '300');
});

function closeCategories(current_el) {
	$categories.forEach(function (el) {
		if (current_el == el) {
			return;
		}
		el.classList.remove('is-active');
	});
}

function getAll(selector) {
	return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
}

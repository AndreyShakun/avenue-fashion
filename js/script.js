'use strict'
// определяем на каком устройстве открыта страница
const isMobile = {
	Android: function () {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function () {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	IOS: function () {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function () {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function () {
		return navigator.userAgent.match(/Android/i);
	},
	any: function () {
		return (
			isMobile.Android() ||
			isMobile.BlackBerry() ||
			isMobile.IOS() ||
			isMobile.Opera() ||
			isMobile.Windows()
		);
	},
};

if (isMobile.any()) {
	document.body.classList.add('_touch')
	//выпадение подменю при touch
	let menuArrows = document.querySelectorAll('.menu__arrow');

	if (menuArrows.length > 0) {
		for (let index = 0; index < menuArrows.length; index++) {
			const menuArrow = menuArrows[index];
			menuArrow.addEventListener('click', function (e) {
				menuArrow.parentElement.classList.toggle('_active');
			});
		}
	}

	//выпадение корзины при touch
	let cartArrow = document.querySelector('.top-bar__shopping-cart_arrow');
	let shoppingСart = document.querySelector('.top-bar__shopping-cart');

	cartArrow.addEventListener('click', function (e) {
		shoppingСart.classList.toggle('_active');
		// console.log(cartArrow)
	});

} else {
	document.body.classList.add('_pc')
}

let menuArrowsHidden = document.getElementsByClassName('_hidden');


// ----------------------------------------
//меню скрытие стрелки, если нет подменю
let subList = document.querySelectorAll('.menu__sub-list');
let arrow = document.querySelectorAll('.menu__arrow');
for (let i = 0; i < subList.length; i++) {
	let thisItem = subList[i].firstElementChild;
	// let menuList = subList[i].parentElement;
	let thisArrow = subList[i].previousElementSibling;
	const element = subList[i];
	if (!thisItem) {
		thisArrow.classList.add('_hidden-arrow')
		subList[i].style.display = 'none';
	}
}

// меню бургер
let iconMenu = document.querySelector('.menu__icon');
const menuBody = document.querySelector('.menu__body');
if (iconMenu) {
	iconMenu.addEventListener('click', function (e) {
		document.body.classList.toggle('_lock');
		iconMenu.classList.toggle('_active');
		menuBody.classList.toggle('_active');
	})
}

//скрытие placeholder при нажатии
const searchTagForm = document.forms.searchForm;
const searchFormInput = searchTagForm.searchInput;
const searchFormPlaceholder = searchFormInput.placeholder;

searchFormInput.addEventListener('focus', (e) => {
	searchFormInput.placeholder = '';
});

searchFormInput.addEventListener('blur', (e) => {
	searchFormInput.placeholder = searchFormPlaceholder;
});

document.addEventListener('keyup', (event) => {
	if (event.code === 'Escape') {
		searchFormInput.placeholder = searchFormPlaceholder;
		searchFormInput.blur();
	}
});

// ----------------------------------------
//спойлеры в Footer 
const spollersArray = document.querySelectorAll('[data-spollers]');
if (spollersArray.length > 0) {
	//получаем обычные спойлеры
	const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
		return !item.dataset.spollers.split(',')[0];
	});
	//инициализация обычных спойлеров
	if (spollersRegular.length > 0) {
		initSpollers(spollersRegular);
	}

	//получаем спойлеры с медиазапросами
	const spollersMedia = Array.from(spollersArray).filter(function (item, index, self) {
		return item.dataset.spollers.split(',')[0];
	});

	//инициализируем спойлеры с медиазапросами
	if (spollersMedia.length > 0) {
		const breakpointsArray = [];
		spollersMedia.forEach(item => {
			const params = item.dataset.spollers;
			const breakpoint = {};
			const paramsArray = params.split(',');
			breakpoint.value = paramsArray[0];
			breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : 'max';
			breakpoint.item = item;
			breakpointsArray.push(breakpoint);
		});

		//получаем уникальные брейкпоинты
		let mediaQueries = breakpointsArray.map(item => {
			return '(' + item.type + '-width: ' + item.value + 'px),' + item.value + ',' + item.type;
		});
		mediaQueries = mediaQueries.filter((item, index, self) => {
			return self.indexOf(item) === index;
		});

		//работаем с каждым брейкпоинтом        
		mediaQueries.forEach(breakpoint => {
			const paramsArray = breakpoint.split(',');
			const mediaBreakpoint = paramsArray[1];
			const mediaType = paramsArray[2];
			const matchMedia = window.matchMedia(paramsArray[0]);

			//объекты с нужным условием
			const spollersArray = breakpointsArray.filter(item => {
				if (item.value === mediaBreakpoint && item.type === mediaType) {
					return true;
				}
			});
			//событие
			matchMedia.addListener(function () {
				initSpollers(spollersArray, matchMedia);
			});
			initSpollers(spollersArray, matchMedia);
		});
	}
	// инициализация
	function initSpollers(spollersArray, matchMedia = false) {
		spollersArray.forEach(spollersBlock => {
			spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
			if (matchMedia.matches || !matchMedia) {
				spollersBlock.classList.add('_init');
				initSpollerBody(spollersBlock);
				spollersBlock.addEventListener('click', setSpollerAction);
			} else {
				spollersBlock.classList.remove('_init');
				initSpollerBody(spollersBlock, false);
				spollersBlock.removeEventListener('click', setSpollerAction);
			}
		});
	}
	// работа с контентом
	function initSpollerBody(spollersBlock, hideSpollerBody = true) {
		const spollerTitles = spollersBlock.querySelectorAll('[data-spoller]');
		if (spollerTitles.length > 0) {
			spollerTitles.forEach(spollerTitle => {
				if (hideSpollerBody) {
					spollerTitle.removeAttribute('tabindex');
					if (!spollerTitle.classList.contains('_active')) {
						spollerTitle.nextElementSibling.hidden = true;
					}
				} else {
					spollerTitle.setAttribute('tabindex', '-1');
					spollerTitle.nextElementSibling.hidden = false;
				}
			});
		}
	}
	function setSpollerAction(e) {
		const el = e.target;
		if (el.hasAttribute('data-spoller') || el.closest(['data-spoller'])) {
			const spollerTitle = el.hasAttribute('data-spoller') ? el : el.closest('[data-spoller]');
			const spollersBlock = spollerTitle.closest('[data-spollers]');
			const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;
			if (!spollersBlock.querySelectorAll('._slide').length) {
				if (oneSpoller && !spollerTitle.classList.contains('_active')) {
					hideSpollersBody(spollersBlock);
				}
				spollerTitle.classList.toggle('_active');
				_slideToggle(spollerTitle.nextElementSibling, 500);
			}
			e.preventDefault();
		}
	}
	function hideSpollersBody(spollersBlock) {
		const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._active');
		if (spollerActiveTitle) {
			spollerActiveTitle.classlist.remove('_active');
			_slideUp(spollerActiveTitle.nextElementSibling, 500);
		}
	}
}

// SlideToggle
let _slideUp = (target, duration = 500) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = target.offsetHeigt + 'px';
		target.offsetHeigt;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		window.setTimeout(() => {
			target.hidden = true;
			target.style.removeProperty('height');
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');
		}, duration);
	}
}
let _slideDown = (target, duration = 500) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		if (target.hidden) {
			target.hidden = false;
		}
		let height = target.offsetHeigt;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeigt;
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = target.offsetHeigt + 'px';
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		window.setTimeout(() => {
			target.style.removeProperty('height');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');
		}, duration);
	}
}
let _slideToggle = (target, duration = 500) => {
	if (target.hidden) {
		return _slideDown(target, duration)
	} else {
		return _slideUp(target, duration)
	}
}

// ------------------------------------------
// Special Product price sale

// let tab1 = document.getElementById('tab_1');
// let hash = window.location.hash;
// if (!hash) {
// 	tab1.style.display = 'block';
// } else {
// 	tab1.style.display = 'none';
// }


let blockPrice = document.querySelectorAll('.product-block__price');

for (let i = 0; i < blockPrice.length; i++) {
	let priceRegular = blockPrice[i].firstElementChild;
	let priceSale = blockPrice[i].lastElementChild;
	const element = blockPrice[i];
	if (priceSale.innerHTML) {
		priceRegular.classList.add('_line-through');
	} else {
		priceSale.classList.add('_hidden-sale');
	}
}

// let windowWidth = window.innerWidth;
// let productBlock = document.querySelectorAll('.product-block');
// console.log(productBlock)
// for (let i = 0; i < productBlock.length; i++) {
// 	const element = productBlock[i];
// 	if (windowWidth < 950) {
// 		console.log(element.classList)
// 		element.classList.remove('_big');
// 	}
// }

// --------------------------------------------
// HEADER SLIDER
const headerSliderItem = document.querySelectorAll('.items__slide');
const sliderItems = document.querySelector('.items__slide');
let count = 0;
let width;
function init() {
	width = document.querySelector('.header-slider').offsetWidth;
	sliderItems.style.width = width * headerSliderItem.length + 'px';
	headerSliderItem.forEach(item => {
		item.style.width = width + 'px';
		document.querySelector('.header-slider').style.height = width * 0.4 + 'px';
	})
}
window.addEventListener('resize', init);
init();

let item = document.querySelectorAll('.items__slide');
const itemLength = item.length;

const rightArrow = document.querySelector(".slide-prev");
const leftArrow = document.querySelector(".slide-next");
let slider = [];
for (let i = 0; i < itemLength; i++) {
	slider[i] = item[i];
	item[i].remove();
}
let step = 0;
let offset = 0;

function burgerSlider() {
	let div = document.createElement('div');
	div = slider[slider.length - 1];
	div.classList.add('items__slide');
	div.style.left = -width + 'px';
	document.querySelector('.items').appendChild(div);


	div = slider[step];
	div.classList.add('items__slide');
	div.style.left = offset * width + 'px';
	document.querySelector('.items').appendChild(div);
	div = slider[step + 1];
	div.classList.add('items__slide');
	div.style.left = offset * width + width + 'px';
	document.querySelector('.items').appendChild(div);
	offset = 1;

}
function burgerSliderL() {
	// console.log(step);
	if (step == (slider.length - 1)) {
		step = 1;
	} else {
		if (step == (slider.length - 2)) {
			step = 0;
		} else {
			step = (step + 2);
		}
	}
	// console.log(step);
	let div = document.createElement('div');
	div = slider[step];
	div.classList.add('items__slide');
	div.style.left = offset * width + 'px';
	document.querySelector('.items').appendChild(div);

	if (step == 0) {
		step = (slider.length - 1);
	} else {
		step = (step - 1);
	}
	// console.log(step);
	offset = 1;
}

function left() {
	leftArrow.onclick = null;
	// 
	let slider2 = document.querySelectorAll('.items__slide');
	let offset2 = -1;
	for (let i = 0; i < slider2.length; i++) {
		slider2[i].style.left = offset2 * width - width + 'px';
		offset2++;
	}
	setTimeout(function () {
		slider2[0].remove();
		burgerSliderL();
		leftArrow.onclick = left;
	}, 600);

}

function burgerSliderR() {
	console.log(step);
	if (step == 0) {
		step = (slider.length - 2);
	} else {
		if (step == 1) {
			step = (slider.length - 1);
		} else {
			step = (step - 2);
		}
	}
	console.log(step);
	let offset = -1;
	let div = document.createElement('div');
	div = slider[step];
	div.classList.add('items__slide');
	div.style.left = offset * width + 'px';
	document.querySelector('.items').insertBefore(div, items.firstElementChild);
	if (step == (slider.length - 1)) {
		step = 0;
	} else {
		step = (step + 1);
	}
	console.log(step);
	offset = 1;
}

function right() {
	rightArrow.onclick = null;

	let slider2 = document.querySelectorAll('.items__slide');
	let offset2 = (slider2.length - 1);

	for (let i = (slider2.length - 1); i >= 0; i--) {
		slider2[i].style.left = offset2 * width + 'px';
		offset2--;
	}
	setTimeout(function () {
		slider2[(slider2.length - 1)].remove();
		burgerSliderR();
		rightArrow.onclick = right;
	}, 600);
}

burgerSlider();
step = 0;

leftArrow.onclick = left;
rightArrow.onclick = right;

setInterval(left, 7000);


// ------Pop Up--------------------------

const popupLinks = document.querySelectorAll('.popup-link');
const body = document.querySelector('body');
const lockPadding = document.querySelectorAll(".lock-padding");

let unlock = true;

const timeout = 800;

if (popupLinks.length > 0) {
	for (let index = 0; index < popupLinks.length; index++) {
		const popupLink = popupLinks[index];
		popupLink.addEventListener("click", function (e) {
			const popupName = popupLink.getAttribute('href').replace('#', '');
			const curentPopup = document.getElementById(popupName);
			popupOpen(curentPopup);
			e.preventDefault();
		});
	}
}
const popupCloseIcon = document.querySelectorAll('.close-popup');
if (popupCloseIcon.length > 0) {
	for (let index = 0; index < popupCloseIcon.length; index++) {
		const el = popupCloseIcon[index];
		el.addEventListener('click', function (e) {
			popupClose(el.closest('.popup'));
			e.preventDefault();
		});
	}
}

function popupOpen(curentPopup) {
	if (curentPopup && unlock) {
		const popupActive = document.querySelector('.popup.open');
		if (popupActive) {
			popupClose(popupActive, false);
		} else {
			bodyLock();
		}
		curentPopup.classList.add('open');
		curentPopup.addEventListener("click", function (e) {
			if (!e.target.closest('.popup__content')) {
				popupClose(e.target.closest('.popup'));
			}
		});
	}
}

function popupClose(popupActive, doUnlock = true) {
	if (unlock) {
		popupActive.classList.remove('open');
		if (doUnlock) {
			bodyUnLock();
		}
	}
}

function bodyLock() {
	const lockPaddingValue = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';

	if (lockPadding.length > 0) {
		for (let index = 0; index < lockPadding.length; index++) {
			const el = lockPadding[index];
			el.style.paddingRight = lockPaddingValue;
		}
	}
	body.style.paddingRight = lockPaddingValue;
	body.classList.add('lock');

	unlock = false;
	setTimeout(function () {
		unlock = true;
	}, timeout);
}

function bodyUnLock() {
	setTimeout(function () {
		if (lockPadding.length > 0) {
			for (let index = 0; index < lockPadding.length; index++) {
				const el = lockPadding[index];
				el.style.paddingRight = '0px';
			}
		}
		body.style.paddingRight = '0px';
		body.classList.remove('lock');
	}, timeout);

	unlock = false;
	setTimeout(function () {
		unlock = true;
	}, timeout);
}

document.addEventListener('keydown', function (e) {
	if (e.which === 27) {
		const popupActive = document.querySelector('.popup.open');
		popupClose(popupActive);
	}
});

(function () {
	// проверяем поддержку
	if (!Element.prototype.closest) {
		// реализуем
		Element.prototype.closest = function (css) {
			var node = this;
			while (node) {
				if (node.matches(css)) return node;
				else node = node.parentElement;
			}
			return null;
		};
	}
})();
(function () {
	// проверяем поддержку
	if (!Element.prototype.matches) {
		// определяем свойство
		Element.prototype.matches = Element.prototype.matchesSelector ||
			Element.prototype.webkitMatchesSelector ||
			Element.prototype.mozMatchesSelector ||
			Element.prototype.msMatchesSelector;
	}
})();

// -------Gallery product-------------------------

let lookbookImg = document.querySelectorAll('.lookbook__img');

if (lookbookImg.length > 0) {
	for (let i = 0; i < lookbookImg.length; i++) {
		let lookbookImages = lookbookImg[i].querySelectorAll('.lookbook__images img');
		let productPrev = lookbookImg[i].querySelector('.product-prev');
		let productNext = lookbookImg[i].querySelector('.product-next');
		let current = 0;

		function slider() {
			for (let i = 0; i < lookbookImages.length; i++) {
				lookbookImages[i].classList.add('hidden-img')
			}
			lookbookImages[current].classList.remove('hidden-img')
		}
		slider();
		productPrev.onclick = function () {
			if (current - 1 == -1) {
				current = lookbookImages.length - 1;
			} else {
				current--;
			}
			slider();
		};
		productNext.onclick = function () {

			if (current + 1 == lookbookImages.length) {
				current = 0;
			} else {
				current++;
			}
			slider();
		};
	}

}

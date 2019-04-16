'use strict';
//= ================================================
// qPopup.js || v.0.2
//
// updated 06-28-2018
// by jongik.yoon@tripath.co.kr
//
//
//= ================================================


;(function ($) {
	var QPopup;
	var QPopupSettings = {
		beforeCreate: function () {},
		afterCreate: function () {},
		beforeClose: function () {},
		afterClose: function () {},
		afterDestory: function () {},
	};

	$.qPopup = {
		container: null,
		init: function (options) {
			QPopupSettings = $.extend(true, QPopupSettings, options);
			// TODO:
			// draggable init
			// global event init
			// 브라우저 리사이즈 대응하기 (the distance ratio between Popup and Center)
		},
		isActive: function () {
			return !!$.qPopup.container;
		},
		isAppendToBody: function () {
			if (!this.isActive()) {
				console.error('qPopup no Active');
				return false;
			}
			return this.container.find('.PopupBody:last-child').data('qPopup').appendLocation === 'body';
		},
		create: function (contentHTML, options) {
			return new QPopup(contentHTML, options);
		},
		show: function () {
			this.container.css('display', 'block');
		},
		hidden: function () {
			this.container.css('display', 'none');
		},
		getLatestPopup: function () {
			if (!this.isActive()) {
				console.error('qPopup no Active');
				return false;
			}
			return this.container.find('.PopupBody:last-child').data('qPopup');
		},
		closeAll: function () {
			if (!$.qPopup.container) return;

			$.qPopup.container.remove();
			$.qPopup.container = null;
		},
		elName: {
			container: '#qPopup',
			body: '#popupBody',
			popup: '.PopupBody'
		},
		html: {
			container: function () {
				return '<div id="qPopup" class="Popup">' +
									'<div class="u-table">' +
											'<div id="popupBody">' +
											'</div>' +
									'</div>' +
								'</div>';
			},
			popup: function (contentHTML) {
				var html = '';
				var $html = '';

				html += '<div class="PopupBody">' +
									'<header class="PopupHead">' +
											'<h2>' + this.title + '</h2>' + // 타이틀
											'<button class="Btn BtnClose"><i></i><i></i></button>' +
									'</header>' +

									'<div class="PopupContent"></div>' + // #내용
									'<div class="BtnArea">';
				if (this.onClick.cancel) {
					html += '	<button class="Btn BtnDefault ' + this.onClick.cancelStyle + '">' + this.onClick.cancelText + '</button>';
				}
				if (this.onClick.confirm) {
					html += '	<button class="Btn BtnSuccess ' + this.onClick.confirmStyle + '">' + this.onClick.confirmText + '</button>';
				}
				html += '	</div>' +
									'<div class="dim"></div>' +
								'</div>';
				$html = $(html);
				$html.find('.PopupContent')
					.append($(contentHTML));

				return $html;
			},
			contents: {
				default: function (message) {
					return '<div class="PopupMsg">' +
										'<div class="u-table">' +
											'<div>' +
												'<p>' + message + '</p>' +
											'</div>' +
										'</div>' +
									'</div>';
				},
				blankPage: function () {
					return '<div id="blankWrapper" style="width:100%; height:100%;">' +
										'<div id="blankContent" style="width:100%; height:100%;">' +
										'</div>' +
									'</div>';
				}
			}
		}


	};


	// ----------------------------------------------------------------------------//
	// shortcut [start]
  // ----------------------------------------------------------------------------//


	// popup close
	Mousetrap.bind('esc', function (e) {
		var $popups;

		if (!$.qPopup.isActive()) return;
		e.preventDefault();

		$popups = $.qPopup.container.find($.qPopup.elName.popup);

		// latest qPopup
		$popups.eq($popups.length - 1).data('qPopup')
			.close();
	});


	// move focus within popup
	Mousetrap.bind(['tab', 'shift+tab'], function (e, combo) {
		var $popups;

		if ($.qPopup.isActive()) {
			e.preventDefault();

			$popups = $.qPopup.container.find($.qPopup.elName.popup);

			// latest qPopup
			$popups.eq($popups.length - 1).data('qPopup')
				.moveFocus(combo);
		} else {
			//console.log('browser - ', combo);
		}
	});


	// scroll within popup content
	Mousetrap.bind(['alt+up', 'alt+down'], function (e, combo) {
		var $popups;
		var $popupContent;

		if (!$.qPopup.isActive()) return;

		$popups = $.qPopup.container.find($.qPopup.elName.popup);
		// latest qPopup
		$popupContent = $popups.eq($popups.length - 1).find('.co-scroll:not(.Dropdown-body)');

		if (!$popupContent.length) return;

		if (combo === 'alt+up') {
			$popupContent.getNiceScroll(0).doScrollTop($popupContent.scrollTop() - 80, 0);
		} else {
			$popupContent.getNiceScroll(0).doScrollTop($popupContent.scrollTop() + 80, 0);
		}
	});


	// ----------------------------------------------------------------------------//
	// shortcut [end]
  // ----------------------------------------------------------------------------//


	// 팝업 클릭시 포커스 이동 및 유지
	$(document).on('click', $.qPopup.elName.container, function (e) {
		var $targetPopup = $(e.target).closest($.qPopup.elName.popup);
		var qPopup;

		if ($targetPopup.length) { // Click inside the popup
			qPopup = $targetPopup.data('qPopup');

			if ($(e.target).hasClass('tabfocus')) {
				qPopup.focus.current = qPopup.$ableFocusElements.index($(e.target));
			}
		} else { // Click outside the popup
			// latest qPopup focusing
			qPopup = $.qPopup.container.find($.qPopup.elName.popup).last()
				.data('qPopup');
		}

		if (qPopup.$ableFocusElements.length && qPopup.isEnabled) {
			e.stopPropagation();
			qPopup.focusing();
		}
	});


	QPopup = (function () {
		function QPopup(contentHTML, options) {
			var defaults = {
				title: '안내',
				isStackable: false,
				isDraggable: true,
				isMultitasking: false,
				bodySize: null, // object || string
				contentSize: null, // object || string
				appendLocation: 'body',
				ableFocusElements: '.Dropdown, .Dropdown-head, input, textarea, button:not(.PopupHead .BtnClose)',
				onClick: {
					confirmText: '확인',
					confirmStyle: '',
					confirm: null, // function
					cancelText: '취소',
					cancelStyle: '',
					cancel: null, // function
				},
				complete: function () {},
				beforeCreate: function () {},
				afterCreate: function () {},
				beforeClose: function () {},
				afterClose: function () {},
				afterDestory: function () {},
			};
			
			var settings = $.extend(true, $.extend(true, defaults, QPopupSettings), options);
			var $popup = null;
			this.$el = null;
			this.isEnabled = true;
			this.title = settings.title;
			this.isStackable = settings.isStackable;
			this.isDraggable = settings.isDraggable;
			this.isMultitasking = settings.isMultitasking;
			this.bodySize = settings.bodySize;
			this.contentSize = settings.contentSize;
			this.appendLocation = settings.appendLocation;
			this.$ableFocusElements = [];
			this.focus = {
				length: 0,
				current: -1,
			};
			this.onClick = settings.onClick;
			this.beforeCreate = settings.beforeCreate;
			this.afterCreate = settings.afterCreate;
			this.beforeClose = settings.beforeClose;
			this.afterClose = settings.afterClose;
			this.afterDestory = settings.afterDestory;
			this.complete = settings.complete;

			this.beforeCreate();

			// if not stackable, #popupBody is empty
			if ($.qPopup.container && !this.isStackable) {
				$.qPopup.closeAll();
			}

			if (!$.qPopup.container) {
				// render containerHTML
				$.qPopup.container = $(this.appendLocation)
					.append($.qPopup.html.container())
					.find($.qPopup.elName.container);

				// TODO: 임시 (qsales_advisor.css > .Popup 기본 스타일 display: none 제거하면 삭제 가능)
				$.qPopup.container.css('display', 'block');
			}

			// render popupHTML
			$popup = $($.qPopup.html.popup.call(this, contentHTML));
			$.qPopup.container.find($.qPopup.elName.body)
				.append($popup);

			// inject data into a POPUP DOM
			this.$el = $popup;
			$popup.data('qPopup', this);


			// ----------------------------------------------------------------------------//
			// set options 
			// ----------------------------------------------------------------------------//


			// focus init
			this.$ableFocusElements = $popup.find(settings.ableFocusElements)
				.addClass('tabfocus');

			if ($popup.find('.PopupContent .tabfocus').length) {
				// .PopupContent 영역에 tabfocus 존재할 경우
				this.focus.current = 0;
			} else {
				// .BtnArea 우선순위 (1).BtnSucceess, (2).BtnDefault
				this.focus.current = this.$ableFocusElements.length - 1;
			}

			this.$ableFocusElements.eq(this.focus.current);
			this.focus.length = this.$ableFocusElements.length;

			// set Draggable
			if (this.isDraggable) {
				this.setDraggable();
			}

			// set body size
			if (this.bodySize) {
				this.setBodySize(this.bodySize);
			}

			// set content size
			if (this.contentSize) {
				this.setContentSize(this.contentSize);
			}


			// this popup is stackable and if there are siblings, siblings can not be used.
			if (this.isStackable) {
				if ($popup.siblings().length) {
					$popup.siblings().each(function () {
						$(this).data('qPopup').disable();
					});
				}
			}


			// ----------------------------------------------------------------------------//
			// event bind
			// ----------------------------------------------------------------------------//

			// onClick

			// onClick close
			$popup.find('.PopupHead .BtnClose').on('click', function () {
				$popup.data('qPopup')
					.close();
			});

			// onClick confirm
			if (settings.onClick.confirm) {
				$popup.find('.BtnSuccess').on('click', function () {
					var qPopup = $popup.data('qPopup');
					settings.onClick.confirm(qPopup);
				});
			}

			// onClick cancel
			if (settings.onClick.cancel) {
				$popup.find('.BtnDefault').on('click', function () {
					var qPopup = $popup.data('qPopup');
					qPopup.close();
					settings.onClick.cancel(qPopup);
				});
			}

			// center popup
			this.center();

			// show qPopup
			$.qPopup.show();

			this.afterCreate();

			// possible after the popup is shown

			// focus
			this.focusing();

			// set niceScroll
			qsale.setScroll({
				isInit: false,
				selector: this.$el,
			});

			this.imagesLoaded();

			// complete
			settings.complete(this);
		}


		QPopup.prototype.close = function () {
			var $siblings = this.$el.siblings();

			this.beforeClose();

			if (this.onClick.cancel) {
				this.onClick.cancel();
			}

			this.$el.remove();

			this.afterClose();

			if ($siblings.length) {
				$siblings.each(function () {
					$(this).data('qPopup').enable();
				});
			} else {
				$.qPopup.closeAll();
			}
		};


		QPopup.prototype.closeAll = function () {
			$.qPopup.closeAll();
			this.afterDestory();
		};


		QPopup.prototype.moveFocus = function (direction) {
			if (direction === 'tab') {
				if (this.focus.current === this.focus.length - 1) {
					this.focus.current = 0;
				} else {
					this.focus.current++;
				}
			} else if (direction === 'shift+tab') {
				if (this.focus.current === 0) {
					this.focus.current = this.focus.length - 1;
				} else {
					this.focus.current--;
				}
			}
			this.focusing();
		};


		QPopup.prototype.focusing = function () {
			this.$ableFocusElements.eq(this.focus.current).focus();

			return this.$ableFocusElements.eq(this.focus.current);
		};


		QPopup.prototype.center = function () {
			var $siblings = this.$el.siblings();
			var siblingsLength = $siblings.length;

			if (this.isStackable && siblingsLength) {
				// position related to previous popup
				var $prevPopup = $siblings.eq(siblingsLength - 1);
				this.$el.css({
					top: $prevPopup.position().top - 40,
					left: $prevPopup.position().left - 60,
				});
			} else {
				// position center
				// if appendLocation is BODY TAG, it should continue to be displayed at the center of the screen.
				this.$el.css({
					top: (
						($(this.appendLocation).get(0).tagName === 'BODY' ? $(window).height() : $(this.appendLocation).innerHeight())
                        - this.$el.outerHeight()
					) / 2,
					left: (
						($(this.appendLocation).get(0).tagName === 'BODY' ? $(window).width() : $(this.appendLocation).innerWidth())
                        - this.$el.outerWidth()
					) / 2,
				});
			}
		};


		QPopup.prototype.setBodySize = function (size) {
			if (typeof size === 'object') {
				if (size.width) this.$el.css('width', size.width);
				if (size.height) this.$el.css('height', size.height);
			} else if (typeof size === 'string') {
				this.$el.addClass(size.charAt(0) == '.' ? size.substring(1) : size);
			}
		};


		QPopup.prototype.setContentSize = function (size) {
			var $content = this.$el.find('.PopupContent');
			if (typeof size === 'object') {
				if (size.width) $content.css('width', size.width);
				if (size.height) $content.css('height', size.height);
			} else if (typeof size === 'string') {
				this.$el.addClass(size.charAt(0) == '.' ? size.substring(1) : size);
			}
		};


		QPopup.prototype.imagesLoaded = function () {
			var self = this;
			this.$el.find('img').one('load', function () {
				qsale.refreshScroll(self.$el);
			});
		};


		QPopup.prototype.enable = function () {
			if (this.isEnabled) return;

			this.isEnabled = true;
			this.$el.find('.dim')
				.removeClass('is-active');
			this.$ableFocusElements
				.attr('disabled', false)
				.removeClass('p-disabled');
		};


		QPopup.prototype.disable = function () {
			if (this.isMultitasking || !this.isEnabled) return;

			this.isEnabled = false;
			this.$el.find('.dim')
				.addClass('is-active');
			this.$ableFocusElements
				.attr('disabled', true)
				.addClass('p-disabled');
		};


		QPopup.prototype.setDraggable = function (options) {
			if (options !== 'destroy' && !this.isDraggable) {
				this.isDraggable = true;
			}

			this.$el.draggable($.extend(true, {
				containment: 'parent',
				scroll: false,
				zIndex: 100,
				stop: function (event, ui) {
					$(event.originalEvent.target).one('click', function (e) { e.stopImmediatePropagation(); });
				},
			}, options)).css('position', 'absolute'); // 절대 위치로 설정
		};


		return QPopup;
	}());
}(jQuery));

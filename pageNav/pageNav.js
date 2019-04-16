'use strict';
//= ================================================
// pageNav.js || v.0.2
//
// created 03-30-2018
// by jongik.yoon@tripath.co.kr
//
// updated 05-15-2018
//
// [<<]: prevPageBlock
// [<] : prevPage
// [>] : nextPage
// [>>]: nextPageBlock
//
//= ================================================

;(function ($) {
	var PageNav;

	$.fn.pageNav = function (func, currentPageNumber, totalCount, options) {
		if (typeof func !== 'function') {
			console.error('[error]: the type of "onclick.func" must be a function');
		} else {
			this.data('pageNav', new PageNav(this.get(0), func, currentPageNumber, totalCount, options));
			return this.data('pageNav');
		}
	};

	PageNav = (function () {
		function PageNav(el, func, currentPageNumber, totalCount, options) {
			var self = this;
			var settings = $.extend({
				listSize: 10,
				pageSize: 10,
				onclick: {
					params: [],
				},
			}, options);

			this.$el = $(el);
			this.onclick = {
				func: func,
				params: (function () {
					var array = [];
					array[0] = currentPageNumber; // curPageNo
					$.each(settings.onclick.params, function (i, param) {
						array[i + 1] = param;
					});
					return array;
				}()),
			};

			// 페이지 카운트
			// 계산 로직
			this.curPageNo = parseInt(currentPageNumber);
			this.totalCnt = parseInt(totalCount);
			this.listSize = parseInt(settings.listSize);
			this.pageSize = parseInt(settings.pageSize);

			this.pageCnt = Math.ceil(this.totalCnt / this.listSize);
			this.currentPagingBlock = Math.ceil(this.curPageNo / this.pageSize);
			this.totalPagingBlockCount = Math.ceil(this.pageCnt / this.pageSize);
			this.isLastPage = (this.curPageNo === this.pageCnt);
			this.isFirstPage = (this.curPageNo === 1);
			this.isFisrtPagingBlock = (this.currentPagingBlock === 1);
			this.isLastPagingBlock = (this.currentPagingBlock === this.totalPagingBlockCount);
			this.currentPagingBlockStart = ((this.currentPagingBlock - 1) * this.pageSize) + 1;
			this.currentPagingBlockEnd = this.pageCnt < this.currentPagingBlock * this.pageSize ? this.pageCnt : this.currentPagingBlock * this.pageSize;

			// render
			this.$el
				.addClass('Pagging pageNav')
				.html(this.makePageNavHTML());

			// bind click
			this.$el.find('a').off('click').on('click', function () {
				if ($(this).hasClass('is-disable') || $(this).hasClass('is-active')) return;

				// update curPageNo
				self.onclick.params[0] = parseInt($(this).attr('data-pageNav-page'));
				self.curPageNo = self.onclick.params[0];
				self.onclick.func.apply(this, self.onclick.params);
			});
		}


		PageNav.prototype.ARROW = {
			disable: -1,
			doubleLeft:	0,
			doubleRight: 1,
			singleLeft:	2,
			singleRight: 3,
		};


		PageNav.prototype.makePageNavHTML = function () {
			var html = '';

			html +=
			'<div class="Pagging-body">'; // start .Pagging-body

			// 화살표
			// [<<]
			if (this.isFisrtPagingBlock) html += this.makeArrowHTML(this.ARROW.disable, this.ARROW.doubleLeft);
			else html += this.makeArrowHTML((this.curPageNo - this.pageSize), this.ARROW.doubleLeft);

			// [<]
			if (this.isFirstPage) html += this.makeArrowHTML(this.ARROW.disable, this.ARROW.singleLeft);
			else html += this.makeArrowHTML(this.curPageNo - 1, this.ARROW.singleLeft);

			// [>]
			if (this.isLastPage) html += this.makeArrowHTML(this.ARROW.disable, this.ARROW.singleRight);
			else html += this.makeArrowHTML(this.curPageNo + 1, this.ARROW.singleRight);

			// [>>]
			if (this.isLastPagingBlock) html += this.makeArrowHTML(this.ARROW.disable, this.ARROW.doubleRight);
			else html += this.makeArrowHTML(this.curPageNo + this.pageSize > this.pageCnt ?
				this.pageCnt : this.curPageNo + this.pageSize, this.ARROW.doubleRight);

			// 번호
			html += '<ul>';
			for (var i = this.currentPagingBlockStart; i <= this.currentPagingBlockEnd; i++) {
				if (i === this.curPageNo) {
					html += '<li><a class="is-active">' + i + '</a></li>';
				} else {
					html += '<li><a data-pageNav-page="' + i + '">' + i + '</a></li>';
				}
			}
			html +=
				'</ul>';

			html +=
			'</div>'; // end .Pagging-body

			return html;
		};


		PageNav.prototype.makeArrowHTML = function (pageNo, direction) {
			var arrowHTML = '';
			var	style = direction === this.ARROW.doubleLeft || direction === this.ARROW.singleLeft ? 'left' : 'right';
			var	isOpenTag = direction === this.ARROW.doubleLeft || direction === this.ARROW.singleRight;
			var	isCloseTag = direction === this.ARROW.doubleRight || direction === this.ARROW.singleLeft;
			var	isDoubleArrow = direction === this.ARROW.doubleLeft || direction === this.ARROW.doubleRight;

			// <div> 열기 [<< or >]
			if (isOpenTag) {
				arrowHTML += '<div class="Pagging-' + style + '">';
			}

			arrowHTML += '<div class="u-arrow u-arrow--' + style + '">';

			// check is-disable
			arrowHTML += pageNo === this.ARROW.disable ?
				'<a class="is-disable">' :
				'<a data-pageNav-page="' + pageNo + '">';

			// check isDoubleArrow
			arrowHTML += isDoubleArrow ?
				'<span><i></i><i></i></span><span><i></i><i></i></span>' :
				'<span><i></i><i></i></span>';

			arrowHTML += '</a>' +
				'</div>';

			// </div> 닫음 [>> or <]
			if (isCloseTag) {
				arrowHTML += '</div>';
			}

			return arrowHTML;
		};

		return PageNav;
	}());
}(jQuery));

### pageNav
v.0.2 테스트 버전 코드

jQuery기반 SPA웹 전용 List 페이지 네비게이션          
[<<] [<] 1 2 3 4 5 6 7 8 9 10 [>] [>>]  
List 페이지 변경 시 작동할 함수 및 필요한 데이터 전달.


#### 의존 파일

- js: qSales_advisor, jQuery
- css: qSales_advisor


####	$.fn.pageNav (func, currentPageNumber, totalCount, [options]) 
- func < Function > 페이지 number를 눌렀을 때, 실행될 함수
- currentPageNumber < Number > 보여질 페이지 번호
- totalCount < Number > list의 총 개수
- [options] < PlainObject >

| option | type | Description | Default value |
| :--- | :--- | :--- | :--- |
| listSize | Number | 노출될 리스트 개수 | 10 |
| pageSize | Number | 노출될 페이지 개수 | 10 |
| onclick | Object | onclick이벤트관련 | {} |
| params | Array | onclick func에 필요한 파라미터 배열 | [] |


#### sample code 
```js
$listWrapper.find('.Pagging')
.pageNav($.qSales.rc.ea.customerInfo.searchCounselingList, this.currentPageNumber, this.totalCount, {
  listSize: this.MAX_LIST,
  onclick: {
    params: [
      this.filter
    ]
  }
});
```




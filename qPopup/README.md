### qPopup   
v.0.2 테스트 버전 코드

#### 의존 파일
 
- js: qSales_advisor, jQuery
- css: qSales_advisor
- jquery-ui: 드래그 jquery-ui
- mousetrap: 단축키 mousetrap 1.4.6
- nicescroll: 스크롤 jquery.nicescroll


#### $.qPopup.create(contentHTML, [options])
- contentHTML < String || jQuery element > jQuery element를 넣어주면, jQuery이벤트 및 기능 유지
- options < PlainObject > 

| option | type | Description | Default value |
| :--- | :--- | :--- | :--- |
| title | String | 팝업 타이틀 | ‘안내’ |
| isStackable | Boolean | 해당 팝업의 겹치기 여부 | false |
| isDraggable | Boolean | 해당 팝업의 드래그 | true |
| bodySize | String \|\| Object | 해당 팝업의 layout 크기 | ‘’ |
| contentSize | String \|\| Object | 해당 팝업 내부의 content 영역 크기 | ‘’ |
| appendLocation | String \|\| jQuery Element |해당 팝업이 붙여지는 위치 | ‘body’ |
| ableFocusElements | String | ※ 현재 버전에서 이 값을 설정하면, 기본 설정 값은 유지되지 않는다. | '.Dropdown, .Dropdown-head, input, textarea, button:not(.PopupHead .BtnClose)' |
| onClick | Object | 해당 팝업의 버튼 설정 | {} |
| confirmText | String | 확인버튼의 텍스트 | ‘확인’ |
| confirmStyle | String | 확인버튼의 버튼 스타일 | ‘’ |
| confirm | Function | 확인버튼을 생성하고,  버튼을 클릭했을 때 정의한 함수 실행 | null |
| cancelText | String | 취소버튼의 텍스트 | ‘취소’ |
| cancelStyle | String | 취소버튼의 버튼 스타일 | ‘’ |
| cancel | Function | 취소버튼을 생성하고, 버튼을 클릭했을 때 정의한 함수 실행  ※ 버튼 누르면 해당 팝업 제거 | ‘안내’ |
| complete | Function | 해당 팝업의 생성 로직이 완전히 완료된 후,  정의한 함수 실행 첫번째 파라미터로 해당 팝업의 객체정보를 반환 | function () {} |
| beforeCreate | Function | 해당 팝업이 생성되기 전, 정의한 함수 실행 | function () {} |
| afterCreate | Function | 해당 팝업이 화면에 나타난 후에, 정의한 함수 실행 | function () {} |
| beforeClose | Function | 해당 팝업이 제거되기 전, 정의한 함수 실행 | function () {} |
| afterClose | Function | 해당 팝업이 제거된 후, 정의한 함수 실행 | function () {} |
| afterDestory | Function | 모든 팝업이 완전히 제거되었을 때, 정의한 함수 실행 | function () {} |


#### sample code 
기본 ContentHTML
```js
$.qPopup.create($.qPopup.html.contents.default('대화 내역을 가져오지 못했습니다. <br />다시 시도해 주세요.'), {
   title: '오류',
   appendLocation: $.qSales.rc.eaC.$container,
   onClick: {
    confirm: function (popup) {
     popup.close();
    },
   },
});
```

사용자가 생성한 ContentHTML
```js
$.qPopup.create(customerInfoView.popupContent.makeOrderHistory(output.item), {
   title: '주문 내역',
   appendLocation: $.qSales.rc.eaC.$container,
   bodySize: 'PopupBody--order',
   onClick: {
    confirmText: '주문 내역 전송',
    confirmStyle: 'BtnSource-default',
    confirm: function () {
      $.qSales.rc.chat.selectedRoom.send(
        ...
      );
    }
   }
 });
```


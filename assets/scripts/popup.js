document.addEventListener('DOMContentLoaded', function () {
	// 팝업 창이 열렸을 때 메시지 받기
	chrome.runtime.onMessage.addListener(
		function (message, sender, sendResponse) {
			if (message.action === 'updateContent') {
				// 받은 데이터를 팝업 DOM에 적용
				document.querySelector('#tset').textContent = message.data;
			}
		},
	);
});

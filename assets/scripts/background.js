// 우클릭 메뉴 생성
// console.log(document.querySelector('.item-title').textContent);
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'Whale-Mail',
		title: '웨-일이 쉽지? (Whale Mail)', // 메뉴에 보이는 글자
		contexts: ['all'],
	});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	chrome.action.setPopup('public/main.html');
	chrome.action.openPopup();
	if (info.menuItemId === 'Whale-Mail') {
		chrome.scripting
			.executeScript({
				target: { tabId: tab.id },
				files: ['assets/scripts/content.js'],
			})
			.then(() => {
				chrome.tabs.sendMessage(tab.id, {
					action: 'Whale-Mail',
					selectedText: info.selectionText,
				});
			})
			.catch((err) => console.warn('unexpected error', err));
	}
});
let chatGPTResponse = '';
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	chrome.action.setPopup('public/main.html');
	chrome.action.openPopup();
	if (request.type === 'summaryMail') {
		chatGPTResponse = request.payload.message;
		console.log(
			// chatgpt가 쓴거 나옴
			chatGPTResponse,
		);
		//alert();
		// 후속 작업을 처리하는 함수 호출
		todoMessage(chatGPTResponse);
	}
	return true; // 비동기로 작업 시 필요
});
function todoMessage(message) {
	// message를 활용하는 후속 작업
	console.log(message);
	const todo = document.querySelector('#test');
	todo.innerHTML = message;
}

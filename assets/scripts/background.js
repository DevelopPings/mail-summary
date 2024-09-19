// 우클릭 메뉴 생성
// const menuId = 'Whale-Mail';
// console.log(menuId);
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'Whale-Mail',
		title: '웨-일이 쉽지? (Whale Mail)', // 메뉴에 보이는 글자
		contexts: ['all'],
	});
});
// content.js로 크롤링
// chrome.action.onClicked.addListener((tab) => {
// 	console.log(tab.id);
// 	chrome.scripting.executeScript({
// 		target: { tabId: tab.id },
// 		files: ['assets/scripts/content.js'],
// 	});
// });
// 크롤링 관련 메시지 처리
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// 	if (message.action === 'crawlMail') {
// 		chrome.tabs.sendMessage(sender.tab.id, { action: 'Whale-Mail' });
// 	}
// });
chrome.contextMenus.onClicked.addListener((info, tab) => {
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
	if (request.type === 'summaryMail') {
		chatGPTResponse = request.payload.message;
		console.log(
			// chatgpt가 쓴거 나옴
			chatGPTResponse,
		);
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

	// 2개로 나누기
}

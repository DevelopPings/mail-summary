// 우클릭 메뉴 생성
const menuId = 'Whale-Mail';
chrome.contextMenus.remove(menuId, () => {
	chrome.contextMenus.create({
		id: menuId,
		title: '웨-일이 쉽지? (Whale Mail)', // 메뉴에 보이는 글자
		contexts: ['all'],
	});
});
// content.js로 크롤링
chrome.action.onClicked.addListener((tab) => {
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ['assets/scripts/content.js'],
	});
});

let chatGPTResponse = '';
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'greeting') {
		chatGPTResponse = request.payload.message;
		console.log(
			// chatgpt가 쓴거 나옴
			chatGPTResponse,
		);
		// 후속 작업을 처리하는 함수 호출
		handleMessage(chatGPTResponse);

		const returnMessage = `방가워~ 이것은 contentScript의 메시지를 background에서 보내는 응답 메시지야~`;
		sendResponse({
			message: returnMessage,
		});
	}
	return true; // 비동기로 작업 시 필요
});

function handleMessage(message) {
	// message를 활용하는 후속 작업
	console.log('Message for handling:', message);
	document.querySelector('#test').innerHTML = chatGPTResponse;
}

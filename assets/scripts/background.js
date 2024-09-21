chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'Whale-Mail',
		title: '웨-일이 쉽지? (Whale Mail)',
		contexts: ['all'],
	});
});

// 아이콘 클릭 시, 사이드 패널 바로 열기
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error));

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === 'Whale-Mail') {
		openSidePanel();

		chrome.scripting
			.executeScript({
				target: { tabId: tab.id },
				files: ['assets/scripts/content.js'],
			})
			.then(() => {
				chrome.tabs.sendMessage(tab.id, {
					action: 'analyze',
				});
			})
			.catch((err) => console.warn('unexpected error', err));
	}
});

let chatGPTResponse = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'summarize') {
		chatGPTResponse = request.payload.message;
		todoMessage(chatGPTResponse);
	}
});

function todoMessage(message) {
	const todo = document.querySelector('#test');

	if (todo) {
		todo.innerHTML = message;
	}
}

function openSidePanel() {
	chrome.tabs.query({ active: true }, (tabs) => {
		const tabId = tabs[0]?.id;
		if (!tabId) console.error('active tab does not exist');
		chrome.sidePanel.setOptions({
			tabId,
			path: 'public/main.html',
			enabled: true,
		});

		chrome.sidePanel.open({ tabId });
	});
}

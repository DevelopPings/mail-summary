chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'Whale-Mail',
		title: '웨-일이 쉽지? (Whale Mail)',
		contexts: ['all'],
	});
});
let openAiApi = '';

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === 'Whale-Mail') {
		openSidePanel();

		chrome.scripting
			.executeScript({
				target: { tabId: tab.id },
				files: ['assets/scripts/content.js'],
			})
			.then(() => {
				chrome.runtime.onMessage.addListener(
					(request, sender, sendResponse) => {
						if (request.type === 'openai') {
							openAiApi = request.text;
						}
						chrome.tabs.sendMessage(tab.id, {
							action: 'analyze',
							selectedText: info.selectionText,
							apiKey: openAiApi,
						});
					},
				);
			})
			.catch((err) => console.warn('unexpected error', err));

		chrome.sidePanel.open({ tabId: tab.id });
	}
});
let chatGPTResponse = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'summaryMail') {
		chatGPTResponse = request.payload.message;
		console.log(chatGPTResponse);
		chrome.runtime.sendMessage({
			type: 'summarizeTo',
			text: chatGPTResponse,
			flag: false,
		});
	}
});

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

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'Whale-Mail',
		title: '웨-일이 쉽지? (Whale Mail)',
		contexts: ['all'],
	});
});
let openAiApi = '';
// let n = 1;
// console.log('background1 : ' + n);
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
							console.log('background1' + request.test);
							console.log(openAiApi);
							test3(openAiApi, tab.id);
						}
					},
				);
			})
			.catch((err) => console.warn('unexpected error', err));

		chrome.sidePanel.open({ tabId: tab.id });
	}
});
let chatGPTResponse = '';

function test3(res, tab) {
	chrome.tabs.sendMessage(tab, {
		action: 'analyze',
		apiKey: res,
		test: 'error2',
	});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'summaryMail') {
		console.log(request.test);
		console.log(request.payload.message);
		chatGPTResponse = request.payload.message;
		test(chatGPTResponse);
	}
});
function test(response) {
	console.log(response);
	chrome.runtime.sendMessage({
		type: 'summarizeTo',
		text: response,
		flag: false,
		test: 'error4',
	});
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
// n++;
// console.log('background2 : ' + n);

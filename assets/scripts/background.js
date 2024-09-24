const ALLOWED_DOMAINS = [
	'https://mail.google.com/*',
	'https://mail.naver.com/*',
];

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'Whale-Mail',
		title: '웨-일이 쉽지? (Whale Mail)',
		contexts: ['all'],
		documentUrlPatterns: ALLOWED_DOMAINS,
	});
});

const mainPage = 'public/main.html';
const detailPage = 'public/detail.html';
const loadingPage = 'public/loading.html';

chrome.action.onClicked.addListener(() => {
	chrome.sidePanel.setOptions({ path: mainPage });
	chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
	console.log(123);
});
console.log(456);

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
	const { path } = await chrome.sidePanel.getOptions({ tabId });
	console.log(path);
	if (path == mainPage || path.startsWith(detailPage)) {
		chrome.sidePanel.setOptions({ path: loadingPage });
	}
	// chrome.sidePanel.setOptions({ path: mainPage });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	if (info.menuItemId === 'Whale-Mail') {
		try {
			openSidePanel('public/loading.html');

			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ['assets/scripts/content.js'],
			});

			handleData(tab.id);
		} catch (error) {
			console.error('[contextMenu 이벤트 오류] ' + error);
		}
	}
});

function handleData(tabId) {
	chrome.tabs.sendMessage(tabId, {
		message: '(1) handleData',
	});
}

function openSidePanel(path) {
	chrome.tabs.query({ active: true }, (tabs) => {
		const tabId = tabs[0]?.id;
		if (!tabId) console.error('active tab does not exist');

		chrome.sidePanel.setOptions({
			tabId,
			path,
			enabled: true,
		});

		chrome.sidePanel.open({ tabId });
	});
}

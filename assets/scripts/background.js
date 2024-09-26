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

chrome.action.onClicked.addListener(async () => {
	// const { path } = await chrome.sidePanel.getOptions({ tabId });
	// console.log('opened tab: ' + tabId + '\n' + 'path: ' + path + '\n');
	// chrome.sidePanel.setOptions({ path: mainPage });
	chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
	const { path } = await chrome.sidePanel.getOptions({ tabId });

	chrome.sidePanel.setOptions({
		path,
	});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === 'Whale-Mail') {
		try {
			openSidePanel('public/loading.html');

			chrome.runtime.onMessage.addListener(
				function onLoadingComplete(message) {
					if (message.message === '(1) loading complete') {
						chrome.runtime.onMessage.removeListener(
							onLoadingComplete,
						);

						chrome.scripting
							.executeScript({
								target: { tabId: tab.id },
								files: ['assets/scripts/content.js'],
							})
							.then(() => {
								handleData(tab.id);
							})
							.catch((error) => {
								console.error('[executeScript 오류] ' + error);
							});
					}
				},
			);
		} catch (error) {
			console.error('[contextMenu 이벤트 오류] ' + error);
		}
	}
});

function handleData(tabId) {
	chrome.tabs.sendMessage(tabId, {
		message: '(2) handle data',
	});
}

function openSidePanel(path) {
	chrome.tabs.query({ active: true }, (tabs) => {
		const tabId = tabs[0]?.id;
		if (!tabId) {
			console.error('[tabs query 오류] 활성화 된 탭이 없습니다.');
		}

		chrome.sidePanel.setOptions({
			path,
		});

		chrome.sidePanel.open({ tabId });
	});
}

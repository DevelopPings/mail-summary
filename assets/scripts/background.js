chrome.contextMenus.create({
	id: 'Whale-Mail',
	title: '웨-일이 쉽지? (Whale Mail)', // 메뉴에 보이는 글자
	contexts: ['all'],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === 'Whale-Mail') {
		chrome.scripting
			.executeScript({
				target: { tabId: tab.id },
				files: ['assets/scripts/content.js'],
			})
			.then(() => {
				chrome.tabs.sendMessage(tab.id, { action: 'Whale-Mail' });
			})
			.catch((err) => console.warn('unexpected error', err));
	}
});

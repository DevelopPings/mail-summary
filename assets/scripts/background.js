// Wrap in an onInstalled callback to avoid unnecessary work
// every time the service worker is run
chrome.runtime.onInstalled.addListener(() => {
	// Page actions are disabled by default and enabled on select tabs
	chrome.action.disable();

	// Clear all rules to ensure only our expected rules are set
	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		// Declare a rule to enable the action on example.com pages
		let exampleRule = {
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: [
						{ hostSuffix: '.mail.google.com' },
						{ hostSuffix: '.mail.naver.com' },
					],
				}),
			],
			actions: [new chrome.declarativeContent.ShowAction()],
		};

		// Finally, apply our new array of rules
		let rules = [exampleRule];
		chrome.declarativeContent.onPageChanged.addRules(rules);
	});
});

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

// // 크롤링 위한 코드
// chrome.contextMenus.onClicked.addListener((info, tab) => {
// 	if (info.menuItemId === 'Whale-Mail') {
// 		chrome.scripting
// 			.executeScript({
// 				target: { tabId: tab.id },
// 				files: ['assets/scripts/content.js'],
// 			})
// 			.then(() => {
// 				chrome.tabs.sendMessage(tab.id, {
// 					action: 'Whale-Mail',
// 					selectedText: info.selectionText,
// 				});
// 			})
// 			.catch((err) => console.warn('unexpected error', err));
// 	}
// });

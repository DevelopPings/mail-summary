chrome.contextMenus.create({
	id: 'Whale-Mail',
	title: '웨-일이 쉽지? (Whale Mail)', // 메뉴에 보이는 글자
	contexts: ['selection'],
});

chrome.contextMenus.onClicked.addListener((info) => {
	console.log(info);
});

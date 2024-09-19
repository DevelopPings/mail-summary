chrome.action.onClicked.addListener(() => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const tab = tabs[0];
		chrome.tabs.sendMessage(
			tab.id,
			{
				type: 'greeting',
				payload: {
					message: '안녕~ 이것은 popup에서 보내는 메시지야~',
				},
			},
			(response) => {
				console.log(response);
			},
		);
	});
});

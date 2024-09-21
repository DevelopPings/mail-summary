// 우클릭 메뉴 생성

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'Whale-Mail',
		title: '웨-일이 쉽지? (Whale Mail)', // 메뉴에 보이는 글자
		contexts: ['all'],
	});
});
let popupWindowId = null;
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === 'Whale-Mail') {
		chrome.scripting
			.executeScript({
				target: { tabId: tab.id },
				files: ['assets/scripts/content.js'],
			})
			.then(() => {
				openPopup();
				setTimeout(() => {
					chrome.tabs.sendMessage(tab.id, {
						action: 'Whale-Mail',
						selectedText: info.selectionText,
						windowid: popupWindowId,
					});
				}, 1000);

				// chrome.tabs.sendMessage(tab.id, {
				// 	action: 'Whale-Mail',
				// 	selectedText: info.selectionText,
				// 	windowid: popupWindowId,
				// });
			})
			.catch((err) => console.warn('unexpected error', err));
	}
});

let chatGPTResponse = '';
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	document.getElementById('loading').style.display = 'block';
	if (request.type === 'summaryMail') {
		chatGPTResponse = request.payload.message;

		todoMessage(chatGPTResponse);
		setTimeout(() => {
			closePopup(request.windowID);
		}, 2000);
	}
	return true; // 비동기로 작업 시 필요
});

function todoMessage(message) {
	// message를 활용하는 후속 작업
	console.log(message);
	const todo = document.querySelector('#test');
	todo.innerHTML = message;
}

// 팝업 창 열기 함수
function openPopup() {
	chrome.windows.create(
		{
			url: chrome.runtime.getURL('public/main.html'),
			type: 'popup',
			width: 330,
			height: 504,
		},
		(popupWindow) => {
			popupWindowId = popupWindow.id; // 팝업 창 ID 저장
			console.log('팝업 창이 열렸습니다. ID:', popupWindowId); // 확인용 로그
		},
	);
}

// 팝업 창 닫기 함수
function closePopup(id) {
	if (id) {
		chrome.windows.remove(id, () => {
			console.log('팝업 창이 닫혔습니다.');
			id = null; // ID 초기화
		});
	} else {
		console.log('팝업 창이 열려 있지 않습니다.'); // 팝업 창이 열려 있지 않을 때의 메시지
	}
}

// popupWindowId = chrome.windows.create({
// 	url: chrome.runtime.getURL('public/main.html'),
// 	type: 'popup',
// 	width: 360,
// 	height: 500,
// });
// popupWindowId;
// chrome.tabs.create({
// 	url: chrome.runtime.getURL('public/main.html'),
// });
// window.open(
// 	chrome.runtime.getURL('public/main.html'),
// 	'popup',
// 	'width=400,height=600',
// );
// chrome.action.onClicked.addListener(() => {
// 	console.log('확장프로그램');
// 	window.open(
// 		chrome.runtime.getURL('public/main.html'),
// 		'popup',
// 		'width=400,height=600',
// 	);
// });
// document
// 	.querySelectorAll(
// 		'.main-content, .edit-footer, .option-menu , .warning-modal, .settings-modal',
// 	)
// 	.forEach((element) => {
// 		element.style.display = 'none';
// 	});

// function closePopup() {
// 	if (popupWindowId) {
// 		chrome.windows.remove(popupWindowId, () => {
// 			console.log('팝업 창이 닫혔습니다.');
// 		});
// 	}
// }

// // 팝업 창 열기
// chrome.windows.create(
// 	{
// 		url: chrome.runtime.getURL('public/main.html'),
// 		type: 'popup',
// 		width: 330,
// 		height: 504,
// 	},
// 	(popupWindow) => {
// 		// 팝업 창 ID 저장
// 		popupWindowId = popupWindow.id;

// 		// 팝업 창을 닫는 함수
// 		function closePopup() {
// 			if (popupWindowId) {
// 				chrome.windows.remove(popupWindowId, () => {
// 					console.log('팝업 창이 닫혔습니다.');
// 				});
// 			}
// 		}

// 		// 예시: 5초 후에 팝업 창 닫기
// 		setTimeout(closePopup, 2000);
// 	},
// );

// 팝업 창 ID를 저장할 변수
// console.log(
// 	// chatgpt가 쓴거 나옴
// 	chatGPTResponse,
// );
// 후속 작업을 처리하는 함수 호출
// setTimeout(() => {
// 	todoMessage(chatGPTResponse);
// }, 5000);
// document
// 	.querySelectorAll(
// 		'.main-content, .edit-footer, .option-menu , .warning-modal, .settings-modal',
// 	)
// 	.forEach((element) => {
// 		element.style.display = 'none';
// 	});
// setTimeout(closePopup, 10000);
// chrome.windows.remove(popupWindowId.id, () => {
// 	popupWindowId.id = null; // ID를 초기화
// });
// console.log(document.querySelector('.item-title').textContent);
// console.log(document.querySelector('#aitest').innerHTML);

import { toggleNoContentLogo } from './noContent.js';
import { DARK_MODE_VALUE, editDarkMode, loadDarkMode } from './storage.js';

const darkModeButton = document.querySelector('.toggle-mode');

loadDarkMode().then((initValue) => toggleNoContentLogo(initValue));

// 다크모드 버튼
darkModeButton.addEventListener('click', async () => {
	const isDarkMode = document.body.classList.toggle(DARK_MODE_VALUE);
	await editDarkMode(isDarkMode);
	document.documentElement.style.backgroundColor = isDarkMode
		? '#404040'
		: '#fff';
	toggleNoContentLogo(isDarkMode);
});

export function navigate(path) {
	chrome.tabs.query({ active: true }, async (tabs) => {
		const tabId = tabs[0]?.id;
		if (!tabId) {
			console.error('[tabs query 오류] 활성화 된 탭이 없습니다.');
		}

		chrome.sidePanel.setOptions({
			tabId,
			path,
			enabled: true,
		});
	});
}

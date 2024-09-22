import { DARK_MODE_VALUE, editDarkMode, loadDarkMode } from './storage.js';

const darkModeButton = document.querySelector('.toggle-mode');

loadDarkMode();

// 다크모드 버튼
darkModeButton.addEventListener('click', () => {
	const isDarkMode = document.body.classList.toggle(DARK_MODE_VALUE);
	editDarkMode(isDarkMode);
});

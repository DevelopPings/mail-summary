const darkModeButton = document.querySelector('.toggle-mode');

// 다크모드 버튼
darkModeButton.addEventListener('click', () => {
	document.body.classList.toggle('dark-mode');
});

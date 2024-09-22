function loading() {
	const noContentLogo = document.querySelector('.loading');
	noContentLogo.style.display = 'block';
	noContentLogo.style.margin = 'auto';

	document
		.querySelectorAll(
			'.main-content, .edit-footer, .option-menu , .warning-modal, .settings-modal',
		)
		.forEach((element) => {
			element.style.display = 'none';
		});

	const darkModeButton = document.querySelector('.toggle-mode');

	const isDarkMode = () => document.body.classList.contains('dark-mode');
	const IMAGE_PATH = '../public/images/';

	const toggleNoContentLogo = () => {
		const svgFile =
			IMAGE_PATH + `logo-${isDarkMode() ? 'dark' : 'light'}.svg`;

		fetch(svgFile)
			.then((response) => {
				return response.text();
			})
			.then((svgContent) => {
				const parser = new DOMParser();
				const svgElement = parser.parseFromString(
					svgContent,
					'image/svg+xml',
				).documentElement;
				if (noContentLogo.childElementCount > 0) {
					noContentLogo.firstElementChild.remove();
				}
				noContentLogo.appendChild(svgElement);
				const logo = document.querySelector('#logo');
				const logoRect = document.querySelectorAll('#logo rect');
				const number = [3, 4, 1, 0, 2]; //2, 4, 1, 0, 3
				number.forEach((num, index) => {
					setTimeout(() => {
						let x = 0;
						x += 0.05;
						logo.children[num].animate([{ opacity: x }], {
							duration: 1200,
							iterations: Infinity,
						});
					}, index * 500);
				});
			})
			.catch((error) => {
				console.error('Error :', error);
			});
	};

	toggleNoContentLogo();

	darkModeButton.addEventListener('click', () => {
		setTimeout(() => {
			toggleNoContentLogo();
		}, 2);
	});
}

if (true) {
	loading();
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'summarizeTo') {
		const todo = document.querySelector('#test');
		todo.innerHTML = request.message;
	}
	if (false) {
		loading();
	}
	return true; // 비동기로 작업 시 필요
});
console.log(document.querySelector('#test').innerText);
chrome.runtime.sendMessage({
	type: 'openai',
	text: document.querySelector('#test').innerText,
});

const noContentLogo = document.querySelector('.no-content-logo');
const darkModeButton = document.querySelector('.toggle-mode');

const isDarkMode = () => document.body.classList.contains('dark-mode');
const IMAGE_PATH = '../public/images/';

const toggleNoContentLogo = () => {
	const svgFile = IMAGE_PATH + `logo-${isDarkMode() ? 'dark' : 'light'}2.svg`;

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

			const mailIcons = svgElement.querySelectorAll('.mail-icon');

			mailIcons.forEach((el, i) => {
				el.classList.add(`float${i + 1}`);
			});

			if (noContentLogo.childElementCount > 0) {
				noContentLogo.firstElementChild.remove();
			}

			noContentLogo.appendChild(svgElement);
		})
		.catch((error) => {
			console.error('Error :', error);
		});
};

toggleNoContentLogo();

darkModeButton.addEventListener('click', () => {
	toggleNoContentLogo();
});

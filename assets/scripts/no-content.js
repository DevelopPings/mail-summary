const noContentLogo = document.querySelector('.no-content-logo');

fetch('../public/images/logo-light2.svg')
	.then((response) => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
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

		noContentLogo.appendChild(svgElement);
	})
	.catch((error) => {
		console.error('There was a problem with the fetch operation:', error);
	});

// 익명함수라고 오류라고 뜸

fetch('images/logo-light.svg')
	.then((response) => response.text())
	.then((svgData) => {
		document.getElementById('svg').innerHTML = svgData;
		conso;

		const logo = document.querySelector('#svg #logo');
		console.log(logo);
		const number = [3, 4, 1, 0, 2, 2, 0, 1, 4];
		number.forEach((num, index) => {
			setTimeout(() => {
				let x = 0;
				x += 0.05;
				logo.children[num].animate([{ opacity: x }], {
					duration: 1200,
					iterations: Infinity,
				});
			}, index * 200);
		});
	});

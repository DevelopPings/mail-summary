// // 익명함수라고 오류라고 뜸
// let mode = null;
// if (document.body.classList.contains('dark-mode')) {
// 	mode = '../public/images/logo-dark.svg';
// } else {
// 	mode = '../public/images/logo-light.svg';
// }

// fetch(mode)
// 	.then((response) => response.text())
// 	.then((svgData) => {
// 		document.getElementById('loading').innerHTML = svgData;

// 		const logo = document.querySelector('#logo');
// 		const number = [3, 4, 1, 0, 2, 2, 0, 1, 4];
// 		number.forEach((num, index) => {
// 			setTimeout(() => {
// 				let x = 0;
// 				x += 0.05;
// 				logo.children[num].animate([{ opacity: x }], {
// 					duration: 1200,
// 					iterations: Infinity,
// 				});
// 			}, index * 500);
// 		});
// 	});

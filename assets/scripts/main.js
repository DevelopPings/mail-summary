const optionButtons = document.querySelectorAll('.option-button');
const optionMenu = document.querySelector('.option-menu');
const viewportHeight = 500;
const mainPage = '/public/main.html';
const detailPage = '/public/detail.html';

// 옵션 메뉴 클릭
optionButtons.forEach((el) => {
	el.addEventListener('click', () => {
		const rect = el.getBoundingClientRect();
		showOptionMenu(rect);
	});
});

// 바깥 부분 클릭 (꺼짐)
optionMenu.addEventListener('click', (event) => {
	if (isOutBorder(event)) {
		if (location.pathname == mainPage) {
			// write event code
		} else if (location.pathname == detailPage) {
			// write event code
		}
	}
	hideOptionMenu();
});

function isOutBorder(event) {
	// event.target
	return false;
}

const showOptionMenu = (rect) => {
	if (optionMenu.style.visibility === 'visible') return;

	optionMenu.style.visibility = 'visible';
	const firstChild = optionMenu.firstElementChild;

	const childWidth = firstChild.offsetWidth;
	const childHeight = firstChild.offsetHeight;

	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;

	firstChild.style.top = `${centerY}px`;
	firstChild.style.left = `${centerX - childWidth}px`;

	// 메뉴창이 뷰포트 밑으로 나갈시, 위로 출력
	if (parseFloat(firstChild.style.top) + childHeight > viewportHeight) {
		firstChild.style.top = `${centerY - childHeight}px`;
	}
};

const hideOptionMenu = () => (optionMenu.style.visibility = 'hidden');

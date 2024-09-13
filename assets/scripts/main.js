const optionButtons = document.querySelectorAll('.option-button');
const optionMenuBackground = document.querySelector('.option-menu');
const VIEW_PORT_HEIGHT = 500;

// 옵션 메뉴 클릭
optionButtons.forEach((el) =>
	el.addEventListener('click', () =>
		showOptionMenu(el.getBoundingClientRect()),
	),
);

// 바깥 부분 클릭 (꺼짐)
optionMenuBackground.addEventListener('click', () => hideOptionMenu());

const showOptionMenu = (rect) => {
	if (optionMenuBackground.style.visibility === 'visible') return;

	optionMenuBackground.style.visibility = 'visible';
	const optionMenuButton = optionMenuBackground.firstElementChild;

	const buttonWidth = optionMenuButton.offsetWidth;
	const buttonHeight = optionMenuButton.offsetHeight;

	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;

	optionMenuButton.style.top = `${centerY}px`;
	optionMenuButton.style.left = `${centerX - buttonWidth}px`;

	// 메뉴창이 뷰포트 밑으로 나갈시, 위로 출력
	if (
		parseFloat(optionMenuButton.style.top) + buttonHeight >
		VIEW_PORT_HEIGHT
	) {
		optionMenuButton.style.top = `${centerY - buttonHeight}px`;
	}
};

const hideOptionMenu = () => (optionMenuBackground.style.visibility = 'hidden');

const VIEW_PORT_HEIGHT = 500;
const PATH_MAIN = '/public/main.html';
const PATH_DETAIL = '/public/detail.html';

const optionButtons = document.querySelectorAll('.option-button');
const optionMenuBackground = document.querySelector('.option-menu');
const [optionEdit, optionDelete] =
	optionMenuBackground.firstElementChild.children;
const inputFocusArea = document.querySelector('.focus-area');
const editFooter = document.querySelector('.edit-footer');
const editFooterSpace = document.querySelector('.edit-footer-space');
const lists = document.querySelectorAll('.list .list-item');

const currentOption = {
	targetElement: null,
	inputElement: null,
	titleElement: null,
};

const setCurrentOption = (
	targetElement = null,
	inputElement = null,
	titleElement = null,
) => {
	currentOption.targetElement = targetElement;
	currentOption.inputElement = inputElement;
	currentOption.titleElement = titleElement;
};

const startEditMode = () => {
	const { inputElement, titleElement } = currentOption;
	inputElement.value = titleElement.textContent;
	titleElement.style.display = 'none';
	inputElement.style.display = 'block';
	inputFocusArea.style.display = 'block';
	editFooter.style.display = 'flex';
	editFooterSpace.style.display = 'block';
	inputElement.focus();
};

const endEditMode = () => {
	const { inputElement, titleElement } = currentOption;
	titleElement.textContent = inputElement.value;
	inputElement.style.display = 'none';
	titleElement.style.display = 'block';
	inputFocusArea.style.display = 'none';
	editFooter.style.display = 'none';
	editFooterSpace.style.display = 'none';
};

// 옵션 메뉴 클릭
optionButtons.forEach((el) =>
	el.addEventListener('click', () =>
		showOptionMenu(
			el.getBoundingClientRect(),
			el.parentElement.parentElement,
		),
	),
);

// 바깥 부분 클릭 (꺼짐)
optionMenuBackground.addEventListener('click', (event) => {
	event.stopPropagation();

	if (isOutBorder(event)) {
		if (location.pathname == PATH_MAIN) {
			// write event code
		} else if (location.pathname == PATH_DETAIL) {
			// write event code
		}
	}

	hideOptionMenu();
});

// 리스트 클릭
lists.forEach((list) => list.addEventListener('click', moveDetail));

// 수정 버튼 클릭
optionEdit.addEventListener('click', (event) => {
	event.stopPropagation();

	startEditMode();
	hideOptionMenu();
});

// 수정 인풋 요소 바깥 영역 클릭
inputFocusArea.addEventListener('click', (event) => {
	event.stopPropagation();
	endEditMode();
});

function isOutBorder(event) {
	// event.target
	return false;
}

const showOptionMenu = (rect, targetElement) => {
	if (optionMenuBackground.style.display === 'block') return;

	setCurrentOption(
		targetElement,
		targetElement.getElementsByClassName('edit-title-input')[0],
		targetElement.getElementsByClassName('item-title')[0],
	);

	optionMenuBackground.style.display = 'block';
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

const hideOptionMenu = () => {
	optionMenuBackground.style.display = 'none';
};

function moveDetail(event) {
	const target = event.target;
	if (!target.classList.contains('option-button')) {
		// id에 해당하는 요약 내용을 local file에서 불러오기
		location.href = 'detail.html';
	}
}

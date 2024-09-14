import common from './common.js';

const inputFocusArea = document.querySelector('.focus-area');
const editFooter = document.querySelector('.edit-footer');
const editFooterSpace = document.querySelector('.edit-footer-space');
const warningMessage = document.querySelector('.warning-message');

let deleteClickCount = 0;
let deleteMessageInterval;

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

const startEditMode = (hideOptionMenu) => {
	const { inputElement, titleElement } = currentOption;
	inputElement.value = titleElement.textContent;
	titleElement.style.display = 'none';
	inputElement.style.display = 'block';
	inputFocusArea.style.display = 'block';
	editFooter.style.display = 'flex';
	editFooterSpace.style.display = 'block';
	inputElement.focus();
	if (hideOptionMenu) hideOptionMenu();
};

const endEditMode = (hideOptionMenu) => {
	const { inputElement, titleElement } = currentOption;
	titleElement.textContent = inputElement.value;
	inputElement.style.display = 'none';
	titleElement.style.display = 'block';
	inputFocusArea.style.display = 'none';
	editFooter.style.display = 'none';
	editFooterSpace.style.display = 'none';
	if (hideOptionMenu) hideOptionMenu();
};

// 수정 인풋 요소 바깥 영역 클릭
inputFocusArea.addEventListener('click', (event) => {
	event.stopPropagation();
	endEditMode();
});

const deleteCheckList = (hideOptionMenu) => {
	deleteClickCount++;
	warningMessage.classList.add('active');

	if (deleteMessageInterval) {
		clearInterval(deleteMessageInterval);
	}

	deleteMessageInterval = setInterval(() => {
		if (deleteClickCount === 0) {
			clearInterval(deleteMessageInterval);
			warningMessage.classList.remove('active');
		} else {
			deleteClickCount = 0;
		}
	}, 1000);

	if (deleteClickCount === 2) {
		currentOption.targetElement.remove();
		clearInterval(deleteMessageInterval);
		deleteClickCount = 0;
		warningMessage.classList.remove('active');
		if (hideOptionMenu) hideOptionMenu();
	}
};

common.onClickOptionMenu((targetElement) => {
	setCurrentOption(
		targetElement,
		targetElement.getElementsByClassName('edit-title-input')[0],
		targetElement.getElementsByClassName('item-title')[0],
	);
});

common.onClickEdit((hideOptionMenu) => startEditMode(hideOptionMenu));
common.onClickDelete((hideOptionMenu) => deleteCheckList(hideOptionMenu));
common.onClickOutOption(() => warningMessage.classList.remove('active'));

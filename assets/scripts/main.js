import common from './common.js';

const inputFocusArea = document.querySelector('.focus-area');
const editFooter = document.querySelector('.edit-footer');
const editFooterSpace = document.querySelector('.edit-footer-space');

const warningModal = document.querySelector('.warning-modal');
const warningModalContent = document.querySelector('.warning-modal-content');
const modalDeleteButton = warningModal.getElementsByClassName('delete')[0];
const modalCancelButton = warningModal.getElementsByClassName('cancel')[0];

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

// 삭제 확인 모달
warningModal.addEventListener('click', (event) => {
	event.stopPropagation();
	warningModal.classList.remove('active');
});

warningModalContent.addEventListener('click', (event) => {
	event.stopPropagation();
});

modalCancelButton.addEventListener('click', (event) => {
	event.stopPropagation();
	warningModal.classList.remove('active');
});

modalDeleteButton.addEventListener('click', (event) => {
	event.stopPropagation();
	currentOption.targetElement.remove();
	warningModal.classList.remove('active');
});

const showDeleteModal = () => {
	common.hideOptionMenu();
	warningModal.classList.add('active');
};

common.onClickOptionMenu((targetElement) => {
	setCurrentOption(
		targetElement,
		targetElement.getElementsByClassName('edit-title-input')[0],
		targetElement.getElementsByClassName('item-title')[0],
	);
});

common.onClickEdit((hideOptionMenu) => startEditMode(hideOptionMenu));
common.onClickDelete(() => showDeleteModal());
common.onClickOutOption(() => warningModal.classList.remove('active'));

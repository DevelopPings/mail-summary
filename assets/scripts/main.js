import common from './common.js';

const inputFocusArea = document.querySelector('.focus-area');
const editFooterSpace = document.querySelector('.edit-footer-space');

const warningModal = document.querySelector('.warning-modal');
const warningModalContent = document.querySelector('.warning-modal-content');
const modalDeleteButton = warningModal.getElementsByClassName('delete')[0];
const modalCancelButton = warningModal.getElementsByClassName('cancel')[0];

const editFooter = document.querySelector('.edit-footer');
const footerSaveButton = editFooter.getElementsByClassName('save')[0];
const footerResetButton = editFooter.getElementsByClassName('reset')[0];

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

// 옵션 메뉴
common.onClickOptionMenu((targetElement) => {
	setCurrentOption(
		targetElement,
		targetElement.getElementsByClassName('edit-title-input')[0],
		targetElement.getElementsByClassName('item-title')[0],
	);
});

common.onClickEdit((hideOptionMenu) => {
	resetInput();
	startEditMode(hideOptionMenu);
});
common.onClickDelete(() => showDeleteModal());
common.onClickOutOption(() => warningModal.classList.remove('active'));

const startEditMode = (hideOptionMenu) => {
	currentOption.titleElement.style.display = 'none';
	currentOption.inputElement.style.display = 'block';
	inputFocusArea.style.display = 'block';
	editFooter.style.display = 'flex';
	editFooterSpace.style.display = 'block';

	currentOption.inputElement.addEventListener('keydown', (event) => {
		saveOnEnter(event);
	});

	const end = currentOption.inputElement.value.length;
	currentOption.inputElement.setSelectionRange(end, end);
	currentOption.inputElement.focus();
	if (hideOptionMenu) hideOptionMenu();
};

const endEditMode = (hideOptionMenu) => {
	currentOption.inputElement.style.display = 'none';
	currentOption.titleElement.style.display = 'block';
	inputFocusArea.style.display = 'none';
	editFooter.style.display = 'none';
	editFooterSpace.style.display = 'none';

	currentOption.inputElement.removeEventListener('keydown', saveOnEnter);

	if (hideOptionMenu) hideOptionMenu();
};

// 수정 인풋 요소 바깥 영역 클릭
if (inputFocusArea) {
	inputFocusArea.addEventListener('click', (event) => {
		event.stopPropagation();
		endEditMode();
	});
}

// 삭제 확인 모달
warningModal.addEventListener('click', (event) => {
	event.stopPropagation();
	hideWarningModal();
});

warningModalContent.addEventListener('click', (event) => {
	event.stopPropagation();
});

modalCancelButton.addEventListener('click', (event) => {
	event.stopPropagation();
	hideWarningModal();
});

modalDeleteButton.addEventListener('click', (event) => {
	event.stopPropagation();
	currentOption.targetElement.remove();
	hideWarningModal();
});

const showDeleteModal = () => {
	common.hideOptionMenu();
	showWarningModal();
};

const showWarningModal = () => {
	warningModal.style.display = 'flex';
	setTimeout(() => {
		warningModal.classList.add('active');
	});
};

const hideWarningModal = () => {
	warningModal.style.display = 'none';
	setTimeout(() => {
		warningModal.classList.remove('active');
	});
};

// 수정 모드 푸터
footerSaveButton.addEventListener('click', (event) => {
	event.stopPropagation();
	saveInput();
	endEditMode();
});

footerResetButton.addEventListener('click', (event) => {
	event.stopPropagation();
	resetInput();
});

const resetInput = () =>
	(currentOption.inputElement.value = currentOption.titleElement.textContent);

const saveInput = () => {
	if (currentOption.inputElement.value.length === 0) {
		currentOption.targetElement.remove();
	} else {
		currentOption.titleElement.textContent =
			currentOption.inputElement.value;
	}
};

const saveOnEnter = (event) => {
	if (event.key === 'Enter') {
		saveInput();
		endEditMode();
	}
};

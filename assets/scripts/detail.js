import common from './common.js';

const BEFORE_SAVE = 'before-save';
const EDIT_MODE = 'edit-mode';

const detailBody = document.querySelector('#detail-body');
const returnButton = document.querySelector('#return');
const textareas = document.querySelectorAll('textarea');

const checklists = document.querySelectorAll('#check-list > ul > li');
const checklistAddButton = document.querySelector('#check-list .add-button');
const checklistDeleteButtons = document.querySelectorAll(
	'#check-list .delete-button',
);

const editFooter = document.querySelector('.edit-footer');
const footerSaveButton = editFooter.getElementsByClassName('save')[0];
const footerResetButton = editFooter.getElementsByClassName('reset')[0];

const warning = document.querySelector('.warning-message');
const warningMessage = document.querySelector('.warning-message-content');

const warningModal = document.querySelector('.warning-modal');
const warningModalContent = document.querySelector('.warning-modal-content');
const modalDeleteButton = warningModal.getElementsByClassName('delete')[0];
const modalCancelButton = warningModal.getElementsByClassName('cancel')[0];

const editModeTimer = {
	id: 0,
	target: null,
};

const msg = {
	beforeSave: '아직 저장되지 않았습니다. <br>돌아가려면 다시 클릭해주세요.',
	reset: '초기화하려면 다시 클릭해주세요.',
};

function getContents() {
	const title = document.querySelector('#mail-title');
	const summary = document.querySelector('.summary-content');
	const checklists = document.querySelectorAll(
		'#check-list ul li:not(:last-child, .delete) .check-list-content',
	);
	const deleteCheckLists = document.querySelectorAll(
		'#check-list ul li.delete',
	);

	return {
		title: title,
		summary: summary,
		checklists: checklists,
		deleteCheckLists: deleteCheckLists,
	};
}

common.onClickOptionMenu();
common.onClickOutOption();
common.onClickEdit((hideOptionMenu) => {
	// 수정모드
	toggleEditMode();
	if (hideOptionMenu) hideOptionMenu();
});

common.onClickDelete(() => showDeleteModal());

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

window.addEventListener('load', () => {
	autoResize(textareas);
});

detailBody.addEventListener('click', controlDoubleClickToEditMode);
textareas.forEach((textarea) => textarea.addEventListener('keyup', autoResize));

checklists.forEach((checklist, index) => {
	checklist.addEventListener('click', toggleCheck);

	if (index < checklists.length - 1) {
		checklist
			.querySelector('textarea')
			.addEventListener('keydown', blockEnter);
		checklist
			.querySelector('textarea')
			.addEventListener('blur', controlDeleteCheck);
	}
});

checklistAddButton.addEventListener('click', addCheckList);

checklistDeleteButtons.forEach((deleteButton) =>
	deleteButton.addEventListener('click', deleteCheckList),
);

// return & save & reset button event
returnButton.addEventListener('click', clickReturnButton);
footerSaveButton.addEventListener('click', saveSummary);
footerResetButton.addEventListener('click', controlResetSummary);

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
	// 요약 삭제 이벤트 추가
	event.stopPropagation();
	hideWarningModal();
	location.href = 'main.html';
});

function clickReturnButton(event) {
	const bodyClasses = getBodyClasses();

	if (bodyClasses.contains(EDIT_MODE)) {
		if (isContentEdited()) {
			// 수정 후 그냥 돌아가기 > 경고 메세지
			console.log('수정 후 그냥 돌아가기 > 경고 메세지');
			alertMessage(event.target);
		} else {
			// 수정 안하고 돌아가기 > 내용 되돌리고 수정 모드 풀기
			bodyClasses.remove(EDIT_MODE);
			resetSummary();
		}
	} else if (bodyClasses.contains(BEFORE_SAVE)) {
		// 저장 전 돌아가기 > 경고 메세지
		console.log('저장 전 돌아가기 > 경고 메세지');
		alertMessage(event.target);
	} else {
		// 목록으로 돌아가기
		location.href = 'main.html';
	}
}

function blockEnter(event) {
	if (event.keyCode == 13) {
		event.preventDefault();
	}
}

function controlDeleteCheck() {
	if (getElementValue(this).length == 0) {
		if (isTwinsDifferent(this.parentNode)) {
			deleteCheckList.call(this);
		} else {
			this.parentNode.parentNode.remove();
		}
	}
}

function controlDoubleClickToEditMode(event) {
	const tagName = event.target.tagName;
	const bodyClasses = getBodyClasses();

	if (bodyClasses.contains(BEFORE_SAVE) || bodyClasses.contains(EDIT_MODE))
		return;

	if (tagName != 'BUTTON') {
		if (event.target == editModeTimer.target) {
			toggleEditMode();
		} else {
			if (editModeTimer.id != 0) {
				clearTimeout(editModeTimer.id);
			}

			editModeTimer.target = event.target;
			editModeTimer.id = setTimeout(() => {
				editModeTimer.id = 0;
				editModeTimer.target = null;
			}, 200);
		}
	}
}

function toggleEditMode() {
	const bodyClasses = getBodyClasses();

	bodyClasses.toggle(EDIT_MODE);

	if (bodyClasses.contains(EDIT_MODE)) {
		autoResizeList();
	}
}

function autoResizeList() {
	textareas.forEach((textarea) => {
		autoResize.call(textarea);
	});
}

function autoResize() {
	this.style.height = '26px';
	this.style.height = this.scrollHeight + 'px';
}

function toggleCheck() {
	if (!detailBody.classList.contains(EDIT_MODE)) {
		this.classList.toggle('checked');
	}
}

function addCheckList() {
	const li = document.createElement('li');
	const checkboxButton = document.createElement('button');
	const contentArea = document.createElement('div');
	const textarea = document.createElement('textarea');
	const p = document.createElement('p');
	const deleteButton = document.createElement('button');
	const main = document.querySelector('main');

	checkboxButton.classList.add('checkbox');
	contentArea.classList.add('check-list-content');
	deleteButton.classList.add('delete-button');

	li.addEventListener('click', toggleCheck);
	textarea.addEventListener('keyup', autoResize);
	textarea.addEventListener('blur', controlDeleteCheck);
	textarea.addEventListener('keydown', blockEnter);
	deleteButton.addEventListener('click', deleteCheckList);

	contentArea.append(textarea);
	contentArea.append(p);

	li.append(checkboxButton);
	li.append(contentArea);
	li.append(deleteButton);

	this.parentNode.insertAdjacentElement('beforebegin', li);

	main.scrollTo(0, main.scrollHeight);
	textarea.focus();
}

function isContentEdited() {
	const { title, summary, checklists, deleteCheckLists } = getContents();

	if (
		isTwinsDifferent(title) ||
		isTwinsDifferent(summary) ||
		isTwinsListDifferent(checklists) ||
		deleteCheckLists.length > 0
	) {
		return true;
	}
	return false;
}

function isTwinsListDifferent(list) {
	let result = false;

	for (let i = 0; i < list.length; i++) {
		if (isTwinsDifferent(list[i])) {
			result = true;
			break;
		}
	}

	return result;
}

function isTwinsDifferent(element) {
	return isValueDifferent(getEditElement(element), getViewElement(element));
}

function isValueDifferent(element1, element2) {
	if (getElementValue(element1) != getElementValue(element2)) {
		return true;
	}
	return false;
}

function setElementValue(element, value) {
	switch (element.tagName) {
		case 'P':
			element.innerHTML = value;
			break;
		case 'H1':
			element.textContent = value;
			break;
		default:
			element.value = value;
	}
}

function getElementValue(element) {
	let result = '';

	switch (element.tagName) {
		case 'P':
			result = element.innerHTML.replace(/<br>/g, '\n');
			break;
		case 'H1':
			result = element.textContent;
			break;
		default:
			result = element.value;
	}

	return result.trim();
}

function addDeleteCheckList(element) {
	if (element.tagName == 'TEXTAREA') {
		element.parentNode.parentNode.classList.add('delete');
	} else if (element.tagName == 'BUTTON') {
		element.parentNode.classList.add('delete');
	}
}

function deleteCheckList() {
	addDeleteCheckList(this);
}

function saveSummary(event) {
	const bodyClasses = getBodyClasses();

	if (bodyClasses.contains(EDIT_MODE)) {
		// 수정모드 일 때
		if (isContentEdited()) {
			// 수정된 내용이 있으면 보여주는 내용에 붙여넣기
			replaceWithEditContent();
		}
		bodyClasses.remove(EDIT_MODE);
	} else if (bodyClasses.contains(BEFORE_SAVE)) {
		// 메일 요약내용 처음 저장
		bodyClasses.remove(BEFORE_SAVE);
	}
	// 요약 내용 파일에 저장
}

function controlResetSummary() {
	alertMessage(this);
}

function resetSummary() {
	const { title, summary, checklists, deleteCheckLists } = getContents();

	pasteToEditor(title);
	pasteToEditor(summary);
	checklists.forEach((item) => {
		pasteToEditor(item);
		if (isElementEmpty(getEditElement(item))) {
			item.parentNode.remove();
		}
	});
	deleteCheckLists.forEach((item) => {
		pasteToEditor(item.querySelector('.check-list-content'));
		if (
			isElementEmpty(
				getViewElement(item.querySelector('.check-list-content')),
			)
		) {
			item.remove();
		} else {
			item.classList.remove('delete');
		}
	});
}

function replaceWithEditContent() {
	const { title, summary, checklists, deleteCheckLists } = getContents();

	// update title
	pasteToOrigin(title);

	// update summary
	pasteToOrigin(summary);

	// update checklist
	checklists.forEach((item) => pasteToOrigin(item));

	// delete checklist
	deleteCheckLists.forEach((item) => item.remove());
}

function pasteToOrigin(element) {
	changeContent({
		target: getViewElement(element),
		provider: getEditElement(element),
	});
}

function pasteToEditor(element) {
	changeContent({
		target: getEditElement(element),
		provider: getViewElement(element),
	});
}

function changeContent({ target, provider }) {
	const targetTag = target.tagName;
	const providerTag = provider.tagName;

	if (targetTag == 'P' && providerTag == 'TEXTAREA') {
		provider.value = getElementValue(provider);
		target.textContent = provider.value;
	} else if (targetTag == 'TEXTAREA' && providerTag == 'P') {
		target.value = getElementValue(provider);
	} else if (targetTag == 'H1' && providerTag == 'INPUT') {
		provider.textContent = getElementValue(provider);
		target.textContent = provider.textContent;
		target.title = provider.textContent;
	} else if (targetTag == 'INPUT' && providerTag == 'H1') {
		target.value = getElementValue(provider);
	}
}

// 경고창 띄우기
const alertTimer = {
	clickCount: 0,
	id: 0,
	target: null,
};

function alertMessage(element) {
	const bodyClasses = getBodyClasses();

	console.log(alertTimer);
	// 메세지 내용 바꾸기
	if (
		element == returnButton &&
		(bodyClasses.contains(BEFORE_SAVE) || bodyClasses.contains(EDIT_MODE))
	) {
		setElementValue(warningMessage, msg.beforeSave);
	} else if (
		element == footerResetButton &&
		bodyClasses.contains(EDIT_MODE)
	) {
		setElementValue(warningMessage, msg.reset);
	}

	// 한 번도 클릭한 적이 없거나 여러번 클릭 시
	if (alertTimer.target == null || alertTimer.target == element) {
		warning.classList.toggle('active');
		alertTimer.clickCount++;
		alertTimer.target = element;

		if (alertTimer.id) {
			clearTimeout(alertTimer.id);
		}

		alertTimer.id = setTimeout(() => {
			resetAlertTimer();
			warning.classList.remove('active');
		}, 1000);

		if (alertTimer.clickCount === 2) {
			clearTimeout(alertTimer.id);
			resetAlertTimer();
			warning.classList.remove('active');

			//TODO: 2번 클릭 시 실행 로직
			if (element == returnButton) {
				if (bodyClasses.contains(BEFORE_SAVE)) {
					location.href = 'main.html';
				} else if (bodyClasses.contains(EDIT_MODE)) {
					toggleEditMode();
					resetSummary();
				}
			} else if (
				element == footerResetButton &&
				bodyClasses.contains(EDIT_MODE)
			) {
				resetSummary();
			}
		}
	} else {
		// 다른 버튼을 클릭 시
		clearTimeout(alertTimer.id);
		resetAlertTimer();
		alertTimer.clickCount = 1;
		alertTimer.target = element;

		alertTimer.id = setTimeout(() => {
			resetAlertTimer();
			warning.classList.remove('active');
		}, 1000);
	}
}

function resetAlertTimer() {
	alertTimer.target = null;
	alertTimer.id = 0;
	alertTimer.clickCount = 0;
}

function controlDisplayContent() {
	const bodyClasses = getBodyClasses();
	const { title, summary, checklists } = getContents();

	if (isAreaEmpty(title)) {
	}

	if (isAreaEmpty(summary)) {
	}

	if (isAreaEmpty(checklists)) {
	}
}

function isAreaEmpty(element) {
	const { title, summary, checklists } = getContents();
	if (element == title || element == summary) {
		if (isElementEmpty(getViewElement(element))) {
			return true;
		} else {
			return false;
		}
	} else if (element == checklists) {
		if (element.length > 0) {
			return false;
		} else {
			return true;
		}
	}
}

function isElementEmpty(element) {
	return getElementValue(element) == '';
}

function getBodyClasses() {
	return document.body.classList;
}

function getEditElement(element) {
	return element.children[0];
}

function getViewElement(element) {
	return element.children[1];
}

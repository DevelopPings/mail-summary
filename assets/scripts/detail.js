import { date } from './util.js';
import { readDocument, editDocument, deleteDocument } from './storage.js';
import optionMenu from './optionMenu.js';

const BEFORE_SAVE = 'before-save';
const EDIT_MODE = 'edit-mode';
const NO_TITLE = 'no-title';
const NO_SUMMARY = 'no-summary';
const NO_CHECK_LIST = 'no-check-list';
const FIX_ID = 'SUMMARY_RESULT';

const editModeTimer = {
	id: 0,
	target: null,
};

const msg = {
	beforeSave: '아직 저장되지 않았습니다. <br>돌아가려면 다시 클릭해주세요.',
	reset: '초기화하려면 다시 클릭해주세요.',
};

const detailBody = document.querySelector('#detail-body');
const returnButton = document.querySelector('#return');

const mailTitle = document.querySelector('#mail-title input');
const mailSummary = document.querySelector('.summary-content textarea');

const checkListAddButton = document.querySelector('#check-list .add-button');

const editFooter = document.querySelector('.edit-footer');
const footerSaveButton = editFooter.getElementsByClassName('save')[0];
const footerResetButton = editFooter.getElementsByClassName('reset')[0];

const warning = document.querySelector('.warning-message');
const warningMessage = document.querySelector('.warning-message-content');

const warningModal = document.querySelector('.warning-modal');
const warningModalContent = document.querySelector('.warning-modal-content');

const modalDeleteButton = warningModal.getElementsByClassName('delete')[0];
const modalCancelButton = warningModal.getElementsByClassName('cancel')[0];

const option = optionMenu();

option.onClickOptionMenu();
option.onClickOutOption();
option.onClickEdit((hideOptionMenu) => {
	// 수정모드
	toggleEditMode();
	if (hideOptionMenu) hideOptionMenu();
});

option.onClickDelete(() => showDeleteModal());

const currentSummary = {
	id: null,
	title: null,
	sendTime: null,
	author: null,
	createTime: null,
	status: {
		done: 0,
		todo: 0,
	},
	todo: [],
};

function Status() {
	return {
		done: 0,
		todo: 0,
	};
}

function Todo(element) {
	let checked = false;

	if (element.parentNode.classList.contains('checked')) {
		checked = true;
	}

	return {
		content: getElementValue(getViewElement(element)),
		isDone: checked,
	};
}

function Summary(json) {
	currentSummary.id = json.id;
	currentSummary.title = json.title;
	currentSummary.sendTime = json.sendTime;
	currentSummary.author = json.author;
	currentSummary.createTime = json.createTime;
	currentSummary.status = json.status;
	currentSummary.summary = json.summary;
	currentSummary.todo = json.todo;

	return currentSummary;
}

function setSummary(key, value) {
	currentSummary[key] = value;
}

function loadDetail() {
	let summaryId = new URLSearchParams(location.search).get('id');
	const bodyClasses = getBodyClasses();

	if (summaryId == undefined) {
		summaryId = FIX_ID;
		bodyClasses.add(BEFORE_SAVE);
	}

	readDocument(summaryId).then((obj) => {
		Summary(obj);
		displayContents(obj);
		controlDisplayContent();
	});
}

function displayContents(content) {
	const { title, mailSender, mailTime, summary } = getContents();
	const main = document.querySelector('main');

	// display title
	setElementValue(getEditElement(title), content.title);
	setElementValue(getViewElement(title), content.title);

	//display mailSender
	setElementValue(mailSender, content.author);

	// display mailTime
	setElementValue(mailTime, date(content.sendTime, 'yy.MM.dd day HH:mm'));

	// display summary
	setElementValue(getEditElement(summary), content.summary);
	setElementValue(getViewElement(summary), content.summary);

	// display todo
	for (let i = 0; i < content.todo.length; i++) {
		createCheckList();
		const previousCheckList =
			checkListAddButton.parentNode.previousElementSibling;
		const previousCheckListContent = previousCheckList.querySelector(
			'.check-list-content',
		);
		setElementValue(
			getEditElement(previousCheckListContent),
			content.todo[i].content,
		);
		setElementValue(
			getViewElement(previousCheckListContent),
			content.todo[i].content,
		);
		if (content.todo[i].isDone) {
			toggleCheck.call(previousCheckList);
		}
	}

	main.scrollTo(top);
}

function getContents() {
	const title = document.querySelector('#mail-title');
	const mailSender = document.querySelector('#mail-sender');
	const mailTime = document.querySelector('#mail-time');
	const summary = document.querySelector('.summary-content');
	const checkLists = document.querySelectorAll(
		'#check-list ul li:not(:last-child, .delete) .check-list-content',
	);
	const deleteCheckLists = document.querySelectorAll(
		'#check-list ul li.delete',
	);
	const textareas = document.querySelectorAll('textarea');
	let lastList = null;

	if (checkLists.length > 0) {
		lastList = checkLists[checkLists.length - 1].parentElement;
	}

	return {
		title: title,
		mailSender: mailSender,
		mailTime: mailTime,
		summary: summary,
		checkLists: checkLists,
		deleteCheckLists: deleteCheckLists,
		textareas: textareas,
		lastList: lastList,
	};
}

const showDeleteModal = () => {
	option.hideOptionMenu();
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
	const { textareas } = getContents();

	autoResizeList(textareas);
	textareas.forEach((textarea) =>
		textarea.addEventListener('keyup', autoResize),
	);

	window.addEventListener('resize', () => {
		const { textareas } = getContents();

		autoResizeList(textareas);
	});

	detailBody.addEventListener('click', controlDoubleClickToEditMode);

	mailTitle.addEventListener('blur', controlFooterSaveButtonContent);
	mailSummary.addEventListener('blur', controlFooterSaveButtonContent);

	checkListAddButton.addEventListener('click', createNewCheckList);

	// return & save & reset button event
	returnButton.addEventListener('click', clickReturnButton);
	footerSaveButton.addEventListener('click', controlSaveSummary);
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
		// 요약 삭제 취소
		event.stopPropagation();
		hideWarningModal();
	});

	modalDeleteButton.addEventListener('click', (event) => {
		// 요약 삭제
		event.stopPropagation();
		hideWarningModal();
		deleteDocument(currentSummary.id);
		moveToMain();
	});

	loadDetail();
});

function clickReturnButton(event) {
	const bodyClasses = getBodyClasses();

	if (bodyClasses.contains(EDIT_MODE)) {
		if (isContentEdited()) {
			// 수정 후 그냥 돌아가기 > 경고 메세지
			alertMessage(event.target);
		} else {
			// 수정 안하고 돌아가기 > 내용 되돌리고 수정 모드 풀기
			bodyClasses.remove(EDIT_MODE);
			resetSummary();
			controlDisplayContent();
		}
	} else if (bodyClasses.contains(BEFORE_SAVE)) {
		// 저장 전 돌아가기 > 경고 메세지
		alertMessage(event.target);
	} else {
		// 목록으로 돌아가기
		moveToMain();
	}
}

function blockEnter(event) {
	if (event.keyCode == 13) {
		event.preventDefault();
	}
}

function controlDeleteCheck(target) {
	if (getElementValue(target).length == 0) {
		if (isTwinsDifferent(target.parentNode)) {
			// 내용이 다르므로 기존에 있던 체크리스트
			deleteCheckList(target);
		} else {
			// 새롭게 생성된 체크리스트
			target.parentNode.parentNode.remove();
		}
		controlFooterSaveButtonContent();
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
	const { textareas } = getContents();

	bodyClasses.toggle(EDIT_MODE);

	if (bodyClasses.contains(EDIT_MODE)) {
		autoResizeList(textareas);
	}

	controlDisplayContent();
}

function autoResizeList(textareas) {
	textareas.forEach((textarea) => {
		autoResize.call(textarea);
	});
}

function autoResize() {
	if (this) {
		this.style.height = '26px';
		this.style.height = this.scrollHeight + 'px';
	}
}

function toggleCheck() {
	const checkListClasses = this.classList;

	if (!detailBody.classList.contains(EDIT_MODE)) {
		checkListClasses.toggle('checked');
	}
}

function saveToggleCheckStatus() {
	const checkListClasses = this.classList;

	if (!detailBody.classList.contains(EDIT_MODE)) {
		const status = currentSummary.status;
		const todo = currentSummary.todo;
		const index = getElementIndex(this);

		if (!checkListClasses.contains('checked')) {
			status.done++;
			status.todo--;
			todo[index].isDone = true;
		} else {
			status.done--;
			status.todo++;
			todo[index].isDone = false;
		}
		setSummary('status', status);
		setSummary('todo', todo);

		saveCurrentSummary();

		toggleCheck.call(this);
	}
}
function getElementIndex(element) {
	// 부모 요소의 자식 목록에서 해당 요소의 인덱스를 찾음
	return Array.prototype.indexOf.call(element.parentNode.children, element);
}

// 체크리스트 추가
function createCheckList() {
	addCheckList();
	addEventLastCheckList();
}

// 새 체크리스트 추가
function createNewCheckList() {
	createCheckList();
	moveToScrollTop();
	focusOnLastCheckList();
}

function focusOnLastCheckList() {
	const { lastList } = getContents();
	const textarea = lastList.querySelector('textarea');

	textarea.focus();
}

function addCheckList() {
	const li = document.createElement('li');
	const checkboxButton = document.createElement('button');
	const contentArea = document.createElement('div');
	const textarea = document.createElement('textarea');
	const p = document.createElement('p');
	const deleteButton = document.createElement('button');

	checkboxButton.classList.add('checkbox');
	contentArea.classList.add('check-list-content');
	deleteButton.classList.add('delete-button');

	contentArea.append(textarea);
	contentArea.append(p);

	li.append(checkboxButton);
	li.append(contentArea);
	li.append(deleteButton);

	checkListAddButton.parentNode.insertAdjacentElement('beforebegin', li);
}

function addEventLastCheckList() {
	const { lastList } = getContents();
	const li = lastList;
	const textarea = li.querySelector('textarea');
	const deleteButton = li.querySelector('.delete-button');

	li.addEventListener('click', saveToggleCheckStatus);

	textarea.addEventListener('keyup', autoResize);
	textarea.addEventListener('keydown', blockEnter);
	textarea.addEventListener('blur', (event) => {
		controlDeleteCheck(event.target);
		controlFooterSaveButtonContent();
	});

	deleteButton.addEventListener('click', (event) => {
		deleteCheckList(event.target);
		controlFooterSaveButtonContent();
	});
}

function moveToScrollTop() {
	const main = document.querySelector('main');
	main.scrollTo(0, main.scrollHeight);
}

// function addEventLastCheckList() {
// 	const li = document.createElement('li');
// 	const checkboxButton = document.createElement('button');
// 	const contentArea = document.createElement('div');
// 	const textarea = document.createElement('textarea');
// 	const p = document.createElement('p');
// 	const deleteButton = document.createElement('button');
// 	const main = document.querySelector('main');

// 	checkboxButton.classList.add('checkbox');
// 	contentArea.classList.add('check-list-content');
// 	deleteButton.classList.add('delete-button');

// 	li.addEventListener('click', saveToggleCheckStatus);

// 	textarea.addEventListener('keyup', autoResize);
// 	textarea.addEventListener('keydown', blockEnter);
// 	textarea.addEventListener('blur', (event) => {
// 		controlDeleteCheck(event);
// 		controlFooterSaveButtonContent();
// 	});

// 	deleteButton.addEventListener('click', (event) => {
// 		deleteCheckList(event);
// 		controlFooterSaveButtonContent();
// 	});

// 	contentArea.append(textarea);
// 	contentArea.append(p);

// 	li.append(checkboxButton);
// 	li.append(contentArea);
// 	li.append(deleteButton);

// 	checkListAddButton.parentNode.insertAdjacentElement('beforebegin', li);

// 	main.scrollTo(0, main.scrollHeight);
// 	textarea.focus();
// }

function isContentEdited() {
	const { title, summary, checkLists, deleteCheckLists } = getContents();
	if (
		isTwinsDifferent(title) ||
		isTwinsDifferent(summary) ||
		isTwinsListDifferent(checkLists) ||
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
			if (typeof value == 'object') {
				element.innerHTML = value.join('<br>');
			} else {
				element.innerHTML = value.replace(/\n/g, '<br>');
			}
			break;
		case 'H1':
			element.textContent = value;
			element.title = value;
			break;
		case 'BUTTON':
			element.textContent = value;
			break;
		case 'TEXTAREA':
			if (typeof value == 'object') {
				// element.innerHTML = value.join('\n');
				element.value = value.join('\n');
			} else {
				// element.innerHTML = value;
				element.value = value;
			}
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
		case 'TEXTAREA':
			// result = element.innerHTML;
			result = element.value;
			break;
		case 'H1':
		case 'BUTTON':
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

function deleteCheckList(target) {
	addDeleteCheckList(target);
}

function saveSummary() {
	const { title, summary, checkLists } = getContents();
	let status = new Status();
	const arr = [];
	if (currentSummary.id == 'SUMMARY_RESULT') {
		// 랜덤 아이디 생성
	}
	setSummary('title', getElementValue(getViewElement(title)));
	setSummary('summary', getElementValue(getViewElement(summary)).split(/\n/));

	for (let i = 0; i < checkLists.length; i++) {
		const todo = new Todo(checkLists[i]);

		if (todo.isDone) {
			status.done++;
		} else {
			status.todo++;
		}

		arr.push(todo);
	}
	setSummary('status', status);
	setSummary('todo', arr);

	saveCurrentSummary();
}

function saveCurrentSummary() {
	const bodyClasses = getBodyClasses();

	if (!bodyClasses.contains(BEFORE_SAVE)) {
		editDocument(currentSummary.id, currentSummary);
	}
}

function controlSaveSummary() {
	if (getElementValue(this) == '저장하기') {
		// 요약 내용 파일에 저장
		const bodyClasses = getBodyClasses();

		if (bodyClasses.contains(EDIT_MODE)) {
			// 수정모드 일 때
			if (isContentEdited()) {
				// 수정된 내용이 있으면 보여주는 내용에 붙여넣기
				replaceWithEditContent();
			}
			// bodyClasses.remove(EDIT_MODE);
			toggleEditMode();
			saveSummary();
		} else if (bodyClasses.contains(BEFORE_SAVE)) {
			// 메일 요약내용 처음 저장
			bodyClasses.remove(BEFORE_SAVE);
			saveSummary();
			location.href = 'detail.html?id=' + currentSummary.id;
		}
	} else if (getElementValue(this) == '삭제하기') {
		// 모든 내용 삭제 시 삭제
		showDeleteModal();
	}
}

function controlResetSummary() {
	alertMessage(this);
}

function resetSummary() {
	const { title, summary, checkLists, deleteCheckLists } = getContents();

	// update title
	pasteToEditor(title);

	// update summary
	pasteToEditor(summary);

	// update checklist
	checkLists.forEach((item) => {
		pasteToEditor(item);

		if (isElementEmpty(getEditElement(item))) {
			item.parentNode.remove();
		}
	});

	// delete checklist
	deleteCheckLists.forEach((item) => {
		const itemContent = item.querySelector('.check-list-content');

		pasteToEditor(itemContent);

		if (isElementEmpty(getViewElement(itemContent))) {
			item.remove();
		} else {
			item.classList.remove('delete');
		}
	});
}

function replaceWithEditContent() {
	const { title, summary, checkLists, deleteCheckLists } = getContents();

	// update title
	pasteToOrigin(title);

	// update summary
	pasteToOrigin(summary);

	// update checklist
	checkLists.forEach((item) => pasteToOrigin(item));

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
		// provider.value = getElementValue(provider);
		// target.textContent = provider.value;
		setElementValue(provider, getElementValue(provider));
		// setElementValue(target, getElementValue(provider));
	} else if (targetTag == 'TEXTAREA' && providerTag == 'P') {
		// target.value = getElementValue(provider);
	} else if (targetTag == 'H1' && providerTag == 'INPUT') {
		// provider.textContent = getElementValue(provider);
		// target.textContent = provider.textContent;
		// target.title = provider.textContent;
		setElementValue(provider, getElementValue(provider));
	} else if (targetTag == 'INPUT' && providerTag == 'H1') {
		// target.value = getElementValue(provider);
	}

	setElementValue(target, getElementValue(provider));
}

// 경고창 띄우기
const alertTimer = {
	clickCount: 0,
	id: 0,
	target: null,
};

function alertMessage(element) {
	const bodyClasses = getBodyClasses();

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
				// 돌아가기 버튼 클릭 시
				if (bodyClasses.contains(BEFORE_SAVE)) {
					moveToMain();
				} else if (bodyClasses.contains(EDIT_MODE)) {
					resetSummary();
					toggleEditMode();
				}
			} else if (
				element == footerResetButton &&
				bodyClasses.contains(EDIT_MODE)
			) {
				// 초기화 버튼 클릭 시
				const { textareas } = getContents();

				resetSummary();
				autoResizeList(textareas);
				controlFooterSaveButtonContent();
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
	const { title, summary, checkLists } = getContents();

	if (isAreaEmpty(title)) {
		if (bodyClasses.contains(EDIT_MODE)) {
			bodyClasses.remove(NO_TITLE);
		} else {
			bodyClasses.add(NO_TITLE);
		}
	}

	if (isAreaEmpty(summary)) {
		if (bodyClasses.contains(EDIT_MODE)) {
			bodyClasses.remove(NO_SUMMARY);
		} else {
			bodyClasses.add(NO_SUMMARY);
		}
	}

	if (isAreaEmpty(checkLists)) {
		if (bodyClasses.contains(EDIT_MODE)) {
			bodyClasses.remove(NO_CHECK_LIST);
		} else {
			bodyClasses.add(NO_CHECK_LIST);
		}
	}
}

function isContentEmpty() {
	const { checkLists } = getContents();

	if (
		isElementEmpty(mailTitle) &&
		isElementEmpty(mailSummary) &&
		checkLists.length == 0
	) {
		return true;
	}

	return false;
}

function isAreaEmpty(element) {
	const { title, summary } = getContents();
	if (element == title || element == summary) {
		if (isElementEmpty(getViewElement(element))) {
			return true;
		} else {
			return false;
		}
	} else {
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

function controlFooterSaveButtonContent() {
	if (isContentEmpty(this)) {
		setElementValue(footerSaveButton, '삭제하기');
	} else {
		setElementValue(footerSaveButton, '저장하기');
	}
}

function moveToMain() {
	location.href = 'main.html';
}

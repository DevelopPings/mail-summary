import common from './common.js';

const BEFORE_SAVE = 'before-save';
const EDIT_MODE = 'edit-mode';
const NOT_EXIST_SUMMARY = '요약 내용이 존재하지 않습니다.';

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

const warning = document.querySelector('#warning');
const warningMessage = document.querySelector('#warning-message');

const warningModal = document.querySelector('.warning-modal');

let timer = {
	num: 0,
	targetId: '',
};

function getContents() {
	const title = document.querySelector('#mail-title');
	const summary = document.querySelector('.summary-content');
	const checklists = document.querySelectorAll(
		'#check-list ul li:not(:last-child, .delete) .check-list-content',
	);
	const deleteChecklists = document.querySelectorAll(
		'#check-list ul li.delete',
	);

	return {
		title: title,
		summary: summary,
		checklists: checklists,
		deleteChecklists: deleteChecklists,
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

window.addEventListener('load', () => {
	autoResize(textareas);
});

detailBody.addEventListener('dblclick', toggleEditMode);
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

footerSaveButton.addEventListener('click', saveSummary);
footerResetButton.addEventListener('click', resetSummary);

// return & reset button event
// returnIcon.addEventListener('click', returnMain);
// reset.addEventListener('click', resetDetail);
returnButton.addEventListener('click', clickReturnButton);

function clickReturnButton(event) {
	const bodyClasses = document.body.classList;

	if (bodyClasses.contains(EDIT_MODE)) {
		if (isContentEdited()) {
			// 수정 후 그냥 돌아가기 > 경고 메세지
			console.log('수정 후 그냥 돌아가기 > 경고 메세지');
		} else {
			// 수정 안하고 돌아가기 > 내용 되돌리고 수정 모드 풀기
			bodyClasses.remove(EDIT_MODE);
			// console.log('수정 안하고 돌아가기 > 내용 되돌리고 수정 모드 풀기');
			returnContent();
		}
	} else if (bodyClasses.contains(BEFORE_SAVE)) {
		// 저장 전 돌아가기 > 경고 메세지
		console.log('저장 전 돌아가기 > 경고 메세지');
	} else {
		// 목록으로 돌아가기
		location.href = 'main.html';
	}

	alertMessage(event.target);
}

function blockEnter(event) {
	if (event.keyCode == 13) {
		event.preventDefault();
	}
}

function controlDeleteCheck() {
	if (this.value.trim().length == 0) {
		deleteCheckList.call(this);
	}
}

function toggleEditMode() {
	const bodyClasses = document.body.classList;
	if (bodyClasses.contains(BEFORE_SAVE) || bodyClasses.contains(EDIT_MODE))
		return;

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

// function returnMain(event) {
// 	const targetId = event.target.id;
// 	console.log('returnMain');
// 	if (
// 		detailBody.classList.contains('before-save') &&
// 		!warning.classList.contains('active')
// 	) {
// 		activeAlert(event);
// 	} else if (targetId == timer.targetId) {
// 		location.href = 'main.html';
// 	}
// }

// function resetDetail(event) {
// 	console.log('resetDetail - 1');
// 	const targetId = event.target.id;
// 	console.log('resetDetail -2');
// 	if (!warning.classList.contains('active')) {
// 		activeAlert(event);
// 	} else if (targetId == timer.targetId) {
// 		detailBody.classList.remove('change');
// 	}
// }

// function activeAlert(event) {
// 	const targetId = event.target.id;
// 	console.log('activeAlert', targetId, timer);

// 	if (targetId == 'reset') {
// 		// reset 버튼 클릭
// 		warningMessage.textContent = '초기화하려면 다시 클릭해주세요.';
// 	} else if (targetId == 'return') {
// 		// 저장안한 상태로 return 버튼 클릭
// 		warningMessage.innerHTML =
// 			'아직 저장되지 않았습니다.<br />돌아가려면 다시 클릭해주세요.';
// 	}
// 	if (timer == 0) {
// 		warning.classList.add('active');
// 		timer.targetId = targetId;
// 	} else {
// 		timer.num = setTimeout(() => {
// 			warning.classList.remove('active');
// 			timer.num = 0;
// 			timer.targetId = '';
// 		}, 2000);
// 	}
// }

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

	textarea.focus();
}

function isContentEdited() {
	const { title, summary, checklists, deleteChecklists } = getContents();
	if (
		isTwinsDifferent(title) ||
		isTwinsDifferent(summary) ||
		isTwinsListDifferent(checklists) ||
		deleteChecklists.length > 0
	) {
		return true;
	}
	return false;
}

function isTwinsListDifferent(list) {
	let result = false;
	for (let i = 0; i < list.length; i++) {
		if (isValueDifferent(list[i].children[0], list[i].children[1])) {
			result = true;
			break;
		}
	}
	return result;
}

function isTwinsDifferent(element) {
	return isValueDifferent(element.children[0], element.children[1]);
}

function isValueDifferent(element1, element2) {
	if (getElementValue(element1) != getElementValue(element2)) {
		return true;
	}
	return false;
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

function deleteCheckList() {
	if (this.tagName == 'TEXTAREA') {
		this.parentNode.parentNode.classList.add('delete');
	} else if (this.tagName == 'BUTTON') {
		this.parentNode.classList.add('delete');
	}
}

function saveSummary(event) {
	const bodyClasses = document.body.classList;

	if (bodyClasses.contains(EDIT_MODE)) {
		if (isContentEdited()) {
			replaceWithEditContent();
		}
		bodyClasses.remove(EDIT_MODE);
	} else if (bodyClasses.contains(BEFORE_SAVE)) {
		// 메일 요약내용 처음 저장
		bodyClasses.remove(BEFORE_SAVE);
	}
	alertMessage(event);
}

function resetSummary() {
	const { title, summary, checklists, deleteChecklists } = getContents();

	pasteToEditor(title);
	pasteToEditor(summary);
	checklists.forEach((item) => {
		pasteToEditor(item);
		if (getElementValue(item.children[0]) == '') {
			item.parentNode.remove();
		}
	});
	deleteChecklists.forEach((item) => {
		pasteToEditor(item.querySelector('.check-list-content'));
		item.classList.remove('delete');
	});
}

function replaceWithEditContent() {
	const { title, summary, checklists, deleteChecklists } = getContents();

	// update title
	pasteToOrigin(title);
	// const editTitle = title.querySelector('input');
	// const originTitle = title.querySelector('h1');

	// editTitle.textContent = getElementValue(editTitle);
	// originTitle.textContent = getElementValue(editTitle);
	// originTitle.title = getElementValue(editTitle);

	// update summary
	pasteToOrigin(summary);
	// const editSummary = summary.querySelector('textarea');
	// const originSummary = summary.querySelector('p');

	// editSummary.value = getElementValue(editSummary);
	// originSummary.textContent = getElementValue(editSummary);

	// update checklist
	checklists.forEach((item) => pasteToOrigin(item));
	// for (let i = 0; i < checklists.length; i++) {
	// pasteToOrigin(checklists[i]);
	// const editChecklist = checklists[i].querySelector('textarea');
	// const originChecklist = checklists[i].querySelector('p');
	// editChecklist.value = getElementValue(editChecklist);
	// originChecklist.textContent = getElementValue(editChecklist);
	// }

	// delete checklist
	deleteChecklists.forEach((item) => item.remove());
}

function pasteToOrigin(element) {
	changeContent(element.children[1], element.children[0]);
}

function pasteToEditor(element) {
	changeContent(element.children[0], element.children[1]);
}

function changeContent(target, provider) {
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

function saveContent() {
	const { title, summary, checklists } = getContents();
}

// 경고창 띄우기
let clickCount = 0;
let messageInterval;

function alertMessage(element) {
	clickCount++;
	element.classList.toggle('active');

	if (messageInterval) {
		clearInterval(messageInterval);
	}

	messageInterval = setInterval(() => {
		if (clickCount === 0) {
			clearInterval(messageInterval);
			warningMessage.classList.remove('active');
		} else {
			clickCount = 0;
		}
	}, 2000);

	if (clickCount === 2) {
		element.targetElement.remove();
		clearInterval(messageInterval);
		clickCount = 0;
		warningMessage.classList.remove('active');
		clickCount = 0;
		common.hideOptionMenu();

		//TODO: 2번 클릭 시 실행 로직
	}
}

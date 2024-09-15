import common from './common.js';

const EDIT_MODE = 'edit-mode';
const NOT_EXIST_SUMMARY = '요약 내용이 존재하지 않습니다.';

const detailBody = document.querySelector('#detail-body');
const returnIcon = document.querySelector('#return');
const textareas = document.querySelectorAll('textarea');

const checklists = document.querySelectorAll('#check-list > ul > li');
const addButton = document.querySelector('.add-button');
const deleteButtons = document.querySelectorAll('.delete-button');
const reset = document.querySelector('#reset');
const warning = document.querySelector('#warning');
const warningMessage = document.querySelector('#warning-message');

let timer = {
	num: 0,
	targetId: '',
};

window.addEventListener('load', () => {
	autoResize(textareas);
});
detailBody.addEventListener('dblclick', toggleEditMode);
textareas.forEach((textarea) => textarea.addEventListener('keyup', autoResize));

addButton.addEventListener('click', addCheckList);

deleteButtons.forEach((deleteButton) =>
	deleteButton.addEventListener('click', deleteCheckList),
);

// return & reset button event
// returnIcon.addEventListener('click', returnMain);
// reset.addEventListener('click', resetDetail);
returnIcon.addEventListener('click', (event) => alertMessage(event.target));

checklists.forEach((checklist) => {
	checklist.addEventListener('click', toggleCheck);
	checklist.querySelector('textarea').addEventListener('keydown', blockEnter);
	checklist
		.querySelector('textarea')
		.addEventListener('blur', controlDeleteCheck);
});

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
	detailBody.classList.toggle(EDIT_MODE);

	if (detailBody.classList.contains(EDIT_MODE)) {
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
	contentArea.classList.add('checkbox-content');
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

function deleteCheckList() {
	console.log(this.tagName);
	if (this.tagName == 'TEXTAREA') {
		this.parentNode.parentNode.classList.add('delete');
	} else if (this.tagName == 'BUTTON') {
		this.parentNode.classList.add('delete');
	}
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

import common from './common.js';

const EDIT_MODE = 'edit-mode';

const detailBody = document.querySelector('#detail-body');
const returnIcon = document.querySelector('#return');
const textareas = document.querySelectorAll('textarea');

const checklists = document.querySelectorAll('#check-list > ul > li');
const reset = document.querySelector('#reset');
const warning = document.querySelector('#warning');
const warningMessage = document.querySelector('#warning-message');

let timer = {
	num: 0,
	targetId: '',
};

common.onClickOptionMenu();
common.onClickOutOption();

window.addEventListener('load', () => {
	autoResize(textareas);
});
detailBody.addEventListener('dblclick', toggleEditMode);
textareas.forEach((textarea) => textarea.addEventListener('keyup', autoResize));

// return & reset button event
// returnIcon.addEventListener('click', returnMain);
// reset.addEventListener('click', resetDetail);

checklists.forEach((checklist) => {
	checklist.addEventListener('click', toggleCheck);
});

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

const detailBody = document.querySelector('#detail-body');
const returnIcon = document.querySelector('#return span');
const textareas = document.querySelectorAll('textarea');

const reset = document.querySelector('#reset');
const warning = document.querySelector('#warning');
const warningMessage = document.querySelector('#warning-message');

let timer = 0;
window.addEventListener('load', () => {
	textareas.forEach((textarea) => {
		autoResize.call(textarea);
	});
});
detailBody.addEventListener('dblclick', toggleModeChange);
textareas.forEach((textarea) => textarea.addEventListener('keyup', autoResize));
returnIcon.addEventListener('click', returnMain);
reset.addEventListener('click', resetDetail);

function toggleModeChange() {
	detailBody.classList.toggle('change');
}

function autoResize() {
	this.style.height = '26px';
	this.style.height = this.scrollHeight + 'px';
}

function returnMain(event) {
	console.log(event.target);
	if (
		detailBody.classList.contains('before-save') &&
		!warning.classList.contains('active')
	) {
		activeAlert(event);
	} else {
		location.href = 'main.html';
	}
}

function resetDetail(event) {
	if (!warning.classList.contains('active')) {
		activeAlert(event);
	} else {
		detailBody.classList.remove('change');
	}
}

function activeAlert(event) {
	console.log(this, event.target.id);
	if (event.target.id == 'reset') {
		// reset 버튼 클릭
		warningMessage.textContent = '초기화하려면 다시 클릭해주세요.';
	} else if (event.target.id == 'return') {
		// 저장안한 상태로 return 버튼 클릭
		warningMessage.innerHTML =
			'아직 저장되지 않았습니다.<br />돌아가려면 다시 클릭해주세요.';
	}
	if (timer == 0) {
		warning.classList.add('active');
	}
	timer = setTimeout(() => {
		warning.classList.remove('active');
		timer = 0;
	}, 2000);
}

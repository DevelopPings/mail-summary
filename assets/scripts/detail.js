const returnIcon = document.querySelector('#return span');
const detailBody = document.querySelector('#detail-body');

returnIcon.addEventListener('click', returnMain);
detailBody.addEventListener('dblclick', toggleModeChange);

function returnMain() {
	location.href = 'main.html';
}

function toggleModeChange() {
	detailBody.classList.toggle('change');
}

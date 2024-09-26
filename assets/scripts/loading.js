import { date } from './util.js';
import {
	createHashKey,
	parseTextToJSON,
	resetClickSummaryId,
	setItemInChromeStorage,
} from './storage.js';
import { navigate } from './common.js';

const SUMMARY_RESULT_KEY = 'SUMMARY_RESULT';

const todayDate = document.querySelector('.today-date');
const noContent = document.querySelector('.no-content');

const errorModal = document.querySelector('.warning-modal');
const errorModalOk = errorModal.getElementsByClassName('delete')[0];

noContent.style.display = 'flex';

const currentTime = new Date();
const formattedDate = date(currentTime, 'month _d, yyyy');
const dateTime = date(currentTime, 'yyyy-mm-dd');

todayDate.innerText = formattedDate;
todayDate.setAttribute('datetime', dateTime);

document.addEventListener('DOMContentLoaded', () => {
	chrome.runtime.sendMessage({ message: '(1) loading complete' });
});

errorModalOk.addEventListener('click', (event) => {
	event.stopPropagation();
	navigate('public/main.html');
});

const showErrorModal = (title, message) => {
	errorModal.getElementsByClassName('title')[0].innerText = title;
	errorModal.getElementsByClassName('description')[0].innerText = message;

	errorModal.style.display = 'flex';
	setTimeout(() => {
		errorModal.classList.add('active');
	});
};

chrome.runtime.onMessage.addListener(async (response) => {
	if (response.type === '(3) show result') {
		if (!response.data) {
			return console.error(
				'[show result 이벤트 오류] 메일 요약이 존재하지 않습니다.',
			);
		}

		const { title, send, time, summary, todo } = response.data;
		const formattedTime = date(new Date(time), 'yyyy-MM-dd HH:mm');

		const id = await createHashKey();
		const text = `[[title]]\n${title}\n[[author]]\n${send}\n[[sendTime]]\n${formattedTime}\n[[summary]]\n${summary}\n[[todo]]\n${todo}`;

		const summaryJson = parseTextToJSON(text, id);
		await setItemInChromeStorage(SUMMARY_RESULT_KEY, summaryJson);

		chrome.tabs.query({ active: true }, () => {
			chrome.sidePanel.setOptions({
				path: '../public/detail.html',
			});
		});
	}

	if (response.type === 'error') {
		const { code, message } = response.error;
		showErrorModal(code, message);
	}
});

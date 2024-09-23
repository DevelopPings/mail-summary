import { date } from './util.js';
import {
	createHashKey,
	parseTextToJSON,
	setItemInChromeStorage,
} from './storage.js';

const SUMMARY_RESULT_KEY = 'SUMMARY_RESULT';

const todayDate = document.querySelector('.today-date');
const noContent = document.querySelector('.no-content');

noContent.style.display = 'flex';

const currentTime = new Date();
const formattedDate = date(currentTime, 'month _d, yyyy');
const dateTime = date(currentTime, 'yyyy-mm-dd');

todayDate.innerText = formattedDate;
todayDate.setAttribute('datetime', dateTime);

chrome.runtime.onMessage.addListener(async (response) => {
	if (response.type === '(2) present') {
		if (!response.data) {
			return console.error(
				'[present 이벤트 오류] 메일 요약이 존재하지 않습니다.',
			);
		}

		const { title, send, time, summary, todo } = response.data;
		const formattedTime = date(new Date(time), 'yyyy-MM-dd HH:mm');

		const id = await createHashKey();
		const text = `[[title]]\n${title}\n[[author]]\n${send}\n[[sendTime]]\n${formattedTime}\n[[summary]]\n${summary}\n[[todo]]\n${todo}`;

		const summaryJson = parseTextToJSON(text, id);
		await setItemInChromeStorage(SUMMARY_RESULT_KEY, summaryJson);
		location.href = 'detail.html';
	}
});

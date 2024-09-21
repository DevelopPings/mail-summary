import { date } from './util.js';
import {
	EXAMPLE_DATA,
	EXAMPLE_INPUT_TEXT,
	EXAMPLE_EDIT_DATA,
} from './dummies.js';

const MAIL_KEY_LENGTH = 12;
const KEY_LIST = {
	TITLE: 'title',
	AUTHOR: 'author',
	SEND_TIME: 'sendTime',
	CREATE_TIME: 'createTime',
	SUMMARY: 'summary',
	TODO: 'todo',
	STATUS: 'status',
};
const MAIL_KEY_SUFFIX = 'wm-';
const DARK_MODE = 'dark_mode';
const API_KEY = 'API_KEY';
const EOL = getLineBreak();

// GPT 분석 후 저장
export async function generateDocument(text) {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let randomString = '';

	for (let i = 0; i < MAIL_KEY_LENGTH; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		randomString += characters[randomIndex];
	}

	const encoder = new TextEncoder();
	const data = encoder.encode(randomString);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	const keyName = MAIL_KEY_SUFFIX + hashHex.substring(0, MAIL_KEY_LENGTH);

	// GPT 분석 결과를 JSON으로 변환
	localStorage.setItem(keyName, parseTextToJSON(text, keyName));
	console.log('로컬 스토리지에 ' + keyName + '이 생성되었습니다.');
	return keyName;
}

// generateDocument(EXAMPLE_INPUT_TEXT);

// 문서 읽기
export function readDocument(key) {
	try {
		const data = localStorage.getItem(key);

		if (!data) {
			return console.error(
				'[읽기 오류] 문서가 존재하지 않습니다: ' + key,
			);
		}

		return JSON.parse(data);
	} catch (error) {
		console.error('[읽기 오류] ' + error);
	}
}

// console.log(readDocument('wm-42b463218590'));

// 문서 목록 읽기
export function readDocumentList() {
	try {
		const result = [];

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);

			if (key === DARK_MODE || key === API_KEY) {
				continue;
			}

			result.push(readDocument(key));
		}

		return result;
	} catch (error) {
		console.error('[목록 읽기 오류] ' + error);
	}
}

// console.log(readDocumentList());

// 문서 삭제
export function deleteDocument(key) {
	try {
		const data = localStorage.getItem(key);

		if (!data) {
			return console.error(
				'[삭제 오류] 문서가 존재하지 않습니다: ' + key,
			);
		}

		localStorage.removeItem(key);
		console.log('문서를 성공적으로 삭제하였습니다:' + key);
	} catch (error) {
		console.error('[삭제 오류] ' + error);
	}
}

// deleteDocument('wm-274e1f1c32e7');

// 문서 수정
export function editDocument(key, data) {
	try {
		if (!data) {
			return console.error(
				'[수정 오류] 문서가 존재하지 않습니다: ' + key,
			);
		}

		localStorage.setItem(key, JSON.stringify(data));
		console.log('문서를 성공적으로 수정하였습니다:' + key);
	} catch (error) {
		console.error('[수정 오류] ' + error);
	}
}

// editDocument('wm-de32342317b0', EXAMPLE_EDIT_DATA);

// GPT 분석 결과를 JSON으로 변환
export function parseTextToJSON(text, id) {
	const lines = text
		.split(EOL)
		.map((line) => line.trim())
		.filter((line) => line);

	const data = {
		id,
		title: '',
		author: '',
		sendTime: '',
		createTime: '',
		summary: [],
		todo: [],
		status: {
			done: 0,
			todo: 0,
		},
	};

	let currentSection = '';

	lines.forEach((line) => {
		const keyTitle = line.match(/\[\[(.*?)\]\]/);

		if (keyTitle) {
			currentSection = keyTitle[1];
			return;
		}

		if (currentSection === KEY_LIST.TITLE) {
			data.title = line;
		} else if (currentSection === KEY_LIST.AUTHOR) {
			data.author = line;
		} else if (currentSection === KEY_LIST.SEND_TIME) {
			data.sendTime = line;
		} else {
			if (currentSection === KEY_LIST.SUMMARY) {
				data.summary.push(line);
			} else if (currentSection === KEY_LIST.TODO) {
				data.todo.push({
					content: line.replace(/^\d+\.\s*/, ''),
					isDone: false,
				});
			}
		}
	});

	data.status.todo = data.todo.length;
	data.createTime = date(new Date(), 'yyyy-MM-dd HH:mm');

	const jsonString = JSON.stringify(data, null, 2);

	return jsonString;
}

export function loadDarkMode() {
	const isDarkMode = localStorage.getItem(DARK_MODE);

	if (isDarkMode === undefined) {
		localStorage.setItem(DARK_MODE, false);
	}

	if (isDarkMode === true) {
		return true;
	}

	return false;
}

export function editDarkMode(value) {
	localStorage.setItem(DARK_MODE, value ? true : false);
}

export function loadApiKey() {
	const apiKey = localStorage.getItem(API_KEY);

	if (apiKey === undefined) {
		localStorage.setItem(API_KEY, null);
	}

	if (apiKey !== null) {
		return apiKey;
	}

	return null;
}

export function editApiKey(value) {
	localStorage.setItem(API_KEY, value ? value : null);
}

function getOS() {
	const userAgent = navigator.userAgent;

	if (userAgent.indexOf('Win') !== -1) return 'Windows';
	if (userAgent.indexOf('Mac') !== -1) return 'macOS';
	if (userAgent.indexOf('X11') !== -1 || userAgent.indexOf('Linux') !== -1)
		return 'Linux';
	return 'unknown';
}

// OS별 개행 문자
function getLineBreak() {
	const os = getOS();
	switch (os) {
		case 'Windows':
			return '\r\n';
		case 'macOS':
			return '\n';
		case 'Linux':
			return '\n';
		default:
			return '\n';
	}
}

export default {
	readDocument,
	readDocumentList,
	deleteDocument,
	editDocument,
	generateDocument,
	parseTextToJSON,
};

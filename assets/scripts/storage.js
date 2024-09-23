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
export const DARK_MODE_KEY = 'DARK_MODE';
export const DARK_MODE_VALUE = 'dark-mode';

const MAIL_KEY_SUFFIX = 'wm-';
const EOL = '\n';
const API_KEY = 'API_KEY';

function setItemInChromeStorage(key, value) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.set({ [key]: value }, () => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(key);
			}
		});
	});
}

function getItemInChromeStorage(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, (result) => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(result[key]);
			}
		});
	});
}

function removeItemInChromeStorage(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.remove(key, () => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(key);
			}
		});
	});
}

export async function getItemCountInChromeStorage() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(null, (items) => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				const count = Object.keys(items).filter((key) =>
					key.startsWith(MAIL_KEY_SUFFIX),
				).length;

				resolve(count);
			}
		});
	});
}

export async function createHashKey() {
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

	return MAIL_KEY_SUFFIX + hashHex.substring(0, MAIL_KEY_LENGTH);
}

// GPT 분석 후 저장
export async function generateDocument(text) {
	const keyName = await createHashKey();
	// GPT 분석 결과를 JSON으로 변환
	await setItemInChromeStorage(keyName, parseTextToJSON(text, keyName));
	console.log('로컬 스토리지에서 ' + keyName + '가 생성되었습니다.');
	return keyName;
}

//generateDocument(EXAMPLE_INPUT_TEXT);

// 문서 읽기
export async function readDocument(key) {
	try {
		const data = await getItemInChromeStorage(key);

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

// readDocument('wm-5a06e78aac6f').then((doc) => console.log(doc));

// 문서 목록 읽기
export async function readDocumentList() {
	try {
		const result = {};

		const items = await new Promise((resolve, reject) => {
			chrome.storage.local.get(null, (documents) => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				} else {
					resolve(documents);
				}
			});
		});

		for (const key in items) {
			if (!key.startsWith(MAIL_KEY_SUFFIX)) {
				continue;
			}

			result[key] = JSON.parse(items[key]);
		}

		return result;
	} catch (error) {
		console.error('[목록 읽기 오류] ' + error);
	}
}

// console.log(readDocumentList().then((result) => console.log(result)));

// 문서 삭제
export async function deleteDocument(key) {
	try {
		const data = await getItemInChromeStorage(key);

		if (!data) {
			return console.error(
				'[삭제 오류] 문서가 존재하지 않습니다: ' + key,
			);
		}

		await removeItemInChromeStorage(key);
		console.log('로컬 스토리지에서 ' + key + '가 제거되었습니다.');
	} catch (error) {
		console.error('[삭제 오류] ' + error);
	}
}

// deleteDocument('wm-67928c2d4f59');

// 문서 수정
export async function editDocument(key, data) {
	try {
		if (!data) {
			return console.error(
				'[수정 오류] 문서가 존재하지 않습니다: ' + key,
			);
		}

		await setItemInChromeStorage(key, JSON.stringify(data));
		console.log('로컬 스토리지에서 ' + key + '가 수정되었습니다.');
	} catch (error) {
		console.error('[수정 오류] ' + error);
	}
}

// editDocument('wm-51443797e410', EXAMPLE_EDIT_DATA);

// GPT 분석 결과를 JSON으로 변환
export function parseTextToJSON(text, id) {
	const lines = text
		.split(EOL)
		.map((line) => line.trim())
		.filter((line) => line);

	const data = {
		...(id ? { id } : {}),
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

	if (id) {
		data.id = id;
	}
	data.status.todo = data.todo.length;
	data.createTime = date(new Date(), 'yyyy-MM-dd HH:mm');

	const jsonString = JSON.stringify(data, null, 2);

	return jsonString;
}

export async function getDarkModeState() {
	return await getItemInChromeStorage(DARK_MODE_KEY);
}

export async function loadDarkMode() {
	const isDarkMode = await getDarkModeState();

	if (isDarkMode === undefined) {
		await setItemInChromeStorage(DARK_MODE_KEY, false);
	}

	if (isDarkMode === true) {
		document.body.classList.add(DARK_MODE_VALUE);
		return true;
	}

	document.body.classList.remove(DARK_MODE_VALUE);
	return false;
}

// loadDarkMode().then((result) => console.log(result));

export async function editDarkMode(value) {
	await setItemInChromeStorage(DARK_MODE_KEY, value ? true : false);
}

// editDarkMode(true)

export async function loadApiKey() {
	const apiKey = await getItemInChromeStorage(API_KEY);

	if (apiKey === undefined) {
		await setItemInChromeStorage(API_KEY, null);
	}

	if (apiKey !== null) {
		return apiKey;
	}

	return null;
}

// loadApiKey().then((result) => console.log(result));

export async function editApiKey(value) {
	await setItemInChromeStorage(API_KEY, value ? value : null);
}

// editApiKey('abcdefg12341234');

export default {
	readDocument,
	readDocumentList,
	deleteDocument,
	editDocument,
	generateDocument,
	parseTextToJSON,
	getItemCountInChromeStorage,
};

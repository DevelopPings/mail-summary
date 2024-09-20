import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { date } from './util.js';
import {
	EXAMPLE_DATA,
	EXAMPLE_INPUT_TEXT,
	EXAMPLE_EDIT_DATA,
} from './dummies.js';

const fsp = fs.promises;

const SAVE_DIR_NAME = 'whale-mail';
const SAVE_LOCATION = 'Documents';
const EXTENSION_NAME = '.txt';
const FILENAME_LENGTH = 12;
const KEY_LIST = {
	TITLE: 'title',
	AUTHOR: 'author',
	SEND_TIME: 'sendTime',
	CREATE_TIME: 'createTime',
	SUMMARY: 'summary',
	TODO: 'todo',
	STATUS: 'status',
};
const FILE_SUFFIX = 'wm-';
const SETTINGS = 'settings';
const SETTINGS_FILENAME = SETTINGS + EXTENSION_NAME;
const DEFAULT_SETTINGS = 'KEY=null,DARK_MODE=false\n';

const homeDir = os.homedir();
const savePath = path.join(homeDir, SAVE_LOCATION, SAVE_DIR_NAME);

// 기본 환경 설정 생성
createIfNotExists(path.join(savePath, SETTINGS + EXTENSION_NAME), true);

// GPT 분석 후 문서 저장
export async function generateDocument(text) {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let randomString = '';

	for (let i = 0; i < FILENAME_LENGTH; i++) {
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

	const fileName = hashHex.substring(0, FILENAME_LENGTH);
	const newFilePath = path.join(
		savePath,
		FILE_SUFFIX + fileName + EXTENSION_NAME,
	);

	if (createIfNotExists(newFilePath)) {
		// GPT 분석 결과를 JSON으로 변환
		fs.writeFileSync(newFilePath, parseTextToJSON(text));
		console.log(newFilePath + '에 내용을 입력하였습니다.');
		return newFilePath;
	}
}

// generateDocument(EXAMPLE_INPUT_TEXT);

// 문서 읽기
export async function readDocument(id) {
	const fileName = FILE_SUFFIX + id + EXTENSION_NAME;
	const filePath = path.join(savePath, fileName);

	try {
		const data = await fsp.readFile(filePath, 'utf8');
		const parsedData = JSON.parse(data);
		parsedData.id = fileName
			.replace(FILE_SUFFIX, '')
			.replace(EXTENSION_NAME, '');

		return parsedData;
	} catch (err) {
		console.error('파일 읽기 중 에러 발생:', err);
	}
}

// readDocument('b84f5ffe7426').then((data) => console.log(data));

// 문서 목록 읽기
export async function readDocumentList() {
	const result = [];

	try {
		const fileNames = await fsp.readdir(savePath);

		const promises = fileNames.map(async (fileName) => {
			if (
				!fileName.startsWith(FILE_SUFFIX) ||
				fileName === SETTINGS_FILENAME
			) {
				return;
			}
			const id = fileName
				.replace(FILE_SUFFIX, '')
				.replace(EXTENSION_NAME, '');

			result.push(await readDocument(id));
		});

		await Promise.all(promises);
	} catch (err) {
		console.error('파일 목록을 가져오는 중 에러 발생: ', err);
	}

	return result;
}

// readDocumentList().then((doc) => console.log(doc));

// 문서 삭제
export async function deleteDocument(id) {
	const targetFileName = FILE_SUFFIX + id + EXTENSION_NAME;
	const targetPath = path.join(savePath, targetFileName);

	try {
		await fsp.access(targetPath);
		await fsp.unlink(targetPath);

		console.log(`파일을 성공적으로 삭제하였습니다: ${targetPath}`);
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.error(`파일 존재하지 않습니다: ${targetPath}`);
		} else {
			console.error(`파일 삭제 중 에러 발생: ${err}`);
		}
	}
}

// deleteDocument('b84f5ffe7426');

// 문서 수정
export async function editDocument(id, data) {
	const targetFileName = FILE_SUFFIX + id + EXTENSION_NAME;
	const targetPath = path.join(savePath, targetFileName);

	try {
		await fsp.access(targetPath);
		await fsp.writeFile(targetPath, JSON.stringify(data));

		console.log(`파일을 성공적으로 수정하였습니다: ${targetPath}`);
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.error(`파일이 존재하지 않습니다: ${targetPath}`);
		} else {
			console.error(`파일 수정 중 에러 발생: ${err}`);
		}
	}
}

// editDocument('b84f5ffe7426', EXAMPLE_EDIT_DATA);

// GPT 분석 결과를 JSON으로 변환
export function parseTextToJSON(text) {
	const lines = text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line);

	const data = {
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
	return JSON.stringify(data, null, 2);
}

// 파일 생성
function createIfNotExists(filePath, isSettings) {
	const dirPath = path.dirname(filePath);
	fs.mkdirSync(dirPath, { recursive: true });

	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, '', { flag: 'wx' });

		if (isSettings) {
			fs.writeFileSync(filePath, DEFAULT_SETTINGS);
		}

		console.log(filePath + `가 생성되었습니다.`);
		return true;
	} else {
		console.log('이미 존재하는 파일입니다: ' + filePath);
		return false;
	}
}

/*
function convertJSONToText(data) {
	let text = '';

	text += `[[title]]\n${data.title}\n\n`;
	text += `[[author]]\n${data.author}\n\n`;
	text += `[[sendTime]]\n${data.sendTime}\n\n`;
	text += `[[createTime]]\n${data.createTime}\n\n`;
	text += `[[summary]]\n${data.summary.join('\n')}\n\n`;
	text += `[[todo]]\n`;

	data.todo.forEach((item, index) => {
		text += `${index + 1}. ${item}\n`;
	});

	return text.trim();
}
*/

export default {
	readDocument,
	readDocumentList,
	deleteDocument,
	editDocument,
	generateDocument,
	parseTextToJSON,
};

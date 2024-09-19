import fs from 'fs';
import path from 'path';
import os from 'os';

const SAVE_DIR_NAME = 'whale-mail';
const SAVE_LOCATION = 'Documents';
const DEFAULT_SETTINGS = 'KEY=null,DARK_MODE=false\n';

const homeDir = os.homedir();
const savePath = path.join(homeDir, SAVE_LOCATION, SAVE_DIR_NAME);

const FILE_NAMES = {
	CHECK_LIST: 'checklist.csv',
	SURMMARY: 'summary.csv',
	DOCUMENT: 'document.csv',
	SETTINGS: 'settings.csv',
};

// 파일 세팅
Object.keys(FILE_NAMES)
	.map((key) => {
		return [path.join(savePath, FILE_NAMES[key]), key];
	})
	.forEach(createIfNotExists);

function createIfNotExists([filePath, key]) {
	const dirPath = path.dirname(filePath);
	fs.mkdirSync(dirPath, { recursive: true });

	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, '', { flag: 'wx' });
		console.log(`${filePath}가 생성되었습니다.`);

		if (key === 'SETTINGS') {
			fs.writeFileSync(filePath, DEFAULT_SETTINGS);
		}
	}
}

async function onHandleData(request) {
	if (request.message === '(2) handle data') {
		try {
			const crawlResult = await crawlContent();
			let data = {
				error: {},
			};

			if (isContentShort(crawlResult, data)) {
				showError(data.error);
				return;
			}

			const apiKey = await chrome.storage.local.get('API_KEY');

			data = await callChatGPT(apiKey['API_KEY'], crawlResult.content);

			if (data.error) {
				showError(data.error);
				return;
			}

			showResult(crawlResult, data.choices[0].message.content);
		} catch (error) {
			console.error(error);
		}
	}

	chrome.runtime.onMessage.removeListener(onHandleData);
}

function isContentShort(result, data) {
	if (result.content.length <= 10) {
		data.error.code = 'few_content';
		return true;
	}
	return false;
}

chrome.runtime.onMessage.addListener(onHandleData);

function showResult(result, response) {
	const [summaryPart, todoPart] = response.split('[todo]');
	const summary = summaryPart.replace('[summary]', '');
	const todo = todoPart || '';

	const data = {
		...result,
		summary,
		todo,
	};

	chrome.runtime.sendMessage({
		type: '(3) show result',
		data,
	});
}

function showError(error) {
	if (error.code === 'few_content') {
		error.code = '메일 내용 부족';
		error.message = '메일 내용이 너무 짧아 요약이 불가능합니다';
	} else if (error.code === 'invalid_api_key') {
		error.code = 'ChatGPT API 키 오류';
		error.message = '환경 설정에서 올바른 API 키를 입력해주세요';
	}

	chrome.runtime.sendMessage({
		type: 'show error',
		error,
	});
}

function crawlContent() {
	return new Promise((resolve, reject) => {
		const mail = {
			title: '',
			send: '',
			time: '',
			content: '',
		};

		try {
			if (location.host === 'mail.naver.com') {
				crawlNaverMail(mail);
			} else if (location.host === 'mail.google.com') {
				crawlGoogleMail(mail);
			}

			resolve(mail);
		} catch (error) {
			reject(`[크롤링 오류] ${error.message}`);
		}
	});
}

function crawlNaverMail(mail) {
	mail.title = document.querySelector(
		'.text > span > span:nth-child(2)',
	).textContent;

	mail.send = document
		.querySelector('.option_area > button')
		.textContent.split(/<|>/g)[1];

	const timeContent = document.querySelector('.info_area > span').textContent;
	mail.time = convertTime(timeContent);

	mail.content = document
		.querySelector('.mail_view_contents')
		.innerText.trim();
}

function crawlGoogleMail(mail) {
	document.querySelectorAll('.ajz')[0].click();
	document.querySelectorAll('.ajz')[0].click();

	mail.title = document.querySelector('.ha h2').textContent;

	mail.send = document
		.querySelectorAll('.ajv')[0]
		.querySelector('span.qu span.gD')
		.getAttribute('email');

	const timeContent = gmailTime();

	mail.time = convertTime(timeContent);

	mail.content = contentType();
}

function gmailTime() {
	document.querySelectorAll('.ajz')[0].click();
	document.querySelectorAll('.ajz')[0].click();

	// 처음 받을 때는 2번째인데
	let checktime = document
		.querySelectorAll('.ajv')[2]
		.querySelectorAll('span')[1].textContent;

	// 답장인 경우 3번째임
	if (isNaN(checktime.charAt(0))) {
		checktime = document
			.querySelectorAll('.ajv')[3]
			.querySelectorAll('span')[1].textContent;
	}

	return checktime;
}

function gmilText() {
	// 구글 답변이 여러번 오고간 경우 > 마지막 메일은 무조건 display = ''
	// 1개 == 마지막 메일(항상 열려있음)
	// 2개만 열려있는 경우 마지막이 아닌 메일 1순위
	// 3개 이상 열려있는 경우 마지막 메일 1순위 > 초반 메일은 이미 본 내용일거라고 가정 > 1개만 열려있는것과 같음
	//document.querySelectorAll('.adn.ads')[0].querySelector('.a3s.aiL div div').innerHTML.replace(/<\/?[^>]+(>|$)|\s+/g, '')
	let text = '';
	const opennum = document.querySelectorAll('.adn.ads').length; // 열려있는 개수
	let state = document.querySelectorAll('.adn.ads');

	if (opennum == 2) {
		for (let i = 0; i < opennum; i++) {
			text = state[i]
				.querySelector('.a3s.aiL')
				.innerText.replace(/<\/?[^>]+(>|$)|\s+|&nbsp;/g, '');
			if (text != '') return text;
		}
	}
	return state[0]
		.querySelector('.a3s.aiL')
		.innerText.replace(/<\/?[^>]+(>|$)|\s+|&nbsp;/g, '');
}

// 네이버 메일은 한 페이지에 한개의 메일만 있음
function contentType() {
	let text = '';
	let box = '';
	let result = '';
	// 1개 또는 3개 이상은 마지막 메일
	text = gmilText();

	// text 형태가 아닌 광고글
	if (document.querySelector('center tbody tr' != null)) {
		box = document
			.querySelector('center tbody tr')
			.innerHTML.replace(/<\/?[^>]+(>|$)|\s+/g, '');
	}
	if (text == '') {
		// 피그마와 같이 사이트 사용한 경우
		let list = document.querySelectorAll('.a3s.aiL div div');

		list.forEach((item) => {
			result =
				result +
				'\n' +
				item.innerHTML.replace(/<\/?[^>]+(>|$)|\s+\s+|&nbsp;/g, '');
			// console.log(
			// 	item.innerHTML.replace(/<\/?[^>]+(>|$)|\s+\s+|&nbsp;/g, ''),
			// );
		});
	}

	if (box == '') {
		if (text.length < result.length) {
			return result;
		}
		return text;
	}
	return box;
}

function convertTime(timeString) {
	const isAfternoon = timeString.includes('오후');
	const isMorning = timeString.includes('오전');

	if (!isAfternoon && !isMorning) {
		return timeString;
	}

	const timeParts = timeString
		.replace(/[^0-9]/g, ',')
		.replace(/,+/g, ',')
		.split(',')
		.map(Number);
	console.log('convertTime', timeParts);
	const [year, month, day, hour, minute] = timeParts;
	return `${year}-${month}-${day} ${(hour % 12) + (isAfternoon ? 12 : 0)}:${minute}`;
}

async function callChatGPT(api, question) {
	const prompt =
		'전달 받은 txt를 summary, todo로 재구성한다. \n' +
		'아래는 재구성을 할 때 따라야하는 규칙이다. \n' +
		'전달 받은 txt가 내용이 없거나 10글자 이하일 때 summary 결과에 `내용이 적어 요약할 수 없습니다.`라고 결과를 표기한다. \n' +
		'summary 내용이 `내용이 적어 요약할 수 없습니다.`일 때는 todo를 값을 출력하지않는다. \n' +
		'-ㅂ니다.로 문장을 끝낸다. \n' +
		'txt 중 이름, 날짜, 시간, 전화번호, 숫자, 필수, 해주세요, 가능, 마감, 부탁, 안내, 일시, 장소, 주소, 진행, 방법, 확인이라는 단어가 있는 문장은 중요한 내용으로 고려하여 summary, todo 내용에 필수 포함한다. \n' +
		'날짜, 시간이 있는 경우 todo에 필수로 요약하지 않지 않고 그대로 넣는다. \n' +
		'모든 문장 앞에는 숫자로 줄번호를 표기한다. \n' +
		'summary 문장의 최대 글자 수는 50글자, todo 문장의 최대 글자 수는 30글자로 한다. \n' +
		'summary의 문장 수는 최소 1개 ~ 최대 5개로 요약한다. \n' +
		'todo의 문장 수는 최소 0개 ~ 최대 5개로 요약한다. \n' +
		'summary와 todo에는 특수문자(*)를 포함하지 않는다. \n' +
		'summary결과는  [summary]로 머릿말을 시작한다. \n' +
		'todd결과는 [todo]로 머릿말을 시작한다.\n' +
		'chatGPT 답변은 결과물만 출력한다. 대화형 문구를 출력하지 않는다.';

	try {
		const response = await fetch(
			'https://api.openai.com/v1/chat/completions',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${api}`,
				},
				body: JSON.stringify({
					model: 'gpt-4o-mini',
					messages: [{ role: 'user', content: question + prompt }],
				}),
			},
		);

		return await response.json();
	} catch (error) {
		console.error(error.message);
	}
}

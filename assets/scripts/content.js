chrome.runtime.onMessage.addListener(async (request) => {
	if (request.message === '(1) handleData') {
		try {
			const crawlResult = await crawlContent();
			const apiKey = await chrome.storage.local.get('API_KEY');
			if (!apiKey) {
				console.error(
					'[API KEY 오류] API KEY가 등록되어 있지 않습니다.',
				);
			}
			const data = await callChatGPT(
				apiKey['API_KEY'],
				crawlResult.content,
			);

			if (data.error) {
				error(data.error);
				return;
			}

			present(crawlResult, data.choices[0].message.content);
		} catch (error) {
			console.error(error);
		}
	}
});

function present(result, response) {
	const [summaryPart, todoPart] = response.split('[todo]');
	const summary = summaryPart.replace('[summary]', '');
	const todo = todoPart || '';

	const data = {
		...result,
		summary,
		todo,
	};

	chrome.runtime.sendMessage({
		type: '(2) present',
		data,
	});
}

function error(error) {
	if (error.code === 'invalid_api_key') {
		error.code = 'ChatGPT API 키 오류';
		error.message = '환경 설정에서 올바른 API 키를 입력해주세요';
	}

	chrome.runtime.sendMessage({
		type: 'error',
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
	).innerHTML;

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

	mail.title = document.querySelector('.ha h2').innerHTML;

	mail.send = document
		.querySelectorAll('.ajv')[0]
		.querySelector('span.qu span.gD')
		.getAttribute('email');

	const timeContent = document
		.querySelectorAll('.ajv')[2]
		.querySelectorAll('span')[1].textContent;

	mail.time = convertTime(timeContent);

	mail.content = document
		.querySelector('.a3s.aiL div div')
		.innerHTML.replace(/<\/?[^>]+(>|$)|\s+/g, '');
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

	const [year, month, day, hour, minute] = timeParts;
	return `${year}-${month}-${day} ${hour + (isAfternoon ? 12 : 0)}:${minute}`;
}

async function callChatGPT(api, question) {
	const prompt =
		'메일 내용을 최소 1개 ~ 최대 5줄로 요약하고 각 줄은 최소 10글자에서 최대 50글자로 요약해야 한다.' +
		'메일을 todo로 만들어주는데 최소 0개에서 최대 10개로 만들어주고 최소 10글자에서 최대 50글자 이내로 요약해야한다.' +
		'todo와 summary는 이름, 날짜, 시간, 전화번호, 숫자, 필수, 해주세요, 가능, 마감, 부탁, 안내, 일시, 장소, 주소, 진행, 방법, 확인이라는 글자가 있는 문구가 있는 내용은 중요한 내용으로 생각하고 필수로 넣어서 요약하거나 todo로 출력해야한다.' +
		'장소, 주소는 요약하지 말고 그대로 넣어서 요약해야한다. 요약은 [summary]로 머릿말을 시작하고, todo는 [todo]로 머릿말을 시작한다.' +
		'각 줄 앞에는 숫자로 표시해서 출력한다.';

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

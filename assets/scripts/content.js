const CHATGPT_API_KEY =
	'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'; // <- 절대 레포에 올리지 마세요
const CHATGPT_MODEL = 'gpt-4o-mini';
const prompt =
	'메일 내용을 최소 1개 ~ 최대 5줄로 요약하고 각 줄은 최소 10글자에서 최대 50글자로 요약해야 한다.' +
	'메일을 todo로 만들어주는데 최소 0개에서 최대 10개로 만들어주고 최소 10글자에서 최대 50글자 이내로 요약해야한다.' +
	'todo와 summary는 이름, 날짜, 시간, 전화번호, 숫자, 필수, 해주세요, 가능, 마감, 부탁, 안내, 일시, 장소, 주소, 진행, 방법, 확인이라는 글자가 있는 문구가 있는 내용은 중요한 내용으로 생각하고 필수로 넣어서 요약하거나 todo로 출력해야한다.' +
	'장소, 주소는 요약하지 말고 그대로 넣어서 요약해야한다. 요약은 [summary] 로 머릿말을 시작하고, todo는 [todo]로 머릿말을시작한다.' +
	'각 줄 앞에는 숫자로 표시해서 출력한다.';

async function callChatGPT(question) {
	try {
		const response = await fetch(
			'https://api.openai.com/v1/chat/completions',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${CHATGPT_API_KEY}`,
				},
				body: JSON.stringify({
					model: CHATGPT_MODEL,
					messages: [
						{
							role: 'user',
							content: question + prompt,
						},
					],
				}),
			},
		);

		if (!response.ok) {
			throw new Error('네트워크 응답이 좋지 않습니다');
		}

		const data = await response.json();
		return data.choices[0].message.content;
	} catch (error) {
		console.error(error.message);
	}
}

function crawlContent() {
	return new Promise((resolve, reject) => {
		let mail = {
			title: '',
			send: '',
			time: '',
			content: '',
		};

		let mailTitle = '';
		let mailSend = '';
		let mailTime = '';
		let mailContent = '';

		setTimeout(() => {
			try {
				if (location.host == 'mail.naver.com') {
					// 네이버
					// 제목
					mailTitle = document.querySelectorAll(
						'.text > span > span:nth-child(2)',
					)[0].innerHTML;

					// 보낸 사람
					mailSend = document
						.querySelectorAll('.option_area > button')[0]
						.textContent.split(/<|>/g)[1];

					// 시간
					mailTime = document
						.querySelectorAll('.info_area > span')[0]
						.textContent.replace(/[^0-9]/g, ',')
						.replace(/,+/g, ',');

					// 내용
					mailContent = document
						.querySelectorAll('.mail_view_contents')[0]
						.innerText.trim();

					mail = {
						title: mailTitle,
						send: mailSend,
						time: mailTime,
						content: mailContent,
					};
				} else if (location.host == 'mail.google.com') {
					// 구글
					// 제목
					document.querySelectorAll('.ajz')[0].click();
					document.querySelectorAll('.ajz')[0].click();

					const getTitle = () => {
						mailTitle = document
							.querySelectorAll('.ajv')[3]
							.querySelectorAll('td')[1].innerText;
					};

					// 보낸 사람
					const getSend = () => {
						mailSend = document
							.querySelectorAll('.ajv')[0]
							.querySelectorAll('span.qu')[0]
							.querySelector('span.gD')
							.getAttribute('email');
					};

					// 시간
					const getTime = () => {
						mailTime = document
							.querySelectorAll('.ajv')[2]
							.querySelectorAll('span')[1]
							.textContent.replace(/[^0-9]/g, ',')
							.replace(/,+/g, ',');
					};

					// 내용
					const getContent = () => {
						mailContent =
							document.querySelectorAll('.a3s.aiL div div')[0]
								.innerHTML;
						mailContent = mailContent.replace(
							/<\/?[^>]+(>|$)|\s+/g,
							'',
						);
					};

					getTitle();
					getSend();
					getTime(); // 날짜랑 시분 가져오기
					getContent();

					mail = {
						title: mailTitle,
						send: mailSend,
						time: mailTime,
						content: mailContent,
					};
				}
				// time 년,월,일,시,분 형태로
				let timeArr = new Array();
				timeArr = mail.time.split(',');
				mail.time =
					timeArr[0] +
					'-' +
					timeArr[1] +
					'-' +
					timeArr[2] +
					' ' +
					timeArr[3] +
					':' +
					timeArr[4];
				resolve(mail);
			} catch (error) {
				reject(`Error occurred during crawling: ${error.message}`);
			}
		}, 1000);
	});
}
// 메시지 수신
chrome.runtime.onMessage.addListener(async (message) => {
	if (message.action === 'Whale-Mail') {
		try {
			const result = await crawlContent();
			// 메일 크롤링 결과

			console.log(result.title);
			console.log(result.send);
			console.log(result.time);
			console.log(result.content);
			// chrome.action.openPopup();
			const chatGPTResponse = await callChatGPT(result.content);

			const chatGPTResponseSummary = chatGPTResponse
				.split('[todo]')[0]
				.replace('[summary]', '');
			const chatGPTResponseTodo = chatGPTResponse.split('[todo]')[1];
			// AI 결과
			console.log(chatGPTResponseSummary);
			console.log(chatGPTResponseTodo);
			chrome.runtime.sendMessage(
				{
					type: 'summaryMail',
					payload: {
						message:
							'[[title]]' +
							result.title +
							'[[author]]' +
							result.send +
							'[[sendTime]]' +
							result.time +
							'[[summary]]' +
							chatGPTResponseSummary +
							'[[todo]]' +
							chatGPTResponseTodo,
					},
				},
				(response) => {
					if (chrome.runtime.lastError) {
						console.error(
							'Error:',
							chrome.runtime.lastError.message,
						);
					} else {
						console.log(
							'message received from sendResponse: ' +
								response.message,
						);
					}
				},
			);
		} catch (error) {
			console.error(error);
		}
	}
});

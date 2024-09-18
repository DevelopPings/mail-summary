const CHATGPT_API_KEY = 'your_chat_gpt_api_key'; // <- 절대 레포에 올리지 마세요
const CHATGPT_MODEL = 'gpt-4o-mini';

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
							content: question,
						},
					],
				}),
			},
		);

		if (!response.ok) {
			throw new Error('네트워크 응답이 좋지 않습니다');
		}

		const data = await response.json();
		//TODO: do something with data
	} catch (error) {
		console.error(error.message);
	}
}

function crawlContent() {
	return new Promise((resolve) => {
		let mail = {
			title: '',
			send: '',
			time: '',
			content: '',
		};
		setTimeout(() => {
			if (location.host == 'mail.naver.com') {
				// 네이버
				// 제목
				const mailTitle = document.querySelectorAll(
					'.text > span > span:nth-child(2)',
				)[0].innerHTML;

				// 보낸 사람
				const mailSend = document.querySelectorAll(
					'.option_area > button',
				)[0].innerHTML;

				// 시간
				const mailTime =
					document.querySelectorAll('.info_area > span')[0].innerHTML;

				// 내용
				const mailContent = document
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

				let mailTitle;
				const getTitle = () => {
					mailTitle = document
						.querySelectorAll('.ajv')[3]
						.querySelectorAll('td')[1].innerText;
				};

				// 받는 사람

				let mailSend;
				const getSend = () => {
					mailSend = document
						.querySelectorAll('.ajv')[0]
						.querySelectorAll('span.qu')[0].innerText;
				};

				// 시간
				let mailTime;
				const getTime = () => {
					mailTime = document
						.querySelectorAll('.ajv')[2]
						.querySelectorAll('span')[1].innerHTML;
				};

				// 내용 - 구글은 innerHTML에 태그가 많음
				let mailContent;
				const getContent = () => {
					let content =
						document.querySelectorAll('.a3s.aiL div div')[0]
							.innerHTML;
					// content = content.replace(
					// 	/<div style="font-size:14px;font-family:NanumGothic,나눔고딕,sans-serif">|<p style="font-size:10pt;font-family:NanumGothic,나눔고딕,sans-serif">|<span style="font-size:11pt;font-family:NanumGothic,나눔고딕,sans-serif">/g,
					// 	'',
					// );
					content = content.replace(
						/<\/span>|<\/p>|<\/div>|<[^>]*>|\s+/g,
						'',
					);
					mailContent = content;
				};

				getTitle();
				getSend();
				getTime();
				getContent();

				mail = {
					title: mailTitle,
					send: mailSend,
					time: mailTime,
					content: mailContent,
				};
			}

			resolve(mail);
		}, 1000);
	});
}

// 메시지를 수신하여 크롤링을 수행
chrome.runtime.onMessage.addListener(async (message) => {
	if (message.action === 'Whale-Mail') {
		const result = await crawlContent();
		console.log(result.content);
	}
});

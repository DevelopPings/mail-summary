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

			const mail = {
				title: mailTitle,
				send: mailSend,
				time: mailTime,
				content: mailContent,
			};

			console.log(mail);
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

			// 내용
			let mailContent;
			const getContent = () => {
				let mailContentArray = document
					.querySelectorAll('.Bk div div div div.gs div div div')[2]
					.querySelectorAll('div div div span');
				for (let i = 0; i < mailContentArray.length; i++) {
					mailContent += mailContentArray[i].innerHTML;
				}
			};

			getTitle();
			getSend();
			getTime();
			getContent();

			const mail = {
				title: mailTitle,
				send: mailSend,
				time: mailTime,
				content: mailContent,
			};

			console.log(mail);
		}
	}, 1000);
}

// 메시지를 수신하여 크롤링을 수행
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'Whale-Mail') {
		crawlContent();
	}
});

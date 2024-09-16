function crawlContent() {
	setTimeout(() => {
		if (location.host == 'mail.naver.com') {
			// 네이버
			// 제목
			const mailTitle = document.querySelectorAll(
				'.text > span > span:nth-child(2)',
			);

			const titleArray = Array.from(mailTitle).map(
				(subject) => subject.textContent,
			);

			// 보낸 사람
			const mailSend = document.querySelectorAll('.option_area > button');

			const sendArray = Array.from(mailSend).map(
				(subject) => subject.textContent,
			);

			// 시간
			const mailTime = document.querySelectorAll('.info_area > span');

			const timeArray = Array.from(mailTime).map(
				(subject) => subject.textContent,
			);

			// 내용
			const mailContent = document.querySelectorAll(
				'.mail_view_contents',
			);

			const contentArray = Array.from(mailContent).map(
				(subject) => subject.textContent,
			);

			const mailContent = {
				title: titleArray[0],
				send: sendArray[0],
				time: timeArray[0],
				content: contentArray[0].trim(),
			};

			console.log(mailContent);
		} else if (location.host == 'mail.google.com') {
			// 구글
			// 제목
			const mailTitle = document.querySelectorAll('.ha > h2');

			const headerArray = Array.from(mailTitle).map(
				(subject) => subject.textContent,
			);

			// 받는 사람
			const mailSend = document.querySelectorAll(
				'.UszGxc.ajv td:nth-child(2) span span span:nth-child(3)',
			);

			const sendArray = Array.from(mailSend).map(
				(subject) => subject.textContent,
			);

			// 시간

			// 내용

			const mailContent = {
				title: titleArray[0],
				send: sendArray[0],
				time: timeArray[0],
				content: contentArray[0].trim(),
			};
		}
	}, 1000);
}

// 메시지를 수신하여 크롤링을 수행
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'Whale-Mail') {
		crawlContent();
	}
});

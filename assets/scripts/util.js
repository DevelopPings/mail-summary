// 날짜 생성
export const date = (data, pattern) => {
	let temp = new Date(data);

	if (isNaN(temp)) {
		let now = new Date();
		let timezone = now.getTimezoneOffset();
		let abs = Math.abs(timezone);
		temp = new Date(
			data.replace(' ', 'T') +
				(timezone < 0 ? '+' : '-') +
				attachZero(Math.floor(abs / 60)) +
				':' +
				attachZero(Math.floor(abs % 60)),
		);
	}

	const yyyy = temp.getFullYear();
	const HH = temp.getHours();
	const dateObject = {
		yyyy: yyyy,
		MM: attachZero(temp.getMonth() + 1),
		dd: attachZero(temp.getDate()),
		yy: yyyy.toString().substr(2, 4),
		HH: attachZero(HH),
		hh: attachZero(HH % 12),
		mm: attachZero(temp.getMinutes()),
		ss: attachZero(temp.getSeconds()),
		day: day(temp),
		month: month(temp),
		tt: HH / 12 > 1 ? '오후' : '오전',
		TT: HH / 12 > 1 ? 'PM' : 'AM',
	};

	Object.keys(dateObject).forEach(function (key) {
		pattern = pattern.replace(key, dateObject[key]);
	});

	return pattern;
};

const day = (date) => {
	switch (date.getDay()) {
		case 0:
			return 'SUN';
		case 1:
			return 'MON';
		case 2:
			return 'TUE';
		case 3:
			return 'WED';
		case 4:
			return 'THU';
		case 5:
			return 'FRI';
		case 6:
			return 'SAT';
	}
};

const month = (date) => {
	switch (date.getMonth()) {
		case 0:
			return 'January';
		case 1:
			return 'February';
		case 2:
			return 'March';
		case 3:
			return 'April';
		case 4:
			return 'May';
		case 5:
			return 'June';
		case 6:
			return 'July';
		case 7:
			return 'August';
		case 8:
			return 'September';
		case 9:
			return 'October';
		case 10:
			return 'November';
		case 11:
			return 'December';
	}
};
const attachZero = (data) => {
	let temp = Number(data);
	if (temp < 10 && temp >= 0) {
		return '0' + data;
	} else {
		return data;
	}
};

export default {
	date,
};

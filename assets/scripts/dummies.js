export const EXAMPLE_DATA = {
	title: '[쌍용교육센터] (6/19개강과정) 2024년 06월 19일 개강 교육과정 및 서류제출 안내',
	author: 'sist1985@naver.com',
	sendTime: '2024-06-18',
	createTime: '2024-09-04',
	summary: [
		'개강 후 수업 진행 방식은 대면 수업입니다.',
		'오리엔테이션은 2024년 6월 18일 화요일 오후 04:00~에 진행됩니다.',
		'제소하 품고후 4터 12의 6 2 스스 남구 테헤란로 192, 6출',
		'출석 체크는 센터 지문 인식기 활용하며 진행됩니다.',
	],
	todo: [
		{
			content: '6월 18일 오리엔테이션 참석 부탁드립니다.',
			isDone: false,
		},
		{
			content: '지문 등록을 위한 시간에 참석해주세요.',
			isDone: false,
		},
		{
			content: '출결 확인을 위해 HRD-NET 어플 다운로드 해주세요.',
			isDone: false,
		},
		{
			content: '준비물로 개인 클라우드 또는 USB 백업 필수입니다.',
			isDone: false,
		},
		{
			content: '대면 수업시 Windows 운영체제 기반으로 진행됩니다.',
			isDone: false,
		},
		{
			content: '강의실 PC 사용시 초기화된 상태로 세팅해주세요.',
			isDone: false,
		},
		{
			content: '오리엔테이션 불참시 02-3482-4632로 연락 바랍니다.',
			isDone: false,
		},
		{
			content: '주소: 서울시 강남구 테헤란로 132, 8층을 확인해주세요.',
			isDone: false,
		},
		{
			content: '대중교통 이용 권장합니다. 주차 지원은 머렵습니다.',
			isDone: false,
		},
		{
			content: '수업 중 중요한 안내 사항에 대해 숙지해주세요.',
			isDone: false,
		},
	],
	status: {
		done: 0,
		todo: 10,
	},
};

export const EXAMPLE_EDIT_DATA = {
	title: '[쌍용교육센터] (6/19개강과정) 2024년 06월 19일 개강 교육과정 및 서류제출 안내',
	author: 'sist1985@naver.com',
	sendTime: '2024-06-18',
	createTime: '2024-09-04',
	summary: [
		'개강 후 수업 진행 방식은 대면 수업입니다.',
		'오리엔테이션은 2024년 6월 18일 화요일 오후 04:00~에 진행됩니다.',
		'제소하 품고후 4터 12의 6 2 스스 남구 테헤란로 192, 6출',
		'출석 체크는 센터 지문 인식기 활용하며 진행됩니다.',
	],
	todo: [
		{
			content: '6월 18일 오리엔테이션 참석 부탁드립니다.',
			isDone: true,
		},
		{
			content: '지문 등록을 위한 시간에 참석해주세요.',
			isDone: true,
		},
		{
			content: '출결 확인을 위해 HRD-NET 어플 다운로드 해주세요.',
			isDone: true,
		},
		{
			content: '준비물로 개인 클라우드 또는 USB 백업 필수입니다.',
			isDone: false,
		},
		{
			content: '대면 수업시 Windows 운영체제 기반으로 진행됩니다.',
			isDone: false,
		},
		{
			content: '강의실 PC 사용시 초기화된 상태로 세팅해주세요.',
			isDone: false,
		},
		{
			content: '오리엔테이션 불참시 02-3482-4632로 연락 바랍니다.',
			isDone: false,
		},
		{
			content: '주소: 서울시 강남구 테헤란로 132, 8층을 확인해주세요.',
			isDone: false,
		},
		{
			content: '대중교통 이용 권장합니다. 주차 지원은 머렵습니다.',
			isDone: false,
		},
		{
			content: '수업 중 중요한 안내 사항에 대해 숙지해주세요.',
			isDone: false,
		},
	],
	status: {
		done: 3,
		todo: 7,
	},
};

export const EXAMPLE_INPUT_TEXT = `[[title]]
[쌍용교육센터] (6/19개강과정) 2024년 06월 19일 개강 교육과정 및 서류제출 안내

[[author]]
sist1985@naver.com

[[sendTime]]
2024-06-18

[[summary]]
개강 후 수업 진행 방식은 대면 수업입니다.

오리엔테이션은 2024년 6월 18일 화요일 오후 04:00~에 진행됩니다.

제소하 품고후 4터 12의 6 2 스스 남구 테헤란로 192, 6출

출석 체크는 센터 지문 인식기 활용하며 진행됩니다.

[[todo]]
1. 6월 18일 오리엔테이션 참석 부탁드립니다.

2. 지문 등록을 위한 시간에 참석해주세요.

3. 출결 확인을 위해 HRD-NET 어플 다운로드 해주세요.

4. 준비물로 개인 클라우드 또는 USB 백업 필수입니다.

5. 대면 수업시 Windows 운영체제 기반으로 진행됩니다.

6. 강의실 PC 사용시 초기화된 상태로 세팅해주세요.

7. 오리엔테이션 불참시 02-3482-4632로 연락 바랍니다.

8. 주소: 서울시 강남구 테헤란로 132, 8층을 확인해주세요.

9. 대중교통 이용 권장합니다. 주차 지원은 머렵습니다.

10. 수업 중 중요한 안내 사항에 대해 숙지해주세요.
`;

export default {
	EXAMPLE_DATA,
	EXAMPLE_EDIT_DATA,
	EXAMPLE_INPUT_TEXT,
};

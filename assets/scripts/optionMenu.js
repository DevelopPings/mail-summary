export default function optionMenu() {
	const optionButtons = document.querySelectorAll('.option-button');
	const optionMenuBackground = document.querySelector('.option-menu');
	const [optionEdit, optionDelete] =
		optionMenuBackground.firstElementChild.children;

	const hideOptionMenu = () => (optionMenuBackground.style.display = 'none');

	// 옵션 메뉴 클릭
	const onClickOptionMenu = (callback) => {
		optionButtons.forEach((el) =>
			el.addEventListener('click', () => {
				showOptionMenu(
					el.getBoundingClientRect(),
					el.parentElement.parentElement,
				);
			}),
		);

		const showOptionMenu = (rect, targetElement) => {
			if (optionMenuBackground.style.display === 'block') return;

			if (callback) callback(targetElement);

			optionMenuBackground.style.display = 'block';
			const optionMenuButton = optionMenuBackground.firstElementChild;

			const buttonWidth = optionMenuButton.offsetWidth;
			const buttonHeight = optionMenuButton.offsetHeight;

			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			optionMenuButton.style.top = `${centerY}px`;
			optionMenuButton.style.left = `${centerX - buttonWidth}px`;

			// 메뉴창이 뷰포트 밑으로 나갈시, 위로 출력
			const clientHeight = document.documentElement.clientHeight;

			if (
				parseFloat(optionMenuButton.style.top) + buttonHeight >
				clientHeight
			) {
				optionMenuButton.style.top = `${centerY - buttonHeight}px`;
			}
		};
	};

	// 수정 버튼 클릭
	const onClickEdit = (callback) => {
		optionEdit.addEventListener('click', (event) => {
			event.stopPropagation();
			if (callback) callback(hideOptionMenu);
		});
	};

	// 삭제 버튼 클릭
	const onClickDelete = (callback) => {
		optionDelete.addEventListener('click', (event) => {
			event.stopPropagation();
			if (callback) callback(hideOptionMenu);
		});
	};

	// 바깥 부분 클릭 (꺼짐)
	const onClickOutOption = (callback) => {
		optionMenuBackground.addEventListener('click', (event) => {
			event.stopPropagation();
			if (callback) callback();
			hideOptionMenu();
		});
	};

	return {
		onClickOptionMenu,
		onClickEdit,
		onClickDelete,
		onClickOutOption,
	};
}

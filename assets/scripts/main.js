import storage, {
	deleteDocument,
	editApiKey,
	editDocument,
	getItemCountInChromeStorage,
	loadApiKey,
	readDocument,
} from './storage.js';
import { date } from './util.js';
import optionMenu from './optionMenu.js';

const NO_TITLE_TEXT = '제목 없음';

const inputFocusArea = document.querySelector('.focus-area');

const warningModal = document.querySelector('.warning-modal');
const warningModalContent = document.querySelector('.warning-modal-content');
const warningModalDelete = warningModal.getElementsByClassName('delete')[0];
const warningModalCancel = warningModal.getElementsByClassName('cancel')[0];

const settingsButton = document.querySelector('.main-header-settings');
const settingsModal = document.querySelector('.settings-modal');
const settingsModalContent = document.querySelector('.settings-modal-content');
const settingsModalInput = document.querySelector('.settings-key-input');
const settingsModalSave = settingsModal.getElementsByClassName('save')[0];
const settingsModalCancel = settingsModal.getElementsByClassName('cancel')[0];

const editFooter = document.querySelector('.edit-footer');
const footerSave = editFooter.getElementsByClassName('save')[0];
const footerReset = editFooter.getElementsByClassName('reset')[0];

const noContent = document.querySelector('.no-content');
const listElement = document.querySelector('.list');

let itemCount = 0;

storage
	.readDocumentList()
	.then((result) => {
		itemCount = Object.keys(result).length;
		if (itemCount === 0) {
			showNoContent();
		} else {
			showContent();

			for (const key in result) {
				appendItem(result[key]);
			}

			const option = optionMenu();
			handleOptionMenu(option);
		}

		updateHeader(itemCount);
	})
	.catch((error) => console.error('[목록 로드 오류] ' + error));

const showNoContent = () => {
	listElement.style.display = 'none';
	noContent.style.display = 'flex';
};

const showContent = () => {
	listElement.style.display = 'block';
	noContent.style.display = 'none';
};

const appendItem = ({ id, title, sendTime, status: { done, todo } }) => {
	const renderCheckCount = () => {
		const checkCountFragment = document.createDocumentFragment();

		if (done === 0 && todo === 0) {
			return checkCountFragment;
		}

		const createListItem = (className, count) => {
			const li = document.createElement('li');
			li.className = className;
			li.textContent = count;
			return li;
		};

		if (done === 0) {
			checkCountFragment.appendChild(
				createListItem('unfinish-task', todo),
			);
		} else if (todo === 0) {
			checkCountFragment.appendChild(createListItem('finish-task', done));
		} else {
			checkCountFragment.appendChild(createListItem('finish-task', done));
			checkCountFragment.appendChild(
				createListItem('unfinish-task', todo),
			);
		}

		return checkCountFragment;
	};

	const renderDate = () => {
		const inputDate = new Date(sendTime);
		const currentYear = new Date().getFullYear();

		if (inputDate.getFullYear() < currentYear) {
			return date(inputDate, 'yy.MM.dd');
		}
		return date(inputDate, 'MM.dd');
	};

	const listItem = document.createElement('li');
	listItem.className = 'list-item';
	listItem.setAttribute('data-id', id);

	const titleElement = document.createElement('h2');
	titleElement.className =
		done > 0 && todo === 0 ? 'item-title finished' : 'item-title';
	titleElement.textContent = title || NO_TITLE_TEXT;

	const editInput = document.createElement('input');
	editInput.className = 'edit-title-input';
	editInput.type = 'text';
	editInput.name = 'title';
	editInput.id = 'title';
	editInput.value = title || '';

	const itemInfo = document.createElement('div');
	itemInfo.className = 'item-info';

	const checkCountList = document.createElement('ul');
	checkCountList.className = 'check-count';
	checkCountList.appendChild(renderCheckCount());

	const timeElement = document.createElement('time');
	timeElement.className = 'send-time';
	timeElement.setAttribute('datetime', sendTime);
	timeElement.textContent = renderDate(sendTime);

	const optionButton = document.createElement('button');
	optionButton.className = 'option-button';

	itemInfo.appendChild(checkCountList);
	itemInfo.appendChild(timeElement);
	itemInfo.appendChild(optionButton);

	listItem.appendChild(titleElement);
	listItem.appendChild(editInput);
	listItem.appendChild(itemInfo);

	listItem.addEventListener('click', (event) => {
		event.stopPropagation();
		location.href = 'detail.html?id=' + id;
	});

	listElement.insertAdjacentElement('beforeend', listItem);
};

// 이벤트 처리
const currentOption = {
	targetElement: null,
	inputElement: null,
	titleElement: null,
};

const setCurrentOption = (
	targetElement = null,
	inputElement = null,
	titleElement = null,
) => {
	currentOption.targetElement = targetElement;
	currentOption.inputElement = inputElement;
	currentOption.titleElement = titleElement;
};

const handleOptionMenu = (option) => {
	option.onClickOptionMenu((targetElement) => {
		setCurrentOption(
			targetElement,
			targetElement.getElementsByClassName('edit-title-input')[0],
			targetElement.getElementsByClassName('item-title')[0],
		);
	});

	option.onClickEdit((hideOptionMenu) => {
		startEditMode(hideOptionMenu);
	});

	option.onClickDelete((hideOptionMenu) => showDeleteModal(hideOptionMenu));
	option.onClickOutOption(() => warningModal.classList.remove('active'));
};

const focusLastCharInput = () => {
	const end = currentOption.inputElement.value.length;
	currentOption.inputElement.setSelectionRange(end, end);
	currentOption.inputElement.focus();
};

const startEditMode = (hideOptionMenu) => {
	currentOption.titleElement.style.display = 'none';
	currentOption.inputElement.style.display = 'block';
	inputFocusArea.style.display = 'block';
	editFooter.style.display = 'flex';

	const editFooterSpace = document.createElement('div');
	editFooterSpace.className = 'edit-footer-space';
	listElement.appendChild(editFooterSpace);

	currentOption.inputElement.addEventListener('click', (event) => {
		event.stopPropagation();
	});

	currentOption.inputElement.addEventListener('keydown', (event) => {
		saveOnEnter(event);
	});

	focusLastCharInput();
	if (hideOptionMenu) hideOptionMenu();
};

const endEditMode = (hideOptionMenu) => {
	currentOption.inputElement.style.display = 'none';
	currentOption.titleElement.style.display = 'block';
	inputFocusArea.style.display = 'none';
	editFooter.style.display = 'none';

	const editFooterSpace = document.querySelector('.edit-footer-space');

	if (editFooterSpace) {
		editFooterSpace.remove();
	}

	currentOption.inputElement.removeEventListener('keydown', saveOnEnter);
	if (hideOptionMenu) hideOptionMenu();
};

// 수정 인풋 요소 바깥 영역 클릭
if (inputFocusArea) {
	inputFocusArea.addEventListener('click', (event) => {
		event.stopPropagation();
		endEditMode();
	});
}

// 삭제 확인 모달
warningModal.addEventListener('click', (event) => {
	event.stopPropagation();
	hideWarningModal();
});

warningModalContent.addEventListener('click', (event) => {
	event.stopPropagation();
});

warningModalCancel.addEventListener('click', (event) => {
	event.stopPropagation();
	hideWarningModal();
});

warningModalDelete.addEventListener('click', (event) => {
	event.stopPropagation();
	try {
		const id = currentOption.targetElement.dataset.id;
		if (id) {
			handleDelete(id);
			hideWarningModal();
		}
	} catch (error) {
		console.error('[삭제 이벤트 오류] ' + error);
	}
});

const handleDelete = async (id) => {
	await deleteDocument(id);
	currentOption.targetElement.remove();
	const itemCount = await getItemCountInChromeStorage();
	await updateHeader(itemCount);

	if (itemCount === 0) {
		showNoContent();
	}
};

const showDeleteModal = (hideOptionMenu) => {
	hideOptionMenu();
	showWarningModal();
};

const showWarningModal = () => {
	warningModal.style.display = 'flex';
	setTimeout(() => {
		warningModal.classList.add('active');
	});
};

const hideWarningModal = () => {
	warningModal.style.display = 'none';
	setTimeout(() => {
		warningModal.classList.remove('active');
	});
};

// 설정 모달
const updateSaveButtonState = () => {
	settingsModalSave.disabled = settingsModalInput.value.length < 1;
};

settingsButton.addEventListener('click', async (event) => {
	event.stopPropagation();
	const apiKeyValue = await loadApiKey();
	settingsModalInput.value = apiKeyValue !== null ? apiKeyValue : '';
	updateSaveButtonState();
	showSettingsModal();
});

settingsModalInput.addEventListener('input', updateSaveButtonState);

settingsModal.addEventListener('click', (event) => {
	event.stopPropagation();
	hideSettingsModal();
});

settingsModalContent.addEventListener('click', (event) => {
	event.stopPropagation();
});

settingsModalCancel.addEventListener('click', (event) => {
	event.stopPropagation();
	hideSettingsModal();
});

settingsModalSave.addEventListener('click', (event) => {
	event.stopPropagation();
	editApiKey(settingsModalInput.value);
	hideSettingsModal();
});

settingsModalInput.addEventListener('input', () => {
	if (settingsModalInput.value.length >= 1) {
		settingsModalSave.disabled = false;
	} else {
		settingsModalSave.disabled = true;
	}
});

const showSettingsModal = () => {
	settingsModal.style.display = 'flex';
	setTimeout(() => {
		settingsModal.classList.add('active');
	});
};

const hideSettingsModal = () => {
	settingsModal.style.display = 'none';
	setTimeout(() => {
		settingsModal.classList.remove('active');
	});
};

// 수정 모드 푸터
footerSave.addEventListener('click', (event) => {
	event.stopPropagation();
	saveInput();
	endEditMode();
});

footerReset.addEventListener('click', (event) => {
	event.stopPropagation();
	resetInput();
});

const getSavedData = async () => {
	const id = currentOption.targetElement.dataset.id;

	if (!id) {
		console.error('[저장 이벤트 오류] ' + '해당 id의 요소가 없습니다.');
		return;
	}

	return await readDocument(id);
};

const resetInput = async () => {
	const savedData = await getSavedData();
	currentOption.inputElement.value = savedData.title || '';
	focusLastCharInput();
};

const saveInput = async () => {
	const id = currentOption.targetElement.dataset.id;
	const inputValue = currentOption.inputElement.value;

	const savedData = await getSavedData();

	savedData.title = inputValue;
	currentOption.titleElement.textContent = inputValue || NO_TITLE_TEXT;

	await editDocument(id, savedData);
};

const saveOnEnter = (event) => {
	if (event.key === 'Enter') {
		saveInput();
		endEditMode();
	}
};

// 헤더 업데이트
const updateHeader = async (count) => {
	const taskCount = document.querySelector('.task-count').firstElementChild;
	const todayDate = document.querySelector('.today-date');

	const currentTime = new Date();
	const formattedDate = date(currentTime, 'month _d, yyyy');
	const dateTime = date(currentTime, 'yyyy-mm-dd');

	taskCount.innerText = count;
	todayDate.innerText = formattedDate;
	todayDate.setAttribute('datetime', dateTime);
};

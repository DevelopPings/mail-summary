import { EXAMPLE_INPUT_TEXT } from './dummies.js';
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
const listItems = document.querySelectorAll('.list-item');

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

const appendItem = (itemData) => {
	const renderCheckCount = ({ done, todo }) => {
		if (done === 0) {
			return `<li class="unfinish-task">${todo}</li>`;
		} else if (todo === 0) {
			return `<li class="finish-task">${done}</li>`;
		} else {
			return `<li class="finish-task">${done}</li>
                    <li class="unfinish-task">${todo}</li>`;
		}
	};

	const renderDate = (dateString) => {
		const inputDate = new Date(dateString);
		const currentYear = new Date().getFullYear();

		if (inputDate.getFullYear() < currentYear) {
			return date(inputDate, 'yy.MM.dd');
		}
		return date(inputDate, 'MM.dd');
	};

	const itemElement = `
        <li class="list-item" data-id="${itemData.id}">
            <h2 class="item-title">${itemData.title}</h2>
            <input
                class="edit-title-input"
                type="text"
                name="title"
                id="title" 
            />
            <div class="item-info">
                <ul class="check-count">
                    ${renderCheckCount(itemData.status)}
                </ul>
                <time class="send-time" datetime="${itemData.sendTime}">${renderDate(itemData.sendTime)}</time>
                <button class="option-button"></button>
            </div>
        </li>
    `;

	listElement.insertAdjacentHTML('beforeend', itemElement);
	listElement.lastElementChild.addEventListener('click', (event) => {
		event.stopPropagation();
		location.href = 'detail.html?id=' + itemData.id;
	});
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
		resetInput();
		startEditMode(hideOptionMenu);
	});

	option.onClickDelete((hideOptionMenu) => showDeleteModal(hideOptionMenu));
	option.onClickOutOption(() => warningModal.classList.remove('active'));
};

const startEditMode = (hideOptionMenu) => {
	currentOption.titleElement.style.display = 'none';
	currentOption.inputElement.style.display = 'block';
	inputFocusArea.style.display = 'block';
	editFooter.style.display = 'flex';

	const editFooterSpace = document.createElement('div');
	editFooterSpace.className = 'edit-footer-space';
	listElement.appendChild(editFooterSpace);

	currentOption.inputElement.addEventListener('keydown', (event) => {
		saveOnEnter(event);
	});

	const end = currentOption.inputElement.value.length;
	currentOption.inputElement.setSelectionRange(end, end);
	currentOption.inputElement.focus();
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

const resetInput = () =>
	(currentOption.inputElement.value = currentOption.titleElement.textContent);

const saveInput = async () => {
	const id = currentOption.targetElement.dataset.id;

	if (!id) {
		console.error('[저장 이벤트 오류] ' + '해당 id의 요소가 없습니다.');
		return;
	}

	if (currentOption.inputElement.value.length === 0) {
		handleDelete(id);
	} else {
		const currentData = await readDocument(id);
		const inputValue = currentOption.inputElement.value;

		if (currentData) {
			currentData.title = inputValue;
			currentOption.titleElement.textContent = inputValue;
			await editDocument(id, currentData);
		}
	}
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

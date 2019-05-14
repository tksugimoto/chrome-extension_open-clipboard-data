
const urlChecker = (() => {
	const checkers = [];
	const addChecker = fn => {
		checkers.push(fn);
	};
	const collectFirst = target => {
		for (const checker of checkers) {
			const result = checker(target);
			if (result) return result;
		}
	};
	return {
		addChecker,
		collectFirst,
	};
})();

urlChecker.addChecker(target => {
	// ネットワークファイルパス
	if (target.startsWith('\\\\')) {
		return `file:${target.replace(/\\/g, '/')}`.replace(/[%#]/g, encodeURIComponent);
	}
	// ネットワークファイルパス（先頭・末尾ダブルクォーテーションあり）
	if (target.startsWith('"\\\\') && target.endsWith('"')) {
		return `file:${target.slice(1, -1).replace(/\\/g, '/')}`.replace(/[%#]/g, encodeURIComponent);
	}
	// ネットワークファイルパス（先頭<<・末尾>>あり）
	if (target.startsWith('<<\\\\') && target.endsWith('>>')) {
		return `file:${target.slice(2, -2).replace(/\\/g, '/')}`.replace(/[%#]/g, encodeURIComponent);
	}
	// ネットワークファイルパス（先頭<・末尾>あり）
	if (target.startsWith('<\\\\') && target.endsWith('>')) {
		return `file:${target.slice(1, -1).replace(/\\/g, '/')}`.replace(/[%#]/g, encodeURIComponent);
	}
});
urlChecker.addChecker(target => {
	// ローカルファイルパス
	if (/^[a-z]:\\/i.test(target)) {
		return `file:///${target.replace(/\\/g, '/')}`.replace(/[%#]/g, encodeURIComponent);
	}
	// ローカルファイルパス（先頭・末尾ダブルクォーテーションあり）
	if (/^"[a-z]:\\/i.test(target) && target.endsWith('"')) {
		return `file:///${target.slice(1, -1).replace(/\\/g, '/')}`.replace(/[%#]/g, encodeURIComponent);
	}
});
urlChecker.addChecker(target => {
	// http URL
	if (/^https?:[/][/]/.test(target)) {
		return target;
	}
	// http URL (h抜き)
	if (/^ttps?:[/][/]/.test(target)) {
		return `h${target}`;
	}
});
urlChecker.addChecker(target => {
	// ファイルURL
	if (target.startsWith('file://')) {
		return target;
	}
});

const fire = () => {
	const text = getClipboardText().trim();
	if (!text)  return;
	const url = urlChecker.collectFirst(text) ||
		// URLじゃなかったら検索
		generateGoogleSearchUrl(text);
	// tabs権限はなくても使える
	chrome.tabs.create({
		url,
	});
};

// ショートカットキー
chrome.commands.onCommand.addListener(command => {
	if (command === 'open_clipboard_data') {
		fire();
	}
});

chrome.browserAction.onClicked.addListener(fire);

const getClipboardText = (() => {
	const pasteTarget = document.createElement('div');
	pasteTarget.contentEditable = true;
	document.activeElement.appendChild(pasteTarget);
	return () => {
		pasteTarget.textContent = '';
		pasteTarget.focus();
		document.execCommand('Paste', null, null);
		const clipboardText = pasteTarget.textContent;
		return clipboardText;
	};
})();

const generateGoogleSearchUrl = word => {
	const queryObject = {
		hl: 'ja',
		complete: 0,
		q: word,
	};
	const querys = Object.entries(queryObject).map(([key, value]) => {
		return `${key}=${encodeURIComponent(value)}`;
	});
	const queryString = querys.join('&');

	return `https://www.google.co.jp/search?${queryString}`;
};

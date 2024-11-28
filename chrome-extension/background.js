
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
		return `file:${target.replace(/\\/g, '/')}`;
	}
	// ネットワークファイルパス（先頭・末尾ダブルクォーテーションあり）
	if (target.startsWith('"\\\\') && target.endsWith('"')) {
		return `file:${target.slice(1, -1).replace(/\\/g, '/')}`;
	}
	// ネットワークファイルパス（先頭<<・末尾>>あり）
	if (target.startsWith('<<\\\\') && target.endsWith('>>')) {
		return `file:${target.slice(2, -2).replace(/\\/g, '/')}`;
	}
	// ネットワークファイルパス（先頭<・末尾>あり）
	if (target.startsWith('<\\\\') && target.endsWith('>')) {
		return `file:${target.slice(1, -1).replace(/\\/g, '/')}`;
	}
});
urlChecker.addChecker(target => {
	// ローカルファイルパス
	if (/^[a-z]:\\/i.test(target)) {
		return `file:///${target.replace(/\\/g, '/')}`;
	}
	// ローカルファイルパス（先頭・末尾ダブルクォーテーションあり）
	if (/^"[a-z]:\\/i.test(target) && target.endsWith('"')) {
		return `file:///${target.slice(1, -1).replace(/\\/g, '/')}`;
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

const setupOffscreenDocument = (() => {
	let creating;
	return async () => {
		const offscreenUrl = chrome.runtime.getURL('offscreen.html');
		const existingContexts = await chrome.runtime.getContexts({
			contextTypes: ['OFFSCREEN_DOCUMENT'],
			documentUrls: [offscreenUrl],
		});

		if (existingContexts.length > 0) {
			return;
		}

		if (creating) {
			await creating;
		} else {
			creating = chrome.offscreen.createDocument({
				url: offscreenUrl,
				reasons: [chrome.offscreen.Reason.CLIPBOARD],
				justification: 'Read text from the clipboard.',
			});
			await creating;
			creating = null;
		}
	};
})();

const fire = async () => {
	await setupOffscreenDocument();

	const text = await chrome.runtime.sendMessage({
		type: 'read-clipboard-text',
	});

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

chrome.action.onClicked.addListener(fire);

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

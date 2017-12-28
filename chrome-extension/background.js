
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
});
urlChecker.addChecker(target => {
	// ローカルファイルパス
	if (/^[a-z]:\\/i.test(target)) {
		return `file:///${target}`;
	}
});
urlChecker.addChecker(target => {
	// URL
	if (/^(h?ttps?|file):[/][/]/.test(target)) {
		return target.replace(/^h?ttp/, 'http');
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


const fire = () => {
	let text = getClipboardText();
	if (!text)  return;
	text = text.trim();
	let url;
	if (/^(h?ttps?|file):[/][/]/.test(text)) {
		url = text.replace(/^h?ttp/, "http");
	} else {
	// URLじゃなかったら検索
		url = generateGoogleSearchUrl(text);
	}
	// tabs権限はなくても使える
	chrome.tabs.create({
		url: url,
		// タブをセレクトにしない（tabの順序を管理する拡張tabOrderとの連携のため：1つ右に入れる）
		active: false,
		selected: false
	}, tab => {
		// タブをセレクト
		chrome.tabs.update(tab.id, {
			active: true
		});
		
		// ウィンドウをアクティブにする
		chrome.windows.update(tab.windowId, {
			// 最前面に出す
			focused: true,
			// アイコンが点滅
			drawAttention: true
		});
	});
};

// ショートカットキー
chrome.commands.onCommand.addListener(command => {
	if (command === "open_clipboard_data") {
		fire();
	}
});

chrome.browserAction.onClicked.addListener(fire);

const getClipboardText = (() => {
	const pasteTarget = document.createElement("div");
	pasteTarget.contentEditable = true;
	document.activeElement.appendChild(pasteTarget);
	return () => {
		pasteTarget.textContent = "";
		pasteTarget.focus();
		document.execCommand("Paste", null, null);
		const clipboardText = pasteTarget.textContent;
		return clipboardText;
	};
})();

const generateGoogleSearchUrl = word => {
	const queryObject = {
		hl: "ja",
		complete: 0,
		q: word
	};
	const querys = Object.entries(queryObject).map(([key, value]) => {
		return `${key}=${encodeURIComponent(value)}`;
	});
	const queryString = querys.join("&");

	return `https://www.google.co.jp/search?${queryString}`;
};

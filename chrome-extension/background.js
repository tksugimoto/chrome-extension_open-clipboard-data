
const fire = () => {
	const text = getClipboardText().trim();
	if (!text)  return;
	const url = /^(h?ttps?|file):[/][/]/.test(text) ?
		text.replace(/^h?ttp/, "http") :
		// URLじゃなかったら検索
		generateGoogleSearchUrl(text);
	// tabs権限はなくても使える
	chrome.tabs.create({
		url
	}, tab => {
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

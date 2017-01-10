
// ショートカットキー
chrome.commands.onCommand.addListener(command => {
	if (command === "open_clipboard_data") {
		fire();
	}
});

chrome.browserAction.onClicked.addListener(fire);

function fire() {
	let text = getClipboardText();
	if (!text)  return;
	text = text.replace(/^\s+|\s+$/g, "");
	let url;
	if (/^(h?ttps?|file):[/][/]/.test(text)) {
		url = text.replace(/^h?ttp/, "http");
	} else {
	// URLじゃなかったら検索
		url = "https://www.google.co.jp/search?hl=ja&complete=0&q=" + encodeURIComponent(text);
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
}

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

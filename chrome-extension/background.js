
// ショートカットキー
chrome.commands.onCommand.addListener(function (command) {
	if (command === "execute_browser_action") {
		fire();
	}
});

chrome.browserAction.onClicked.addListener(fire);

function fire() {
	var text = getClipboard();
	if (!text)  return;
	text = text.replace(/^\s+|\s+$/g, "");
	var url;
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
	}, function (tab){
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

function getClipboard() {
	var pasteTarget = document.createElement("div");
	pasteTarget.contentEditable = true;
	var actElem = document.activeElement.appendChild(pasteTarget).parentNode;
	pasteTarget.focus();
	document.execCommand("Paste", null, null);
	var paste = pasteTarget.textContent;
	actElem.removeChild(pasteTarget);
	return paste;
};

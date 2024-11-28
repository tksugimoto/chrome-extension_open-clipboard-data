const getClipboardText = (() => {
	const pasteTarget = document.getElementById('pasteTarget');
	return () => {
		pasteTarget.textContent = '';
		pasteTarget.focus();
		document.execCommand('Paste', null, null);
		const clipboardText = pasteTarget.textContent;
		return clipboardText;
	};
})();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.type === 'read-clipboard-text') {
		sendResponse(getClipboardText());
	}
});

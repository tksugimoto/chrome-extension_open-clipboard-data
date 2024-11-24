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


chrome.runtime.sendMessage({
	type: 'clipboard-text',
	text: getClipboardText(),
}, () => {
	window.close();
});

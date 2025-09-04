import MarkdownParser from 'markdown-it';

const MarkdownIT = new MarkdownParser({
	html: true,
	breaks: true,
	linkify: true
});

const mdInlineRenderer = (text = '') => {
	return MarkdownIT.renderInline(text);
}

export { mdInlineRenderer };
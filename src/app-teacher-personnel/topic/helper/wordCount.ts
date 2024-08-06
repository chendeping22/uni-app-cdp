export function wordCount(html: string) {
  let text = html.replace(/<[^>]*>/g, '');
  text = text.replace(/\n/g, '');
  text = text.replace(
    /(&nbsp;|&emsp;|&lt;|&gt;|&amp;|&quot;|&copy;|&reg;|&trade;|&times;|&divide;)/g,
    '?',
  );
  return text.length;
}

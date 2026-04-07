import sanitizeHtml from 'sanitize-html'

export function renderSafeRichText(input) {
  const formatted = (input || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  return sanitizeHtml(formatted, {
    allowedTags: ['strong', 'em', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {}
  })
}

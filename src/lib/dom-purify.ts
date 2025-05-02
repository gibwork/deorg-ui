import DOMPurify from "dompurify";

export const validateHTMLContentLength = (html: string, minLength: number): boolean => {
  const sanitized = DOMPurify.sanitize(html);
  const textContent = sanitized.replace(/<[^>]*>?/gm, "").trim();
  return textContent.length >= minLength;
};
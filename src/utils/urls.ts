export function getDomain(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.protocol.startsWith('http')) {
      return '';
    }

    return parsedUrl.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

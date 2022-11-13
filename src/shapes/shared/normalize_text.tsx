export const normalizeText = (text: string) => {
    return text
      .replace(TLDR.fixNewLines, '\n')
      .split('\n')
      .map((x) => x || ' ')
      .join('\n')
  }

export function parsePlayerNames(text: string): string[] {
  const normalizedText = text.replace(/\r\n/g, '\n').trim();

  if (!normalizedText) {
    return [];
  }

  if (normalizedText.includes('\n')) {
    return sanitizePlayerCandidates(normalizedText.split(/\n/));
  }

  const inlinePlayers = parseInlineSeparatedPlayers(normalizedText);
  if (inlinePlayers.length >= 2) {
    return inlinePlayers;
  }

  return sanitizePlayerCandidates([normalizedText]);
}

function parseInlineSeparatedPlayers(text: string): string[] {
  const separatorStrategies = [/\s*[;|]\s*/, /\s*,\s*/, /\s+-\s+/];

  for (const separator of separatorStrategies) {
    const rawParts = text.split(separator).filter(part => part.trim().length > 0);

    if (rawParts.length < 2) {
      continue;
    }

    const parsedPlayers = sanitizePlayerCandidates(rawParts);

    if (parsedPlayers.length === rawParts.length) {
      return parsedPlayers;
    }
  }

  return [];
}

function sanitizePlayerCandidates(candidates: string[]): string[] {
  const players: string[] = [];

  for (const candidate of candidates) {
    let cleanLine = candidate.trim();

    if (!cleanLine) continue;
    if (/^\w+\s+\d{1,2}\/\d{1,2}/.test(cleanLine)) continue;

    cleanLine = cleanLine.replace(/^\d+\s*[-\.\):]\s*/, '').trim();
    cleanLine = cleanLine.replace(/^[-\*•>]\s*/, '').trim();

    if (cleanLine.length > 1 && cleanLine.length <= 30) {
      players.push(cleanLine);
    }
  }

  return players;
}

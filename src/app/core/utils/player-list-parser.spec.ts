import { parsePlayerNames } from './player-list-parser';

describe('parsePlayerNames', () => {
  it('should parse a single player name', () => {
    expect(parsePlayerNames('Lucho')).toEqual(['Lucho']);
  });

  it('should parse a multiline numbered list', () => {
    const text = '1. Lucho\n2. Fede\n3. Nacho';

    expect(parsePlayerNames(text)).toEqual(['Lucho', 'Fede', 'Nacho']);
  });

  it('should ignore date-like headers and bullets', () => {
    const text = 'Martes 10/3\n- Lucho\n- Fede';

    expect(parsePlayerNames(text)).toEqual(['Lucho', 'Fede']);
  });

  it('should parse inline comma separated names', () => {
    const text = 'Lucho, Fede, Nacho';

    expect(parsePlayerNames(text)).toEqual(['Lucho', 'Fede', 'Nacho']);
  });

  it('should parse inline semicolon or pipe separated names', () => {
    const text = 'Lucho; Fede | Nacho';

    expect(parsePlayerNames(text)).toEqual(['Lucho', 'Fede', 'Nacho']);
  });

  it('should parse inline hyphen separated names only with surrounding spaces', () => {
    const text = 'Lucho - Fede - Nacho';

    expect(parsePlayerNames(text)).toEqual(['Lucho', 'Fede', 'Nacho']);
  });

  it('should keep hyphenated names as a single player', () => {
    expect(parsePlayerNames('Juan-Pablo')).toEqual(['Juan-Pablo']);
  });
});

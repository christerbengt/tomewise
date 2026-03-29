const languageCodes: Record<string, string> = {
  swe: 'Swedish',
  eng: 'English',
  ger: 'German',
  fre: 'French',
  spa: 'Spanish',
  nor: 'Norwegian',
  dan: 'Danish',
  fin: 'Finnish',
  ita: 'Italian',
  por: 'Portuguese',
  rus: 'Russian',
  pol: 'Polish',
  dut: 'Dutch',
  ara: 'Arabic',
  chi: 'Chinese',
  jpn: 'Japanese',
  lat: 'Latin',
};

export const getLanguageName = (code: string | null): string | null => {
  if (!code) return null;
  return languageCodes[code.toLowerCase()] ?? code;
};
export const generateBookcaseSequence = (from: string, to: string): string[] => {
  const toIndex = (code: string): number => {
    const upper = code.toUpperCase();
    let index = 0;
    for (let i = 0; i < upper.length; i++) {
      index = index * 26 + (upper.charCodeAt(i) - 64);
    }
    return index;
  };

  const fromIndex = (n: string): string => {
    let result = '';
    let num = parseInt(n);
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  };

  const start = toIndex(from);
  const end = toIndex(to);

  if (start > end || end - start > 500) return [];

  const result: string[] = [];
  for (let i = start; i <= end; i++) {
    result.push(fromIndex(i.toString()));
  }
  return result;
};
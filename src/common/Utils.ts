export function TrimPrefix(prefix: string, str: string): string {
  let i = 0;
  if (prefix.length >= str.length) return str;
  else {
    while (i < prefix.length && prefix[i] === str[i]) i += 1;
  }
  return str.substring(i);
}

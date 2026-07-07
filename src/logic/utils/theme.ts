export const CARD_THEMES = [
  { value: 'dark', label: 'Dark Theme' },
  { value: 'green', label: 'Green Theme' },
  { value: 'blue', label: 'Blue Theme' },
  { value: 'purple', label: 'Purple Theme' },
  { value: 'red', label: 'Red Theme' },
  { value: 'gold', label: 'Gold Theme' },
];

export function getCardThemeClasses(theme: string): string {
  switch (theme) {
    case 'green':
      return 'bg-gradient-to-br from-green-800 to-green-950 text-white';
    case 'blue':
      return 'bg-gradient-to-br from-blue-800 to-blue-950 text-white';
    case 'purple':
      return 'bg-gradient-to-br from-purple-800 to-purple-950 text-white';
    case 'red':
      return 'bg-gradient-to-br from-red-800 to-red-950 text-white';
    case 'gold':
      return 'bg-gradient-to-br from-yellow-600 to-yellow-800 text-white';
    case 'dark':
    default:
      return 'bg-gray-900 text-white';
  }
}

export function getCardThemeGlow(theme: string) {
  switch (theme) {
    case 'green':
      return { top: 'bg-green-500', bottom: 'bg-green-300' };
    case 'blue':
      return { top: 'bg-blue-500', bottom: 'bg-blue-300' };
    case 'purple':
      return { top: 'bg-purple-500', bottom: 'bg-purple-300' };
    case 'red':
      return { top: 'bg-red-500', bottom: 'bg-red-300' };
    case 'gold':
      return { top: 'bg-yellow-400', bottom: 'bg-yellow-200' };
    case 'dark':
    default:
      return { top: 'bg-gray-700', bottom: 'bg-gray-600' };
  }
}

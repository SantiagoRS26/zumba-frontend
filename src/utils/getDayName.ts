// utils/getDayName.ts
export const getDayName = (day: number, month: number, year: number): string => {
    const date = new Date(year, month - 1, day);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return date.toLocaleDateString('es-ES', options);
  };
  
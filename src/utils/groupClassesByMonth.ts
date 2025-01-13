// utils/groupClassesByMonth.ts
import { ClassSession } from '@/types';

export const groupClassesByMonth = (classes: ClassSession[]) => {
  return classes.reduce((acc, cls) => {
    const monthKey = `${cls.year}-${cls.month}`;
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(cls);
    return acc;
  }, {} as Record<string, ClassSession[]>);
};

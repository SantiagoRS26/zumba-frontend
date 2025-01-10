import { Suspense } from 'react';
import ClassesPage from './ClassesPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ClassesPage />
    </Suspense>
  );
}

// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige al login por defecto
  redirect('/login');
}
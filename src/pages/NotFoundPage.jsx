import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="font-mono text-gold text-sm mb-2">ERROR 404</p>
      <h1 className="font-display text-3xl text-gold-pale mb-3">Página no encontrada</h1>
      <Link to="/" className="text-sm text-cream-dim underline underline-offset-4 decoration-gold-deep">
        Volver al inicio
      </Link>
    </div>
  );
}

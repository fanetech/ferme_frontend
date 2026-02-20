export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
  // Le AuthGuard du layout parent gère déjà l'authentification
  // Cette page a juste besoin de rendre les enfants
  return <>{children}</>;
}
// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Fonction pour récupérer le `userStatus` du token JWT (ou via un appel API si nécessaire)
const getUserStatus = () => {
  const token = localStorage.getItem('token'); // Utilise 'token' ici
  if (!token) {
    console.log('Aucun token trouvé dans le localStorage');
    return null;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Décoder le token JWT
    console.log('Token décodé : ', decodedToken); // Affiche le contenu du token
    return decodedToken.userStatus; // Récupérer le `userStatus` du token
  } catch (e) {
    console.error('Erreur lors de la récupération du userStatus', e);
    return null;
  }
};


const DashboardPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    const userStatus = getUserStatus();
    console.log('UserStatus récupéré : ', userStatus); // Affiche le userStatus récupéré

    if (userStatus) {
      switch (userStatus) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'client':
          router.push('/dashboard/client');
          break;
        case 'livreur':
          router.push('/dashboard/livreur');
          break;
        case 'prestataire':
          router.push('/dashboard/prestataire');
          break;
        default:
          alert('Accès interdit');
          router.push('/');
          break;
      }
    } else {
      console.log('Aucun userStatus, redirection vers la page de connexion');
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Redirection...</h1>
    </div>
  );
};

export default DashboardPage;

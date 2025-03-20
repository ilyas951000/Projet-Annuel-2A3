// app/login/page.tsx
import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-800 to-green-400">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
        <div className="text-white text-xl font-bold">
          <span className="text-green-500">Eco</span>
          <span className="text-black">Deli</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Me connecter</h2>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Adresse e-mail"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="w-full bg-green-800 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Connexion
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>
            Toujours pas inscrit?{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Inscrivez vous
            </a>
          </p>
          <p>
            <a href="#" className="text-blue-600 hover:underline">
              Mot de passe oublié ?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

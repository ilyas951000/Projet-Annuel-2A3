"use client";

import React, { useState } from "react";

const Inscription: React.FC = () => {
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); 

    const data = {
      userFirstName: (event.target as any).userFirstName.value,
      userLastName: (event.target as any).userLastName.value,
      email: (event.target as any).email.value,
      password: (event.target as any).password.value,
      userAddress: (event.target as any).userAddress.value,
    };

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message || "Inscription réussie !");
        (event.target as any).reset(); 
      } else {
        const error = await response.json();
        setMessage(error.message || "Erreur lors de l'inscription.");
      }
    } catch (error) {
      setMessage("Erreur lors de la connexion au serveur.");
    }
  };

  return (
    <div className="container">
      <h2>Inscription</h2>
      <form id="registerForm" onSubmit={handleSubmit}>
        <input type="text" id="userFirstName" name="userFirstName" placeholder="Prénom" required />
        <input type="text" id="userLastName" name="userLastName" placeholder="Nom" required />
        <input type="email" id="email" name="email" placeholder="Email" required />
        <input type="password" id="password" name="password" placeholder="Mot de passe" required />
        <input type="text" id="userAddress" name="userAddress" placeholder="Adresse" required />
        <button type="submit">S'inscrire</button>
      </form>
      <p>{message}</p>

      <style jsx>{`
        .container {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          margin: 0 auto;
        }
        input,
        button {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
        }
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default Inscription;

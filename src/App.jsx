import { useState } from "react";
import Rutas from "./app/routes/Rutas"
import { DarkModeProvider } from "./components/darkMode_context/DarkModeContext"
import { useEffect } from "react";
import LoadingScreen from "./components/cargar_pagina/LoadingScreen";
import { ImpersonationProvider } from "./components/perstectiva/ImpersonationProviderr";
import ImpersonationBanner from "./components/perstectiva/ImpersonationBanner";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Configurando tu espacio de aprendizaje..." />;
  }

  return (
    <DarkModeProvider>
      <ImpersonationProvider>
        <ImpersonationBanner />
        <Rutas />
      </ImpersonationProvider>
    </DarkModeProvider>
  );
}

export default App

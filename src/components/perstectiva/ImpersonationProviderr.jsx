import React, { createContext, useContext, useState } from 'react';

const ImpersonationContext = createContext(null);

let _impersonatedUser = null;
export const getImpersonationState = () => _impersonatedUser;

export const ImpersonationProvider = ({ children }) => {
    const [impersonatedUser, setImpersonatedUser] = useState(null);
    const [usuarioReal, setUsuarioReal] = useState(null);

    const startImpersonation = (usuario) => {
        _impersonatedUser = usuario;
        setImpersonatedUser(usuario);
    };

    const stopImpersonation = () => {
        _impersonatedUser = null;
        setImpersonatedUser(null);
    };

    const isViewOnly = impersonatedUser !== null;

    return (
        <ImpersonationContext.Provider value={{
            impersonatedUser,
            startImpersonation,
            stopImpersonation,
            isViewOnly,
            usuarioReal,
            setUsuarioReal
        }}>
            {children}
        </ImpersonationContext.Provider>
    );
};

export const useImpersonation = () => useContext(ImpersonationContext);
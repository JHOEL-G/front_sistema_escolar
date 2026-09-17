export const DIFICULTADES = [
    { id: 1, nombre: 'Básico' },
    { id: 2, nombre: 'Intermedio' },
    { id: 3, nombre: 'Avanzado' },
    { id: 4, nombre: 'Experto' }
];

export const LENGUAJES = [
    { id: 1, nombre: 'Español' },
    { id: 2, nombre: 'Inglés' },
    { id: 3, nombre: 'Portugués' }
];

export const RETROALIMENTACIONES = [
    {
        id: 1,
        nombre: 'Mostrar siempre',
        icon: '🔔',
        desc: 'El alumno verá la corrección en cada intento realizado.'
    },
    {
        id: 2,
        nombre: 'Solo en el primer intento',
        icon: '☝️',
        desc: 'La retroalimentación solo se muestra tras la primera entrega.'
    },
    {
        id: 3,
        nombre: 'Solo en el ultimo intento',
        icon: '🏁',
        desc: 'El feedback aparecerá únicamente al agotar los intentos.'
    },
    {
        id: 4,
        nombre: 'Sin retroalimentación',
        icon: '🔇',
        desc: 'No se mostrarán las respuestas correctas al alumno.'
    }
];

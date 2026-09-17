import { useContext } from 'react';
import { CourseCreationContext } from './CourseCreationContext';
import { CourseEditContext } from './CourseEditContext';

export const useCurso = () => {
    const creacion = useContext(CourseCreationContext);
    const edicion = useContext(CourseEditContext);
    return edicion ?? creacion;
};
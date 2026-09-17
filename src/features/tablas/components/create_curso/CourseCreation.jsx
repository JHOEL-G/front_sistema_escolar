import { Outlet } from 'react-router-dom';
import { CourseCreationProvider } from './CourseCreationContext';

export default function CourseCreation() {
    return (
        <CourseCreationProvider>
            <Outlet />
        </CourseCreationProvider>
    );
}
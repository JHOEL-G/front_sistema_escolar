import { Outlet } from 'react-router-dom';
import { CourseEditProvider } from './CourseEditContext';

export default function CourseEdit() {
    return (
        <CourseEditProvider>
            <Outlet />
        </CourseEditProvider>
    );
}
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "../../components/layout/Layout";
import LoadingScreen from "../../components/cargar_pagina/LoadingScreen";

const AprendizajePage = lazy(() => import("../../features/dashboard/pages/aprendizaje_page/AprendizajePage"));
const ModernDashboard = lazy(() => import("../../features/dashboard/pages/interface_principal/ModernDashboard"));
const ExploradorPage = lazy(() => import("../../features/dashboard/pages/explorador_page/ExploradorPage"));
const PerfilPage = lazy(() => import("../../features/dashboard/pages/perfil_page/PerfilPage"));
const CursoPage = lazy(() => import("../../features/dashboard/pages/curso/curso_page/CursoPage"));
const UsuarioTbla = lazy(() => import("../../features/tablas/pages/tabla_usuarios/UsuarioTbla"));
const TablaRol = lazy(() => import("../../features/tablas/pages/tabla_rol/TablaRol"));
const TablaPropiedades = lazy(() => import("../../features/tablas/pages/tabla_prodiedades/TablaPropiedades"));
const TablaOu = lazy(() => import("../../features/tablas/pages/tabla_ou/TablaOu"));
const Modulos = lazy(() => import("../../features/dashboard/pages/modulos/Modulos"));
const LIAAssistant = lazy(() => import("../../features/dashboard/pages/activaciones/AIartificial"));
const CourseCreation = lazy(() => import("../../features/tablas/components/create_curso/CourseCreation"));
const ConfiguracionNotificaciones = lazy(() => import("../../features/dashboard/pages/configuracion_notificaciones/ConfiguracionNotificaciones"));
const ActivityReport = lazy(() => import("../../features/dashboard/pages/reporte_activaciones/ActivityReport"));
const Panel = lazy(() => import("../../features/dashboard/pages/Gamificaion/Panel"));
const TablaTema = lazy(() => import("../../features/tablas/pages/tabla_tema/TablaTema"));
const DetalleCurso = lazy(() => import("../../features/dashboard/pages/curso/detalle_curso/DetalleCurso"));
const CursoIniciado = lazy(() => import("../../features/dashboard/pages/curso/aprendizaje_curso/CursoIniciado"));
const InicioCurso = lazy(() => import("../../features/dashboard/pages/curso/inico_curso/InicioCurso"));
const PageReportes = lazy(() => import("../../features/dashboard/pages/page_reportes/PageReportes"));
const TablaBancoPreguntas = lazy(() => import("../../features/tablas/pages/tabla_banco_preguntas/BancoPreguntas"));
const PageTablaGestionCurso = lazy(() => import("../../features/tablas/pages/tabla_gestion_curso/PageTablaGestionCurso"));
const GestionCurso = lazy(() => import("../../features/tablas/components/gestion_curso/GestionCurso"));
const TablaRutaAprendizaje = lazy(() => import("../../features/tablas/pages/tabla_ruta_aprendizaje/TablaRutaAprendizaje"));
const CrearRutaAprendizaje = lazy(() => import("../../features/tablas/components/create_ruta_aprendizaje/CrearRutaAprendizaje"));
const BasicInfoScreen = lazy(() => import("../../features/tablas/components/create_curso/pantallas_formulario/BasicInfoScreen"));
const SelectionScreen = lazy(() => import("../../features/tablas/components/create_curso/pantallas_formulario/SelectionScreen"));
const LandingPageScreen = lazy(() => import("../../features/tablas/components/create_curso/pantallas_formulario/LandingPageScreen"));
const CourseContentScreen = lazy(() => import("../../features/tablas/components/create_curso/pantallas_formulario/CourseContentScreen"));
const WeightingScreen = lazy(() => import("../../features/tablas/components/create_curso/pantallas_formulario/WeightingScreen"));
const ConfigurationScreen = lazy(() => import("../../features/tablas/components/create_curso/pantallas_formulario/ConfigurationScreen"));
const VistaPreviaCurso = lazy(() => import("../../features/tablas/components/vista_previa_curso/VistaPreviaCurso"));
const ConfigurationScreenPrevia = lazy(() => import("../../features/tablas/components/vista_previa_curso/ConfigurationScreenPrevia"));
const GestorDocumentos = lazy(() => import("../../components/gestor_documentos/GestorDocumentos"));
const TblasCalificaiones = lazy(() => import("../../features/tablas/pages/tabla_calificaiones/TblasCalificaiones"));
const GamificationConfig = lazy(() => import("../../features/dashboard/pages/Gamificaion/configuracion_gamificacion/GamificationConfig"));
const ReportesApp = lazy(() => import("../../features/tablas/pages/tabla_reportes/ReportesTabla"));
const DatosGenerales = lazy(() => import("../../features/tablas/components/create_ruta_aprendizaje/formulario_pasos/DatosGenerales"));
const Privacidad = lazy(() => import("../../features/tablas/components/create_ruta_aprendizaje/formulario_pasos/Privacidad"));
const RecursosEstudios = lazy(() => import("../../features/tablas/components/create_ruta_aprendizaje/formulario_pasos/RecursosEstudios"));
const Participantes = lazy(() => import("../../features/tablas/components/create_ruta_aprendizaje/formulario_pasos/Participantes"));
const Configuraciones = lazy(() => import("../../features/tablas/components/create_ruta_aprendizaje/formulario_pasos/Configuraciones"));
const EditarRutaAprendizaje = lazy(() => import("../../features/tablas/components/create_ruta_aprendizaje/editar_ruta_aprendizaje/EditarRutaAprendizaje"));
const PlantillaFormulario = lazy(() => import("../../features/dashboard/pages/plantilla_formulario/PlantillaFormulario"));
const FormularioPublicoPage = lazy(() => import("../../features/dashboard/pages/plantilla_formulario/formulario/FormularioPublicoPage"));
const CalificacionAutomatica = lazy(() => import("../../features/tablas/pages/tabla_calificaiones/repaso/CalificacionAutomatica"));
const PageRutaAprendizaje = lazy(() => import("../../features/dashboard/pages/rutas_aprendizaje/PageRutaAprendizaje"));
const CourseEdit = lazy(() => import("../../features/tablas/components/create_curso/CourseEdit"));
const CalificacionManual = lazy(() => import("../../features/tablas/pages/tabla_calificaiones/repaso/CalificaiobnManual"));

export default function Rutas() {
    return (
        <Suspense fallback={<LoadingScreen message="Cargando módulo..." />}>
            <Routes>
                <Route path="/f/:uuid" element={<FormularioPublicoPage />} />
                <Route element={<Layout />}>
                    <Route index element={<ModernDashboard />} />
                    <Route path="aprendizaje" element={<AprendizajePage />} />
                    <Route path="explorador" element={<ExploradorPage />} />
                    <Route path="perfil" element={<PerfilPage />} />
                    <Route path="curso" element={<CursoPage />} />
                    <Route path="usuarios" element={<UsuarioTbla />} />
                    <Route path="rol" element={<TablaRol />} />
                    <Route path="ou" element={<TablaOu />} />
                    <Route path="propiedades" element={<TablaPropiedades />} />
                    <Route path="banco_preguntas" element={<TablaBancoPreguntas />} />
                    <Route path="modulos" element={<Modulos />} />
                    <Route path="ia" element={<LIAAssistant />} />

                    <Route path="curso/crear" element={<CourseCreation />}>
                        <Route index element={<SelectionScreen />} />
                        <Route path="basic-info" element={<BasicInfoScreen />} />
                        <Route path="landing-page" element={<LandingPageScreen />} />
                        <Route path="course-content" element={<CourseContentScreen />} />
                        <Route path="weighting" element={<WeightingScreen />} />
                        <Route path="configuration" element={<ConfigurationScreen />} />
                        <Route path="basic-info-previa" element={<VistaPreviaCurso />} />
                        <Route path="configuration-previa" element={<ConfigurationScreenPrevia />} />
                    </Route>

                    <Route path="curso/editar/:id" element={<CourseEdit />}>
                        <Route index element={<BasicInfoScreen />} />
                        <Route path="basic-info" element={<BasicInfoScreen />} />
                        <Route path="landing-page" element={<LandingPageScreen />} />
                        <Route path="course-content" element={<CourseContentScreen />} />
                        <Route path="weighting" element={<WeightingScreen />} />
                        <Route path="configuration" element={<ConfigurationScreen />} />
                    </Route>

                    <Route path="configuracion_notificaciones" element={<ConfiguracionNotificaciones />} />
                    <Route path="reporte_activaciones" element={<ActivityReport />} />
                    <Route path="gamificacion" element={<Panel />} />
                    <Route path="tema" element={<TablaTema />} />
                    <Route path="intro_curso/:id" element={<DetalleCurso />} />
                    <Route path="curso_iniciado/:id" element={<CursoIniciado />} />
                    <Route path="inicio_curso/:id" element={<InicioCurso />} />
                    <Route path="reportes" element={<PageReportes />} />
                    <Route path="gestion_curso" element={<PageTablaGestionCurso />} />
                    <Route path="gestion_curso/:cursoId" element={<GestionCurso />} />
                    <Route path="curso/:cursoId/gestion/:gestionId/editar" element={<GestionCurso />} />
                    <Route path="ruta_aprendizaje" element={<TablaRutaAprendizaje />} />

                    <Route path="crear_ruta" element={<CrearRutaAprendizaje />}>
                        <Route index element={<DatosGenerales />} />
                        <Route path="privacidad" element={<Privacidad />} />
                        <Route path="recursos" element={<RecursosEstudios />} />
                        <Route path="participantes" element={<Participantes />} />
                        <Route path="configuracion" element={<Configuraciones />} />
                    </Route>

                    <Route path="editar_ruta/:rutaId" element={<EditarRutaAprendizaje />}>
                        <Route index element={<DatosGenerales />} />
                        <Route path="privacidad" element={<Privacidad />} />
                        <Route path="recursos" element={<RecursosEstudios />} />
                        <Route path="participantes" element={<Participantes />} />
                        <Route path="configuracion" element={<Configuraciones />} />
                    </Route>

                    <Route path="gestor_documentos" element={<GestorDocumentos />} />
                    <Route path="calificaciones/:cursoId" element={<TblasCalificaiones />} />
                    <Route path="calificaciones_manual/:cursoId" element={<CalificacionManual />} />
                    <Route path="calificaciones_automatica/:cursoId" element={<CalificacionAutomatica />} />
                    <Route path="config_gamificacion" element={<GamificationConfig />} />
                    <Route path="resportes_tabla" element={<ReportesApp />} />
                    <Route path="plantilla_formulario" element={<PlantillaFormulario />} />
                    <Route path="rutas_aprendizaje_inscrito/:rutaId" element={<PageRutaAprendizaje />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

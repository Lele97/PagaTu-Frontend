import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Root from './routes/root';
import ErrorPage, { RouterErrorPage } from './components/error/error-page.jsx';
import SplashScreen from '~/components/splash/splash-screen.jsx';
import './styles/app.css';

// Route-level code splitting: solo la splash screen (rotta "/") viene caricata
// nel bundle iniziale. Le altre pagine vengono scaricate on-demand, riducendo
// il JS da parsare/eseguire al primo caricamento.
const Home = lazy(() => import('~/components/home/home.jsx'));
const ForgotPswForm = lazy(() => import('~/components/resetPassword/forgotPsw-form.jsx'));
const Group = lazy(() => import('~/components/group/group.jsx'));
const Invitation = lazy(() => import('~/components/invitation/invitation.jsx'));
const ResetPswForm = lazy(() => import('~/components/resetPassword/resetPsw-form.jsx'));
const VerifyEmail = lazy(() => import('~/components/verify-email/verify-email.jsx'));
const AuthLanding = lazy(() => import('~/components/auth/AuthLanding.jsx'));

const withSuspense = (element) => (
    <Suspense fallback={null}>
        {element}
    </Suspense>
);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <RouterErrorPage />,
        children: [
            {
                index: true,
                element: <SplashScreen />,
            },
            {
                path: '/welcome',
                element: withSuspense(<AuthLanding />),
            },
            {
                path: '/login',
                element: <Navigate to="/welcome" replace />,
            },
            {
                path: '/signup',
                element: <Navigate to="/welcome?tab=signup" replace />,
            },
            {
                path: '/home',
                element: withSuspense(<Home />),
            },
            {
                path: '/forgotPassword',
                element: withSuspense(<ForgotPswForm />),
            },
            {
                path: '/group',
                element: <Navigate to="/home" replace />,
            },
            {
                path: '/group/:groupName',
                element: withSuspense(<Group />),
            },
            {
                path: '/invitation',
                element: withSuspense(<Invitation />),
            },
            {
                path: '/resetPassword',
                element: withSuspense(<ResetPswForm />),
            },
            {
                path: '/verify-email',
                element: withSuspense(<VerifyEmail />),
            },
            {
                path: '/profile/payment-links',
                element: <Navigate to="/home?settings=payments" replace />,
            },
            {
                path: '/errore-token',
                element: <ErrorPage />,
            },
            {
                path: '/error',
                element: <ErrorPage />,
            },
            {
                path: '*',
                element: <ErrorPage />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
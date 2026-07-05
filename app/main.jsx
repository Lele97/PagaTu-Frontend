import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Root from './routes/root';
import ErrorPage from './components/error/error-page.jsx';
import Home from '~/components/home/home.jsx';
import ForgotPswForm from '~/components/resetPassword/forgotPsw-form.jsx';
import Group from '~/components/group/group.jsx';
import Invitation from '~/components/invitation/invitation.jsx';
import ResetPswForm from '~/components/resetPassword/resetPsw-form.jsx';
import VerifyEmail from '~/components/verify-email/verify-email.jsx';
import SplashScreen from '~/components/splash/splash-screen.jsx';
import AuthLanding from '~/components/auth/AuthLanding.jsx';
import './styles/app.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <SplashScreen />,
            },
            {
                path: '/welcome',
                element: <AuthLanding />,
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
                element: <Home />,
            },
            {
                path: '/forgotPassword',
                element: <ForgotPswForm />,
            },
            {
                path: '/group',
                element: <Group />,
            },
            {
                path: '/invitation',
                element: <Invitation />,
            },
            {
                path: '/resetPassword',
                element: <ResetPswForm />,
            },
            {
                path: '/verify-email',
                element: <VerifyEmail />,
            },
            {
                path: '/profile/payment-links',
                element: <Navigate to="/home?settings=payments" replace />,
            },
            {
                path: '/errore-token',
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
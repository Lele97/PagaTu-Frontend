import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Root from './routes/root';
import Login from './components/login/login-form.jsx';
import ErrorPage from './components/error/error-page.jsx';
import Signup from "~/components/signup/signup-form.jsx";
import Home from "~/components/home/home.jsx";
import ForgotPswForm from "~/components/resetPassword/forgotPsw-form.jsx";
import Group from "~/components/group/group.jsx";
import Invitation from "~/components/invitation/invitation.jsx";
import ResetPswForm from "~/components/resetPassword/resetPsw-form.jsx";
import SplashScreen from "~/components/splash/splash-screen.jsx";
import './styles/app.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root/>,
        errorElement: <ErrorPage/>,
        children: [
            {
                index: true,
                element: <SplashScreen/>,
            },
            {
                path: "/login",
                element: <Login/>,
            },
            {
                path: "/home",
                element: <Home/>,
            },
            {
                path: "/signup",
                element: <Signup/>,
            },
            {
                path: "/forgotPassword",
                element: <ForgotPswForm/>,
            },
            {
                path: "/group",
                element: <Group/>,
            },
            {
                path: "/invitation",
                element: <Invitation/>,
            },
            {
                path: "/resetPassword",
                element: <ResetPswForm/>
            },
            {
                path: "/errore-token",
                element: <ErrorPage/>,
            }
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
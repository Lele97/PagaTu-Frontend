import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Root from './routes/root';
import Login from './routes/auth/login';
import ErrorPage from './routes/error/error-page.jsx';
import './styles/app.css';
import Signup from "~/routes/register/signup";
import Home from "~/routes/home/home.jsx";
import ForgotPswForm from "~/routes/resetPassword/forgotPsw-form.jsx";
import Group from "~/routes/group/group.jsx";
import Invitation from "~/routes/invitation/invitation.jsx";
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import ResetPswForm from "~/routes/resetPassword/resetPsw-form.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root/>,
        errorElement: <ErrorPage/>,
        children: [
            {
                index: true,
                element: <Home/>,
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
import React from 'react';
import ReactDOM from 'react-dom/client';
import {RouterProvider, createBrowserRouter} from 'react-router-dom';
import Root from './routes/root';
import Login from './routes/auth/login';
import ErrorPage from './routes/error/error-page.jsx';
import './styles/app.css';
import Signup from "~/routes/auth/signup";
import Home from "~/routes/home.jsx";
import ForgotPswForm from "~/routes/auth/forgotPsw-form.jsx";
import Group from "~/routes/group.jsx";
import Invitation from "~/routes/invitation.jsx";
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
            }
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
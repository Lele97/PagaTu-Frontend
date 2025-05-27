import React from "react";
import {useRouteError} from "react-router-dom";
import styles from '~/styles/error.module.css';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6">
            <h1 className="text-5xl font-bold text-red-600 mb-4">Oops!</h1>
            <p className="text-lg text-gray-700 mb-2">Qualcosa è andato storto.</p>
            <p className="text-md text-gray-500 mb-6">
                {error.statusText || error.message}
            </p>
            <a
                href="/"
                className="text-white bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full transition">
                Torna alla Home
            </a>
        </div>
    );
}

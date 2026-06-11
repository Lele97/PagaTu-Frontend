import React from 'react';
import {Outlet, useLocation} from 'react-router-dom';
import Footer from '../components/footer/footer.jsx';
import '../styles/app.css';

const Root = () => {
    const location = useLocation();
    const isSplash = location.pathname === '/';

    return (
        <div className={"appWrapper"}>
            <Outlet/>
            {!isSplash && <Footer/>}
        </div>
    );
}

export default Root;
import React from 'react';
import {Outlet} from 'react-router-dom';
import Footer from '../view/footer.jsx';
import '../styles/app.css';

const Root = () => {
    return (
        <div className={"appWrapper"}>
            <Outlet/>
            <Footer/>
        </div>
    );
}

export default Root;
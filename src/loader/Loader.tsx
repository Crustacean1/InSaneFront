import React from 'react';
import './Loader.css';

function Loader(prop: { component: any, condition: boolean, }) {
    return (
        <div className="outer-loader">
            {prop.condition ? <div className="spinner-loader"></div> : prop.component}
        </div>
    )
}

export default Loader;
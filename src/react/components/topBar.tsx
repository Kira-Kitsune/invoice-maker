import * as React from 'react';

function closeApp() {
    api.window.close();
}

function minimise() {
    api.window.minimise();
}

function maximise() {
    api.window.maximise();
}

export const TopBar = () => {
    return (
        <nav className="topbar">
            <div>
                <span className="titleName"></span>
            </div>
            <div>
                <span className="navLink" onClick={() => minimise()}>
                    &minus;
                </span>
                <span className="navLink" onClick={() => maximise()}>
                    &#x1F5D6;
                </span>
                <span className="closeNavLink" onClick={() => closeApp()}>
                    &#10006;
                </span>
            </div>
        </nav>
    );
};

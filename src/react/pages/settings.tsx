import React from 'react';

export const Settings = () => {
    function uploadLogo() {
        try {
            api.other.logo();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="page">
            <h2>Settings</h2>
            <h3>Logo: </h3>
            <button onClick={() => uploadLogo()}>Upload Logo</button>
        </div>
    );
};

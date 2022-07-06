import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';

function render() {
    createRoot(document.getElementById('app')).render(
        <StrictMode>
            <Router>
                <App />
            </Router>
        </StrictMode>
    );
}

render();

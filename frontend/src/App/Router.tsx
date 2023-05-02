import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginView from '../views/LoginView/LoginView';
import Index from '../views/Index/Index';
import RegisterView from '../views/RegisterView/RegisterView';

export default function Router() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Index/>}/>;
                <Route path="/login" element={<LoginView/>}/>;
                <Route path="/register" element={<RegisterView/>}/>;
            </Routes>
        </BrowserRouter>
    )
}
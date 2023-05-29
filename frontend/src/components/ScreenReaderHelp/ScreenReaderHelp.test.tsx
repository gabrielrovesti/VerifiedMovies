import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ScreenReaderHelp from './ScreenReaderHelp';

describe('ScreenReaderHelp', () => {
    it('renders correctly', () => {
        render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
            <Route path="/" element={<ScreenReaderHelp />} />
            </Routes>
        </MemoryRouter>
        );
    });

    it('renders correctly when the user is authenticated', () => {
        render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
            <Route path="/" element={<ScreenReaderHelp />} />
            </Routes>
        </MemoryRouter>
        );
    });
});

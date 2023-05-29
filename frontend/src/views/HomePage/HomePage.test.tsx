import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';
import CreateDID from '../../utils/CreateDID';
import CreateIssuers from '../../utils/CreateIssuers';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

jest.mock('../../utils/CreateDID');
jest.mock('../../utils/CreateIssuers');

describe('HomePage', () => {

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the header and description', () => {
        render(<HomePage />);
        const headerElement = screen.getByRole('heading', { level: 1, name: 'Il cinema del futuro' });
        const descriptionElement = screen.getByText('Scopri un\'ampia selezione di film e spettacoli imperdibili e acquista i biglietti in modo sicuro con l\'uso di blockchain.');

        expect(headerElement).toBeInTheDocument();
        expect(descriptionElement).toBeInTheDocument();
    });

    it('should call CreateDID and log the userDID', async () => {
        render(<HomePage />);
        expect(CreateDID).toHaveBeenCalledTimes(1);
        expect(CreateDID).toHaveBeenCalledWith();
    });

    it('should call CreateIssuers', () => {
        render(<HomePage />);
        expect(CreateIssuers).toHaveBeenCalledTimes(1);
        expect(CreateIssuers).toHaveBeenCalledWith();
    });

    it('should render the testimonials', () => {
        render(<HomePage />);
        const testimonial1Element = screen.getByText('Grazie a VerifiedMovies, posso godermi una vasta selezione di film. La tecnologia blockchain e la sicurezza del sistema garantiscono la mia privacy in un modo così semplice; non me l\'aspettavo!"');
        const testimonial2Element = screen.getByText('"VerifiedMovies offre un livello di sicurezza eccezionale grazie alla verifica delle informazioni tramite la blockchain. Posso acquistare i biglietti in tutta tranquillità, in modo semplice e protetto davvero."');
        const author1Element = screen.getByText('- Maria R.');
        const author2Element = screen.getByText('- Luca M.');

        expect(testimonial1Element).toBeInTheDocument();
        expect(testimonial2Element).toBeInTheDocument();
        expect(author1Element).toBeInTheDocument();
        expect(author2Element).toBeInTheDocument();
    });
});

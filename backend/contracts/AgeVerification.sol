// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SelfSovereignIdentity.sol";

contract AgeVerification{
    function getNumber() public pure returns (uint256) {
        return 123;
    }

/*
Definizione del contratto "AgeVerification" per la verifica dell'età degli utenti
Funzione "registerUser" per la registrazione di un nuovo utente, che richiede l'età dell'utente come parametro e restituisce il DID associato all'utente
Funzione "isUserAdult" per verificare se un utente è maggiorenne, che richiede il DID dell'utente come parametro e restituisce un valore booleano
Funzione "getParentDID" per ottenere il DID del genitore associato all'utente, che richiede il DID dell'utente come parametro e restituisce il DID del genitore
*/
}
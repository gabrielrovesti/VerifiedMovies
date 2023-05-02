// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IdentityRegistry{
    function getNumber() public pure returns (uint256) {
        return 123;
    }
}

/*
Definizione del contratto "UserManagement" per la gestione degli utenti e dei loro DID
Funzione "createUser" per creare un nuovo utente, che restituisce il DID associato all'utente
Funzione "getUserDID" per ottenere il DID di un utente, che richiede l'indirizzo dell'utente come parametro e restituisce il DID associato all'utente
Funzione "linkParentToUser" per associare un genitore a un utente minorenne, che richiede il DID del genitore e il DID dell'utente come parametri
*/
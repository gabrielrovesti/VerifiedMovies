// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './SelfSovereignIdentity.sol';

contract UserRegistration {
    
    SelfSovereignIdentity ssi;
    
    struct User {
        string name;
        string surname;
        uint256 dateOfBirth;
        bool registered;
        string did;
    }
    
    mapping(address => User) private users;
    
    constructor(address ssiAddress) {
        ssi = SelfSovereignIdentity(ssiAddress);
    }
    
    function registerUser(string memory name, string memory surname, uint256 dateOfBirth) public {
        // Verifica se l'utente è già registrato
        require(!users[msg.sender].registered, "User already registered");

        // Crea un nuovo DID Document per l'utente
        string memory userDid = ssi.createDid();

        // Aggiunge un delegato per l'utente
        ssi.addCapabilityDelegation(msg.sender);

        // Aggiunge il servizio di registrazione all'utente
        ssi.addService("registration", "Web Service", "https://example.com/register");

        // Registra l'utente
        User memory user = User(name, surname, dateOfBirth, true, userDid);
        users[msg.sender] = user;
    }
}
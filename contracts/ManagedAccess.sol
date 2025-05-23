// centralzization vs decenctralization
// vs a single db vs distributed ledger
// a single BN vs BN network

// governance : vote
//a agenda --> by vote --> decision
 

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract ManagedAccess {
    address public owner;
    address public manager;

    constructor(address _owner, address _manager) {
        owner = _owner;
        manager = _manager;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "you are not authorized");
        _;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "you are not authorized to manage this contract");
        _;
    }
}

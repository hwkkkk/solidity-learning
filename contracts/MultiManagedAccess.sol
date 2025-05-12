// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MultiManagedAccess {
    // manger 3 변경했습니다
    uint constant MANAGER_NUMBERS = 3;
    uint immutable BACKUP_MANAGER_NUMBERS;

    address public owner;
    address[MANAGER_NUMBERS] public managers;
    bool[MANAGER_NUMBERS] public confirmed;

    constructor(address _owner, address[MANAGER_NUMBERS] memory _managers, uint manager_numbers) {
        require(_managers.length == manager_numbers, "size unmatched");
        owner = _owner;
        BACKUP_MANAGER_NUMBERS = manager_numbers;
        for (uint i = 0; i < MANAGER_NUMBERS; i++) {
            managers[i] = _managers[i];
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized");
        _;
    }

    function allConfirmed() internal view returns (bool) {
        for (uint i = 0; i < MANAGER_NUMBERS; i++) {
            if (!confirmed[i]) {
                return false;
            }
        }
        return true;
    }

    function reset() internal {
        for (uint i = 0; i < MANAGER_NUMBERS; i++) {
            confirmed[i] = false;
        }
    }

    modifier onlyAllConfirmed() {
        require(allConfirmed(), "Not all managers confirmed yet");
        reset();
        _;
    }

    function confirm() external {
        bool found = false;
        for (uint i = 0; i < MANAGER_NUMBERS; i++) {
            if (managers[i] == msg.sender) {
                found = true;
                confirmed[i] = true;
                break;
            }
        }
        require(found, "You are not one of the managers");
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./ManagedAccess.sol";

contract MyToken is ManagedAccess {

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed spender, uint256 amount);

    
    string public name;
    string public symbol;
    uint public decimals; 

    uint256 public totalSupply;
    mapping (address => uint256) public balanceOf;
    mapping (address => mapping(address => uint256)) public allowance;
    


    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _amount
    ) ManagedAccess(msg.sender, msg.sender)
    {
        owner = msg.sender;
        manager = msg.sender;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _mint(_amount *10**uint256(decimals), msg.sender);
    }

    

    function approve(address spender, uint256 amount) external {
        allowance[msg.sender][spender] = amount;
        emit Approval(spender, amount);
    }
    // owner is not callelr able

    function transferFrom(address from, address to, uint256 amount) external {
        address spender = msg.sender;
        require(allowance[from][spender] >= amount, "insufficient allowance");
        allowance[from][spender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);

    }

    function mint(uint256 amount, address to) external onlyManager{
        _mint(amount, to);
    }

    function setManager(address _manager) external onlyOwner {
        manager = _manager;
    }

    function _mint(uint256 amount, address to) internal {
        totalSupply += amount;
        balanceOf[to] = balanceOf[to] + amount;

        emit Transfer(address(0), to, amount);
    }

    function transfer(uint256 amount, address to) external {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);
    }

    // give a authorization to bank contarct i call bank contract once
    // for owner, owner
    // token owner --> bank contract contracnt can call other contract
    // token owner --> router contrac --> back contract
    // token owner --> router contract --> back contract(multi contract)

    
}


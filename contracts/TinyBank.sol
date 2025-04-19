// SPDX-License-Identifier: MIT
//staking
//deposit / withdraw
//MyToken : token balance managemnt
// - the balance of TinyBank address
//TinyBank : deposit / withdraw vault
//- users token management
//- user --> deposit --> TinyBank --> transform(user --> TinyBank)

// REWARD
// - reward token : MyToken
// - reward resources : 1 MT/block minting
// - reward strategy : staked[user]/totalStaked distribution

// -signer0 block 0 staking
// -signer1 block 1 staking
//  - 0-- 1-- 2-- 3-- 4-- 5--
//    |                   |
//  -signer0 10mt         signer1 10mt


pragma solidity ^0.8.28;

interface IMyToken {
    function transfer(uint256 amount, address to) external;
    function transferFrom(address from, address to, uint256 amount) external;
    function mint(uint256 amount, address owner) external;
}

contract TinyBank{
    event Staked(address, uint256);
    event Withdraw(uint256 amout, address to);

    IMyToken public stakingToken;

    mapping(address => uint256) public lastClaimedBlock;
    
    uint256 rewardPerBlock = 1*10**18;

    mapping (address => uint256) public staked;
    uint256 public totalstaked;
    
    constructor(IMyToken _stakingToken) {
        stakingToken = _stakingToken;
    }
    // who : tinybank(inefficient)  when : stake to block  
    function distributeReward(address to) internal {
        
            uint256 blocks = block.number - lastClaimedBlock[to];
            uint256 reward = blocks * rewardPerBlock * staked[to] / totalstaked;
            stakingToken.mint(reward, to);
            lastClaimedBlock[to] = block.number; 
    }

    function stake(uint256 _amount) external {
        require(_amount >= 0, "cannot stake 0 amount");
        distributeReward(msg.sender);
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        staked[msg.sender] += _amount;
        totalstaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        require(staked[msg.sender] >= _amount, "iinsufficient staked token");
        distributeReward(msg.sender);
        stakingToken.transfer(_amount, msg.sender);
        staked[msg.sender] -= _amount;
        totalstaked -= _amount;
        emit Withdraw(_amount, msg.sender);
    }
}
pragma solidity ^0.6.8;


contract Vault {
    address payable private owner;
    event Deposit(string username, uint256 value);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sender not authorized.");
        _;
    }

    function deposit(string memory username) public payable {
        emit Deposit(username, msg.value);
    }

    function withdraw(uint256 amount) public onlyOwner {
        owner.transfer(amount);
    }
}

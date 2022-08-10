// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {

    address public feeAccount;
    uint256 public feePercent;

    mapping(address => mapping(address => uint256)) tokens;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public cancelledOrders;
    uint256 public orderCount;

    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    event Deposit(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _balance
    );

    event Withdraw(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _balance
    );

    event Order (
        uint256 _id,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive,
        uint256 _timestamp
    );

    event Cancel (
        uint256 _id,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive,
        uint256 _timestamp
    );

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }

    function depositToken(address _token, uint256 _amount) public {
        Token(_token).transferFrom(msg.sender, address(this), _amount);
        tokens[_token][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount, balanceOf(_token, msg.sender));
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(balanceOf(_token, msg.sender) >= _amount, 'Not enough tokens deposited to withdraw');
        Token(_token).transfer(msg.sender, _amount);
        tokens[_token][msg.sender] -= _amount;
        emit Withdraw(_token, msg.sender, _amount, balanceOf(_token, msg.sender));
    }

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive, 'Insufficient tokens');
        orderCount += 1;
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }

    function cancelOrder(uint256 _id) public {
        _Order storage order = orders[_id];
        require(address(order.user) == msg.sender, 'Order does not belong to you');
        require(order.id == _id, 'Order does not exist');
        cancelledOrders[_id] = true;
        emit Cancel(order.id, msg.sender, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive, block.timestamp);
    }

}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}
contract MonadPayProcessor {

    event PaymentProcessed(
        bytes32 indexed paymentId,
        address indexed from,
        address indexed to,
        uint256 amount,
        address token,
        string label,
        uint256 timestamp
    );

    event TokenPaymentProcessed(
        bytes32 indexed paymentId,
        address indexed from,
        address indexed to,
        uint256 amount,
        address token,
        string label,
        uint256 timestamp
    );

    struct Payment {
        address from;
        address to;
        uint256 amount;
        address token; 
        string label;
        string memo;
        uint256 timestamp;
        bool processed;
    }

    mapping(bytes32 => Payment) public payments;
    mapping(address => bytes32[]) public userPayments;
    mapping(address => bytes32[]) public userReceivedPayments;
    
    uint256 public totalPaymentsProcessed;

    constructor() {
        totalPaymentsProcessed = 0;
    }

    function processPayment(
        address payable to,
        string memory label,
        string memory memo
    ) external payable returns (bytes32) {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(to != address(0), "Invalid recipient address");

        bytes32 paymentId = keccak256(
            abi.encodePacked(
                msg.sender,
                to,
                msg.value,
                block.timestamp,
                totalPaymentsProcessed
            )
        );

        payments[paymentId] = Payment({
            from: msg.sender,
            to: to,
            amount: msg.value,
            token: address(0), // Native token
            label: label,
            memo: memo,
            timestamp: block.timestamp,
            processed: true
        });

        userPayments[msg.sender].push(paymentId);
        userReceivedPayments[to].push(paymentId);

        (bool success, ) = to.call{value: msg.value}("");
        require(success, "Transfer failed");

        totalPaymentsProcessed++;

        emit PaymentProcessed(
            paymentId,
            msg.sender,
            to,
            msg.value,
            address(0),
            label,
            block.timestamp
        );

        return paymentId;
    }

    function processTokenPayment(
        address to,
        address token,
        uint256 amount,
        string memory label,
        string memory memo
    ) external returns (bytes32) {
        require(amount > 0, "Payment amount must be greater than 0");
        require(to != address(0), "Invalid recipient address");
        require(token != address(0), "Invalid token address");

        IERC20 tokenContract = IERC20(token);

        require(
            tokenContract.allowance(msg.sender, address(this)) >= amount,
            "Insufficient token allowance"
        );

        bytes32 paymentId = keccak256(
            abi.encodePacked(
                msg.sender,
                to,
                amount,
                token,
                block.timestamp,
                totalPaymentsProcessed
            )
        );

        payments[paymentId] = Payment({
            from: msg.sender,
            to: to,
            amount: amount,
            token: token,
            label: label,
            memo: memo,
            timestamp: block.timestamp,
            processed: true
        });

        userPayments[msg.sender].push(paymentId);
        userReceivedPayments[to].push(paymentId);

        require(
            tokenContract.transferFrom(msg.sender, to, amount),
            "Token transfer failed"
        );

        totalPaymentsProcessed++;

        emit TokenPaymentProcessed(
            paymentId,
            msg.sender,
            to,
            amount,
            token,
            label,
            block.timestamp
        );

        return paymentId;
    }

    function getPaymentDetails(bytes32 paymentId) 
        external 
        view 
        returns (Payment memory) 
    {
        return payments[paymentId];
    }

    function getUserPayments(address user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userPayments[user];
    }

    function getUserReceivedPayments(address user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userReceivedPayments[user];
    }

    function getTotalPayments() external view returns (uint256) {
        return totalPaymentsProcessed;
    }

    receive() external payable {}
}


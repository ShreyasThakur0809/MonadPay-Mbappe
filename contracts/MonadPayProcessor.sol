// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Interface for ERC20 tokens
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

/**
 * @title MonadPayProcessor V2
 * @dev Process payments via deeplink-encoded transactions
 * @notice Supports:
 *   - Native MON payments
 *   - ERC-20 token payments
 *   - Payment expiration (time-limited links)
 *   - Batch payments (multiple recipients)
 */
contract MonadPayProcessor {
    
    // ========================================
    // STRUCTS
    // ========================================
    
    /**
     * @dev Standard payment (instant, no expiration)
     */
    struct Payment {
        address from;
        address to;
        uint256 amount;
        address token; // address(0) for native MON
        string label;
        string memo;
        uint256 timestamp;
        bool processed;
    }

    /**
     * @dev Payment request (with expiration)
     * Used for invoices, tickets, time-limited offers
     */
    struct PaymentRequest {
        address payee;          // Who receives the payment
        uint256 amount;         // Payment amount
        address token;          // Token address (address(0) for MON)
        string label;           // Payment description
        string memo;            // Additional notes
        uint256 createdAt;      // Creation timestamp
        uint256 expiresAt;      // Expiration timestamp
        bool completed;         // Payment completed flag
        bool expired;           // Manual expiration flag
    }

    /**
     * @dev Batch payment (multiple recipients)
     * Used for split bills, group gifts, payroll
     */
    struct BatchPayment {
        address from;           // Payer
        address[] recipients;   // Array of recipients
        uint256[] amounts;      // Corresponding amounts
        address token;          // Token address (address(0) for MON)
        string label;           // Batch description
        uint256 timestamp;      // Payment timestamp
        bool processed;         // Completion flag
    }

    // ========================================
    // STATE VARIABLES
    // ========================================
    
    // Standard payments storage
    mapping(bytes32 => Payment) public payments;
    mapping(address => bytes32[]) public userPayments;
    mapping(address => bytes32[]) public userReceivedPayments;
    uint256 public totalPaymentsProcessed;

    // Payment requests storage (with expiration)
    mapping(bytes32 => PaymentRequest) public paymentRequests;
    uint256 public totalPaymentRequests;

    // Batch payments storage
    mapping(bytes32 => BatchPayment) public batchPayments;
    uint256 public totalBatchPayments;

    // ========================================
    // EVENTS
    // ========================================
    
    // Standard payment events
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

    // Payment request events
    event PaymentRequestCreated(
        bytes32 indexed requestId,
        address indexed payee,
        uint256 amount,
        address token,
        uint256 expiresAt,
        uint256 timestamp
    );

    event PaymentRequestCompleted(
        bytes32 indexed requestId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentRequestExpired(
        bytes32 indexed requestId,
        uint256 timestamp
    );

    // Batch payment events
    event BatchPaymentProcessed(
        bytes32 indexed batchId,
        address indexed from,
        address[] recipients,
        uint256[] amounts,
        address token,
        uint256 totalAmount,
        uint256 timestamp
    );

    // ========================================
    // CONSTRUCTOR
    // ========================================
    
    constructor() {
        totalPaymentsProcessed = 0;
        totalPaymentRequests = 0;
        totalBatchPayments = 0;
    }

    // ========================================
    // STANDARD PAYMENT FUNCTIONS
    // ========================================

    /**
     * @dev Process native MON payment (instant)
     * @param to Recipient address
     * @param label Payment label
     * @param memo Payment memo
     * @return paymentId Unique payment identifier
     */
    function processPayment(
        address payable to,
        string memory label,
        string memory memo
    ) external payable returns (bytes32) {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(to != address(0), "Invalid recipient address");

        // Generate unique payment ID
        bytes32 paymentId = keccak256(
            abi.encodePacked(
                msg.sender,
                to,
                msg.value,
                block.timestamp,
                totalPaymentsProcessed
            )
        );

        // Store payment details
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

        // Track user payments
        userPayments[msg.sender].push(paymentId);
        userReceivedPayments[to].push(paymentId);

        // Transfer native MON to recipient
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

    /**
     * @dev Process ERC-20 token payment (instant)
     * @param to Recipient address
     * @param token ERC-20 token address
     * @param amount Token amount
     * @param label Payment label
     * @param memo Payment memo
     * @return paymentId Unique payment identifier
     */
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

        // Check allowance
        require(
            tokenContract.allowance(msg.sender, address(this)) >= amount,
            "Insufficient token allowance"
        );

        // Generate unique payment ID
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

        // Store payment details
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

        // Track user payments
        userPayments[msg.sender].push(paymentId);
        userReceivedPayments[to].push(paymentId);

        // Transfer tokens to recipient
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

    // ========================================
    // PAYMENT REQUEST FUNCTIONS (WITH EXPIRATION)
    // ========================================

    /**
     * @dev Create a payment request with expiration
     * USE CASE: Invoices, event tickets, limited-time offers
     * 
     * @param amount Payment amount
     * @param token Token address (address(0) for native MON)
     * @param label Payment label
     * @param memo Payment memo
     * @param expiryDuration Duration in seconds until expiration
     * @return requestId Unique request identifier
     */
    function createPaymentRequest(
        uint256 amount,
        address token,
        string memory label,
        string memory memo,
        uint256 expiryDuration
    ) external returns (bytes32) {
        require(amount > 0, "Amount must be greater than 0");
        require(expiryDuration > 0, "Expiry duration must be greater than 0");
        require(expiryDuration <= 30 days, "Expiry too long");

        bytes32 requestId = keccak256(
            abi.encodePacked(
                msg.sender,
                amount,
                token,
                block.timestamp,
                totalPaymentRequests
            )
        );

        uint256 expiresAt = block.timestamp + expiryDuration;

        paymentRequests[requestId] = PaymentRequest({
            payee: msg.sender,
            amount: amount,
            token: token,
            label: label,
            memo: memo,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            completed: false,
            expired: false
        });

        totalPaymentRequests++;

        emit PaymentRequestCreated(
            requestId,
            msg.sender,
            amount,
            token,
            expiresAt,
            block.timestamp
        );

        return requestId;
    }

    /**
     * @dev Pay a payment request
     * USE CASE: Customer pays an invoice before it expires
     * 
     * @param requestId Payment request identifier
     */
    function payPaymentRequest(bytes32 requestId) external payable {
        PaymentRequest storage request = paymentRequests[requestId];
        
        require(request.payee != address(0), "Request does not exist");
        require(!request.completed, "Request already completed");
        require(!request.expired, "Request expired");
        require(block.timestamp <= request.expiresAt, "Request expired");

        if (request.token == address(0)) {
            // Native MON payment
            require(msg.value == request.amount, "Incorrect amount");
            (bool success, ) = request.payee.call{value: msg.value}("");
            require(success, "Transfer failed");
        } else {
            // ERC-20 token payment
            IERC20 tokenContract = IERC20(request.token);
            require(
                tokenContract.transferFrom(msg.sender, request.payee, request.amount),
                "Token transfer failed"
            );
        }

        request.completed = true;

        emit PaymentRequestCompleted(
            requestId,
            msg.sender,
            request.payee,
            request.amount,
            block.timestamp
        );
    }

    /**
     * @dev Mark expired payment request
     * @param requestId Payment request identifier
     */
    function expirePaymentRequest(bytes32 requestId) external {
        PaymentRequest storage request = paymentRequests[requestId];
        
        require(request.payee != address(0), "Request does not exist");
        require(!request.completed, "Request already completed");
        require(block.timestamp > request.expiresAt, "Request not expired yet");
        require(!request.expired, "Already marked as expired");

        request.expired = true;

        emit PaymentRequestExpired(requestId, block.timestamp);
    }

    /**
     * @dev Get payment request details
     * @param requestId Request identifier
     * @return PaymentRequest struct
     */
    function getPaymentRequest(bytes32 requestId) 
        external 
        view 
        returns (PaymentRequest memory) 
    {
        return paymentRequests[requestId];
    }

    // ========================================
    // BATCH PAYMENT FUNCTIONS
    // ========================================

    /**
     * @dev Process batch payment (multiple recipients, native MON)
     * USE CASE: Split restaurant bills, group gifts, team payments
     * 
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts for each recipient
     * @param label Payment label
     * @return batchId Unique batch identifier
     */
    function processBatchPayment(
        address[] memory recipients,
        uint256[] memory amounts,
        string memory label
    ) external payable returns (bytes32) {
        require(recipients.length > 0, "No recipients");
        require(recipients.length == amounts.length, "Length mismatch");
        require(recipients.length <= 50, "Too many recipients");

        // Calculate total
        uint256 total = 0;
        for (uint i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Amount must be greater than 0");
            require(recipients[i] != address(0), "Invalid recipient");
            total += amounts[i];
        }

        require(msg.value == total, "Incorrect total amount");

        // Generate batch ID
        bytes32 batchId = keccak256(
            abi.encodePacked(
                msg.sender,
                recipients,
                amounts,
                block.timestamp,
                totalBatchPayments
            )
        );

        // Store batch payment
        batchPayments[batchId] = BatchPayment({
            from: msg.sender,
            recipients: recipients,
            amounts: amounts,
            token: address(0),
            label: label,
            timestamp: block.timestamp,
            processed: true
        });

        // Process payments
        for (uint i = 0; i < recipients.length; i++) {
            (bool success, ) = payable(recipients[i]).call{value: amounts[i]}("");
            require(success, "Transfer failed");
        }

        totalBatchPayments++;

        emit BatchPaymentProcessed(
            batchId,
            msg.sender,
            recipients,
            amounts,
            address(0),
            total,
            block.timestamp
        );

        return batchId;
    }

    /**
     * @dev Process batch payment (multiple recipients, ERC-20 tokens)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts for each recipient
     * @param token Token address
     * @param label Payment label
     * @return batchId Unique batch identifier
     */
    function processBatchTokenPayment(
        address[] memory recipients,
        uint256[] memory amounts,
        address token,
        string memory label
    ) external returns (bytes32) {
        require(recipients.length > 0, "No recipients");
        require(recipients.length == amounts.length, "Length mismatch");
        require(recipients.length <= 50, "Too many recipients");
        require(token != address(0), "Invalid token address");

        IERC20 tokenContract = IERC20(token);

        // Calculate total
        uint256 total = 0;
        for (uint i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Amount must be greater than 0");
            require(recipients[i] != address(0), "Invalid recipient");
            total += amounts[i];
        }

        // Check allowance
        require(
            tokenContract.allowance(msg.sender, address(this)) >= total,
            "Insufficient token allowance"
        );

        // Generate batch ID
        bytes32 batchId = keccak256(
            abi.encodePacked(
                msg.sender,
                recipients,
                amounts,
                token,
                block.timestamp,
                totalBatchPayments
            )
        );

        // Store batch payment
        batchPayments[batchId] = BatchPayment({
            from: msg.sender,
            recipients: recipients,
            amounts: amounts,
            token: token,
            label: label,
            timestamp: block.timestamp,
            processed: true
        });

        // Process payments
        for (uint i = 0; i < recipients.length; i++) {
            require(
                tokenContract.transferFrom(msg.sender, recipients[i], amounts[i]),
                "Token transfer failed"
            );
        }

        totalBatchPayments++;

        emit BatchPaymentProcessed(
            batchId,
            msg.sender,
            recipients,
            amounts,
            token,
            total,
            block.timestamp
        );

        return batchId;
    }

    /**
     * @dev Get batch payment details
     * @param batchId Batch identifier
     * @return BatchPayment struct
     */
    function getBatchPayment(bytes32 batchId) 
        external 
        view 
        returns (BatchPayment memory) 
    {
        return batchPayments[batchId];
    }

    // ========================================
    // QUERY FUNCTIONS
    // ========================================

    /**
     * @dev Get payment details
     * @param paymentId Payment identifier
     * @return Payment struct
     */
    function getPaymentDetails(bytes32 paymentId) 
        external 
        view 
        returns (Payment memory) 
    {
        return payments[paymentId];
    }

    /**
     * @dev Get all payments sent by user
     * @param user User address
     * @return Array of payment IDs
     */
    function getUserPayments(address user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userPayments[user];
    }

    /**
     * @dev Get all payments received by user
     * @param user User address
     * @return Array of payment IDs
     */
    function getUserReceivedPayments(address user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userReceivedPayments[user];
    }

    /**
     * @dev Get total number of standard payments processed
     * @return Total payments count
     */
    function getTotalPayments() external view returns (uint256) {
        return totalPaymentsProcessed;
    }

    /**
     * @dev Get total number of payment requests created
     * @return Total payment requests count
     */
    function getTotalPaymentRequests() external view returns (uint256) {
        return totalPaymentRequests;
    }

    /**
     * @dev Get total number of batch payments processed
     * @return Total batch payments count
     */
    function getTotalBatchPayments() external view returns (uint256) {
        return totalBatchPayments;
    }

    // Fallback to receive MON
    receive() external payable {}
}

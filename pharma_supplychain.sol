// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SupplyChainPharma {
    address public administrator;

    enum UserRole {
        Unassigned,    // 0
        Maker,         // 1  (Manufacturer)
        Wholesaler,    // 2  (Distributor)
        Retailer,      // 3  (Pharmacy)
        EndUser        // 4  (Patient)
    }

    mapping(address => UserRole) public userRoles;
    mapping(address => bool) private hasRoleSet;

    struct Item {
        string productCode;
        uint256 serial;
        uint256 madeAt;      // unix
        uint256 expiresAt;   // unix
        address holder;
        uint256 updatedAt;
        address[] hops;      // transfer history (addresses)
    }

    // serial -> Item
    mapping(uint256 => Item) public items;
    mapping(string => bool) private productCodeUsed;
    mapping(uint256 => bool) public flagged; // rejected by patient

    event RecordedTransfer(uint256 indexed serial, address indexed fromAddr, address indexed toAddr, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == administrator, "admin only");
        _;
    }

    modifier roleIs(UserRole _r) {
        require(userRoles[msg.sender] == _r, "role mismatch");
        _;
    }

    modifier senderIsCurrentHolder(uint256 _serial) {
        require(items[_serial].holder == msg.sender, "caller not current holder");
        _;
    }

    constructor() {
        administrator = msg.sender;
        userRoles[administrator] = UserRole.Maker;
        hasRoleSet[administrator] = true;
    }

    /// @notice Assign a role to an address. Only contract admin can call.
    function setRole(address _who, UserRole _role) external onlyAdmin {
        require(!hasRoleSet[_who], "role exists");
        userRoles[_who] = _role;
        hasRoleSet[_who] = true;
    }

    /// @notice Manufacturer creates a serialized item and assigns it to a distributor
    function registerItem(
        string calldata _productCode,
        uint256 _serial,
        uint256 _madeAt,
        uint256 _expiresAt,
        address _to
    ) external roleIs(UserRole.Maker) {
        require(userRoles[_to] == UserRole.Wholesaler, "recipient must be wholesaler");
        require(items[_serial].serial == 0, "serial exists");
        require(!productCodeUsed[_productCode], "product code used");
        require(_expiresAt > _madeAt, "expiry must follow manufacture");
        require(_expiresAt > block.timestamp, "expiry must be future");

        Item storage it = items[_serial];
        it.productCode = _productCode;
        it.serial = _serial;
        it.madeAt = _madeAt;
        it.expiresAt = _expiresAt;
        it.holder = _to;
        it.updatedAt = block.timestamp;
        it.hops.push(msg.sender); // maker
        it.hops.push(_to);       // first owner (wholesaler)

        productCodeUsed[_productCode] = true;

        emit RecordedTransfer(_serial, msg.sender, _to, block.timestamp);
    }

    /// @notice Wholesaler -> Pharmacy
    function wholesalerToRetailer(uint256 _serial, address _to)
        external
        roleIs(UserRole.Wholesaler)
        senderIsCurrentHolder(_serial)
    {
        require(userRoles[_to] == UserRole.Retailer, "recipient must be retailer");

        Item storage it = items[_serial];
        it.holder = _to;
        it.updatedAt = block.timestamp;
        it.hops.push(_to);

        emit RecordedTransfer(_serial, msg.sender, _to, block.timestamp);
    }

    /// @notice Pharmacy -> Patient
    function retailerToEndUser(uint256 _serial, address _to)
        external
        roleIs(UserRole.Retailer)
        senderIsCurrentHolder(_serial)
    {
        require(userRoles[_to] == UserRole.EndUser, "recipient must be end user");

        Item storage it = items[_serial];
        it.holder = _to;
        it.updatedAt = block.timestamp;
        it.hops.push(_to);

        emit RecordedTransfer(_serial, msg.sender, _to, block.timestamp);
    }

    /// @notice Only the patient who currently holds the item can retrieve the recorded hops
    function viewHops(uint256 _serial) external view returns (address[] memory) {
        require(userRoles[msg.sender] == UserRole.EndUser, "only end user");
        require(items[_serial].holder == msg.sender, "not current holder");
        return items[_serial].hops;
    }

    /// @notice 0 = ok, 1 = expired, 2 = flagged/rejected
    function statusOf(uint256 _serial) external view returns (uint8) {
        require(userRoles[msg.sender] == UserRole.EndUser, "only end user");
        require(items[_serial].holder == msg.sender, "not current holder");

        if (flagged[_serial]) {
            return 2;
        }
        if (block.timestamp > items[_serial].expiresAt) {
            return 1;
        }
        return 0;
    }

    /// @notice End user can flag (reject) an item they hold
    function flagItem(uint256 _serial) external {
        require(userRoles[msg.sender] == UserRole.EndUser, "only end user");
        require(items[_serial].holder == msg.sender, "not current holder");
        flagged[_serial] = true;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SedulurToken (SDT)
 * @notice Token ERC20 dengan fitur Faucet terintegrasi
 * @dev Menggunakan ReentrancyGuard, cooldown 24 jam, dan Checks-Effects-Interactions pattern
 */
contract SedulurToken is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18;
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    mapping(address => uint256) private s_lastClaimTime;

    event FaucetClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    error SedulurToken__CooldownNotExpired(uint256 timeRemaining);
    error SedulurToken__InvalidAddress();

    constructor() ERC20("Sedulur Token", "SDT") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    /**
     * @notice Claim token gratis dari faucet
     * @dev Cooldown 24 jam antara setiap claim
     */
    function claimFaucet() external nonReentrant {
        if (msg.sender == address(0)) {
            revert SedulurToken__InvalidAddress();
        }

        uint256 lastClaim = s_lastClaimTime[msg.sender];
        uint256 nextClaimTime = lastClaim + FAUCET_COOLDOWN;

        if (lastClaim != 0 && block.timestamp < nextClaimTime) {
            revert SedulurToken__CooldownNotExpired(
                nextClaimTime - block.timestamp
            );
        }

        s_lastClaimTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    /**
     * @notice Mendapatkan waktu claim terakhir user
     * @param user Address user yang ingin dicek
     * @return Timestamp claim terakhir (0 jika belum pernah claim)
     */
    function getLastClaimTime(address user) external view returns (uint256) {
        return s_lastClaimTime[user];
    }

    /**
     * @notice Mengecek apakah user bisa claim faucet
     * @param user Address user yang ingin dicek
     */
    function canClaimFaucet(
        address user
    ) external view returns (bool canClaim, uint256 timeRemaining) {
        uint256 lastClaim = s_lastClaimTime[user];
        if (lastClaim == 0) {
            return (true, 0);
        }

        uint256 nextClaimTime = lastClaim + FAUCET_COOLDOWN;
        if (block.timestamp >= nextClaimTime) {
            return (true, 0);
        } else {
            return (false, nextClaimTime - block.timestamp);
        }
    }

    /**
     * @notice Mendapatkan waktu claim berikutnya
     * @param user Address user yang ingin dicek
     */
    function getNextClaimTime(address user) external view returns (uint256) {
        uint256 lastClaim = s_lastClaimTime[user];
        if (lastClaim == 0) {
            return block.timestamp;
        }
        return lastClaim + FAUCET_COOLDOWN;
    }
}

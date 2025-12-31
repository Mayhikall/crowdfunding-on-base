// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SedulurToken (SDT)
 * @author Senior Smart Contract Developer
 * @notice Token ERC20 dengan fitur Faucet terintegrasi
 * @dev Menggunakan OpenZeppelin untuk keamanan standar industri
 *
 * SECURITY FEATURES:
 * - ReentrancyGuard: Mencegah serangan reentrancy pada faucet
 * - Cooldown Period: 24 jam antara claim untuk mencegah penyalahgunaan
 * - Fixed Claim Amount: Jumlah token yang bisa di-claim sudah ditentukan
 * - Checks-Effects-Interactions Pattern: Update state sebelum transfer
 */
contract SedulurToken is ERC20, Ownable, ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Jumlah token yang bisa di-claim per faucet request
    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18; // 100 SDT

    /// @notice Cooldown period antara setiap claim (24 jam dalam detik)
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    /// @notice Mapping untuk melacak waktu claim terakhir setiap user
    /// @dev Menggunakan uint256 untuk timestamp, efisien untuk gas
    mapping(address => uint256) private s_lastClaimTime;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Event yang dipancarkan saat user berhasil claim dari faucet
    event FaucetClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    /*//////////////////////////////////////////////////////////////
                            CUSTOM ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Error ketika user mencoba claim sebelum cooldown selesai
    error SedulurToken__CooldownNotExpired(uint256 timeRemaining);

    /// @notice Error ketika address tidak valid
    error SedulurToken__InvalidAddress();

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Inisialisasi token dengan nama dan simbol
     * @dev Mint initial supply ke deployer untuk distribusi awal
     */
    constructor() ERC20("Sedulur Token", "SDT") Ownable(msg.sender) {
        // Mint 1 juta token untuk initial distribution (treasury/liquidity)
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    /*//////////////////////////////////////////////////////////////
                          EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fungsi faucet untuk mendapatkan token gratis
     * @dev Menerapkan Checks-Effects-Interactions pattern
     *
     * SECURITY NOTES:
     * 1. CHECKS: Validasi cooldown terlebih dahulu
     * 2. EFFECTS: Update state (lastClaimTime) SEBELUM transfer
     * 3. INTERACTIONS: Mint token sebagai langkah terakhir
     *
     * nonReentrant modifier mencegah serangan reentrancy
     */
    function claimFaucet() external nonReentrant {
        // ============ CHECKS ============
        // Validasi bahwa caller bukan address zero (best practice)
        if (msg.sender == address(0)) {
            revert SedulurToken__InvalidAddress();
        }

        // Cek cooldown period
        uint256 lastClaim = s_lastClaimTime[msg.sender];
        uint256 nextClaimTime = lastClaim + FAUCET_COOLDOWN;

        // Jika ini bukan claim pertama, cek apakah cooldown sudah selesai
        if (lastClaim != 0 && block.timestamp < nextClaimTime) {
            revert SedulurToken__CooldownNotExpired(
                nextClaimTime - block.timestamp
            );
        }

        // ============ EFFECTS ============
        // Update state SEBELUM melakukan transfer (CEI Pattern)
        s_lastClaimTime[msg.sender] = block.timestamp;

        // ============ INTERACTIONS ============
        // Mint token ke user
        _mint(msg.sender, FAUCET_AMOUNT);

        // Emit event untuk tracking
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

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
     * @return canClaim True jika user bisa claim
     * @return timeRemaining Waktu tersisa sebelum bisa claim (0 jika sudah bisa)
     */
    function canClaimFaucet(
        address user
    ) external view returns (bool canClaim, uint256 timeRemaining) {
        uint256 lastClaim = s_lastClaimTime[user];

        // Jika belum pernah claim, bisa claim sekarang
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
     * @return Timestamp kapan user bisa claim berikutnya
     */
    function getNextClaimTime(address user) external view returns (uint256) {
        uint256 lastClaim = s_lastClaimTime[user];
        if (lastClaim == 0) {
            return block.timestamp; // Bisa claim sekarang
        }
        return lastClaim + FAUCET_COOLDOWN;
    }
}

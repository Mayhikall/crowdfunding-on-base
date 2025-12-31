// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CrowdFunding
 * @author Senior Smart Contract Developer
 * @notice Platform crowdfunding dengan dukungan pembayaran ETH dan ERC20 Token
 * @dev Mengimplementasikan security best practices:
 *      - Checks-Effects-Interactions pattern
 *      - ReentrancyGuard untuk semua fungsi yang melibatkan transfer
 *      - SafeERC20 untuk interaksi dengan token ERC20
 *
 * SECURITY ARCHITECTURE:
 * - Setiap campaign memiliki payment type yang ditentukan saat pembuatan
 * - Dana hanya bisa ditarik creator jika target tercapai DAN waktu habis
 * - Donatur bisa refund jika target TIDAK tercapai dan waktu habis
 * - Semua operasi kritis dilindungi dengan reentrancy guard
 */
contract CrowdFunding is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                TYPES
    //////////////////////////////////////////////////////////////*/

    /// @notice Enum untuk jenis pembayaran campaign
    enum PaymentType {
        ETH, // Native ETH
        TOKEN // ERC20 Token (SDT)
    }

    /// @notice Struct untuk menyimpan data campaign
    /// @dev Dioptimasi untuk packing storage - uint128 cukup untuk jumlah dana praktis
    struct Campaign {
        address creator; // 20 bytes - alamat pembuat campaign
        PaymentType paymentType; // 1 byte - jenis pembayaran
        bool claimed; // 1 byte - status klaim dana oleh creator
        uint128 targetAmount; // 16 bytes - target dana yang ingin dikumpulkan
        uint128 amountCollected; // 16 bytes - jumlah dana yang sudah terkumpul
        uint64 deadline; // 8 bytes - waktu berakhir campaign (timestamp)
        string title; // judul campaign
        string description; // deskripsi campaign
        string imageCID; // IPFS CID untuk gambar campaign
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Token ERC20 yang diterima untuk donasi (Sedulur Token)
    IERC20 public immutable i_acceptedToken;

    /// @notice Counter untuk ID campaign berikutnya
    uint256 private s_campaignCounter;

    /// @notice Mapping dari campaign ID ke data Campaign
    mapping(uint256 => Campaign) private s_campaigns;

    /// @notice Mapping dari campaign ID => donatur address => jumlah donasi
    /// @dev Untuk tracking refund per donatur per campaign
    mapping(uint256 => mapping(address => uint256)) private s_donations;

    /// @notice Array of donator addresses per campaign (untuk view function)
    mapping(uint256 => address[]) private s_donators;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        PaymentType paymentType,
        uint128 targetAmount,
        uint64 deadline
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donator,
        uint256 amount,
        PaymentType paymentType
    );

    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amount
    );

    event RefundClaimed(
        uint256 indexed campaignId,
        address indexed donator,
        uint256 amount
    );

    /*//////////////////////////////////////////////////////////////
                            CUSTOM ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Campaign dengan ID tersebut tidak ada
    error CrowdFunding__CampaignNotFound();

    /// @notice Deadline harus di masa depan
    error CrowdFunding__InvalidDeadline();

    /// @notice Target amount harus lebih dari 0
    error CrowdFunding__InvalidTargetAmount();

    /// @notice Campaign sudah berakhir
    error CrowdFunding__CampaignEnded();

    /// @notice Campaign belum berakhir
    error CrowdFunding__CampaignNotEnded();

    /// @notice Bukan creator campaign
    error CrowdFunding__NotCreator();

    /// @notice Target belum tercapai
    error CrowdFunding__TargetNotReached();

    /// @notice Dana sudah diklaim
    error CrowdFunding__AlreadyClaimed();

    /// @notice Tidak ada donasi untuk di-refund
    error CrowdFunding__NoDonationToRefund();

    /// @notice Target sudah tercapai, tidak bisa refund
    error CrowdFunding__TargetReached();

    /// @notice Jumlah donasi tidak valid
    error CrowdFunding__InvalidDonationAmount();

    /// @notice Payment type tidak sesuai
    error CrowdFunding__WrongPaymentType();

    /// @notice Transfer ETH gagal
    error CrowdFunding__TransferFailed();

    /// @notice Title tidak boleh kosong
    error CrowdFunding__EmptyTitle();

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Inisialisasi kontrak dengan token yang diterima
     * @param acceptedToken Alamat token ERC20 yang diterima (Sedulur Token)
     */
    constructor(address acceptedToken) Ownable(msg.sender) {
        i_acceptedToken = IERC20(acceptedToken);
    }

    /*//////////////////////////////////////////////////////////////
                          EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Membuat campaign baru
     * @param title Judul campaign
     * @param description Deskripsi campaign
     * @param targetAmount Target dana yang ingin dikumpulkan
     * @param duration Durasi campaign dalam detik
     * @param imageCID IPFS CID untuk gambar campaign
     * @param paymentType Jenis pembayaran (ETH atau TOKEN)
     * @return campaignId ID campaign yang baru dibuat
     *
     * @dev SECURITY: Validasi semua input sebelum state change
     */
    function createCampaign(
        string calldata title,
        string calldata description,
        uint128 targetAmount,
        uint64 duration,
        string calldata imageCID,
        PaymentType paymentType
    ) external returns (uint256 campaignId) {
        // ============ CHECKS ============
        if (bytes(title).length == 0) {
            revert CrowdFunding__EmptyTitle();
        }
        if (targetAmount == 0) {
            revert CrowdFunding__InvalidTargetAmount();
        }
        if (duration == 0) {
            revert CrowdFunding__InvalidDeadline();
        }

        // Calculate deadline
        uint64 deadline = uint64(block.timestamp) + duration;

        // ============ EFFECTS ============
        campaignId = s_campaignCounter;
        s_campaignCounter++;

        s_campaigns[campaignId] = Campaign({
            creator: msg.sender,
            paymentType: paymentType,
            claimed: false,
            targetAmount: targetAmount,
            amountCollected: 0,
            deadline: deadline,
            title: title,
            description: description,
            imageCID: imageCID
        });

        // ============ INTERACTIONS ============
        emit CampaignCreated(
            campaignId,
            msg.sender,
            paymentType,
            targetAmount,
            deadline
        );
    }

    /**
     * @notice Donasi menggunakan ETH (Native)
     * @param campaignId ID campaign yang ingin didonasikan
     *
     * @dev SECURITY NOTES:
     * - nonReentrant mencegah reentrancy attack
     * - Checks-Effects-Interactions pattern diterapkan
     * - Validasi payment type harus ETH
     */
    function donateETH(uint256 campaignId) external payable nonReentrant {
        Campaign storage campaign = s_campaigns[campaignId];

        // ============ CHECKS ============
        if (campaign.creator == address(0)) {
            revert CrowdFunding__CampaignNotFound();
        }
        if (campaign.paymentType != PaymentType.ETH) {
            revert CrowdFunding__WrongPaymentType();
        }
        if (block.timestamp > campaign.deadline) {
            revert CrowdFunding__CampaignEnded();
        }
        if (msg.value == 0) {
            revert CrowdFunding__InvalidDonationAmount();
        }

        // ============ EFFECTS ============
        // Update state SEBELUM interaksi eksternal (CEI Pattern)
        campaign.amountCollected += uint128(msg.value);

        // Track donasi per user untuk refund
        if (s_donations[campaignId][msg.sender] == 0) {
            s_donators[campaignId].push(msg.sender);
        }
        s_donations[campaignId][msg.sender] += msg.value;

        // ============ INTERACTIONS ============
        emit DonationReceived(
            campaignId,
            msg.sender,
            msg.value,
            PaymentType.ETH
        );
    }

    /**
     * @notice Donasi menggunakan ERC20 Token (Sedulur Token)
     * @param campaignId ID campaign yang ingin didonasikan
     * @param amount Jumlah token yang ingin didonasikan
     *
     * @dev SECURITY NOTES:
     * - nonReentrant mencegah reentrancy attack
     * - SafeERC20 digunakan untuk transfer yang aman
     * - Checks-Effects-Interactions pattern diterapkan
     * - User harus approve kontrak terlebih dahulu
     */
    function donateToken(
        uint256 campaignId,
        uint256 amount
    ) external nonReentrant {
        Campaign storage campaign = s_campaigns[campaignId];

        // ============ CHECKS ============
        if (campaign.creator == address(0)) {
            revert CrowdFunding__CampaignNotFound();
        }
        if (campaign.paymentType != PaymentType.TOKEN) {
            revert CrowdFunding__WrongPaymentType();
        }
        if (block.timestamp > campaign.deadline) {
            revert CrowdFunding__CampaignEnded();
        }
        if (amount == 0) {
            revert CrowdFunding__InvalidDonationAmount();
        }

        // ============ EFFECTS ============
        // Update state SEBELUM transfer eksternal (CEI Pattern)
        campaign.amountCollected += uint128(amount);

        // Track donasi per user untuk refund
        if (s_donations[campaignId][msg.sender] == 0) {
            s_donators[campaignId].push(msg.sender);
        }
        s_donations[campaignId][msg.sender] += amount;

        // ============ INTERACTIONS ============
        // SafeERC20: Aman untuk token yang tidak return bool
        i_acceptedToken.safeTransferFrom(msg.sender, address(this), amount);

        emit DonationReceived(
            campaignId,
            msg.sender,
            amount,
            PaymentType.TOKEN
        );
    }

    /**
     * @notice Creator menarik dana setelah campaign berhasil
     * @param campaignId ID campaign yang ingin ditarik dananya
     *
     * @dev SECURITY NOTES:
     * - HANYA creator yang bisa withdraw
     * - HANYA jika target TERCAPAI dan deadline SUDAH lewat
     * - nonReentrant mencegah reentrancy
     * - claimed flag mencegah double withdrawal
     * - CEI pattern: state update sebelum transfer
     */
    function withdraw(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = s_campaigns[campaignId];

        // ============ CHECKS ============
        if (campaign.creator == address(0)) {
            revert CrowdFunding__CampaignNotFound();
        }
        if (msg.sender != campaign.creator) {
            revert CrowdFunding__NotCreator();
        }
        if (block.timestamp <= campaign.deadline) {
            revert CrowdFunding__CampaignNotEnded();
        }
        if (campaign.amountCollected < campaign.targetAmount) {
            revert CrowdFunding__TargetNotReached();
        }
        if (campaign.claimed) {
            revert CrowdFunding__AlreadyClaimed();
        }

        // ============ EFFECTS ============
        // Mark as claimed SEBELUM transfer (mencegah reentrancy)
        campaign.claimed = true;
        uint256 amount = campaign.amountCollected;

        // ============ INTERACTIONS ============
        if (campaign.paymentType == PaymentType.ETH) {
            // Transfer ETH ke creator
            (bool success, ) = payable(campaign.creator).call{value: amount}(
                ""
            );
            if (!success) {
                revert CrowdFunding__TransferFailed();
            }
        } else {
            // Transfer token ke creator
            i_acceptedToken.safeTransfer(campaign.creator, amount);
        }

        emit FundsWithdrawn(campaignId, campaign.creator, amount);
    }

    /**
     * @notice Donatur meminta refund jika campaign gagal
     * @param campaignId ID campaign yang ingin di-refund
     *
     * @dev SECURITY NOTES:
     * - HANYA jika target TIDAK tercapai dan deadline SUDAH lewat
     * - nonReentrant mencegah reentrancy
     * - CEI pattern: reset donasi sebelum transfer
     * - Menggunakan pattern "Pull over Push" untuk keamanan
     */
    function refund(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = s_campaigns[campaignId];

        // ============ CHECKS ============
        if (campaign.creator == address(0)) {
            revert CrowdFunding__CampaignNotFound();
        }
        if (block.timestamp <= campaign.deadline) {
            revert CrowdFunding__CampaignNotEnded();
        }
        // Refund hanya jika target TIDAK tercapai
        if (campaign.amountCollected >= campaign.targetAmount) {
            revert CrowdFunding__TargetReached();
        }

        uint256 donatedAmount = s_donations[campaignId][msg.sender];
        if (donatedAmount == 0) {
            revert CrowdFunding__NoDonationToRefund();
        }

        // ============ EFFECTS ============
        // Reset donasi SEBELUM transfer (Mencegah reentrancy - CEI Pattern)
        s_donations[campaignId][msg.sender] = 0;

        // Note: Tidak perlu update amountCollected karena campaign sudah gagal

        // ============ INTERACTIONS ============
        if (campaign.paymentType == PaymentType.ETH) {
            (bool success, ) = payable(msg.sender).call{value: donatedAmount}(
                ""
            );
            if (!success) {
                revert CrowdFunding__TransferFailed();
            }
        } else {
            i_acceptedToken.safeTransfer(msg.sender, donatedAmount);
        }

        emit RefundClaimed(campaignId, msg.sender, donatedAmount);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Mendapatkan detail campaign
     * @param campaignId ID campaign
     * @return campaign Data campaign lengkap
     */
    function getCampaign(
        uint256 campaignId
    ) external view returns (Campaign memory) {
        return s_campaigns[campaignId];
    }

    /**
     * @notice Mendapatkan jumlah campaign yang telah dibuat
     * @return Total jumlah campaign
     */
    function getCampaignCount() external view returns (uint256) {
        return s_campaignCounter;
    }

    /**
     * @notice Mendapatkan jumlah donasi user untuk campaign tertentu
     * @param campaignId ID campaign
     * @param donator Address donatur
     * @return Jumlah yang telah didonasikan
     */
    function getDonation(
        uint256 campaignId,
        address donator
    ) external view returns (uint256) {
        return s_donations[campaignId][donator];
    }

    /**
     * @notice Mendapatkan daftar donatur campaign
     * @param campaignId ID campaign
     * @return Array of donatur addresses
     */
    function getDonators(
        uint256 campaignId
    ) external view returns (address[] memory) {
        return s_donators[campaignId];
    }

    /**
     * @notice Mengecek apakah campaign masih aktif
     * @param campaignId ID campaign
     * @return True jika campaign masih aktif
     */
    function isCampaignActive(uint256 campaignId) external view returns (bool) {
        Campaign storage campaign = s_campaigns[campaignId];
        return
            campaign.creator != address(0) &&
            block.timestamp <= campaign.deadline &&
            !campaign.claimed;
    }

    /**
     * @notice Mengecek apakah campaign berhasil mencapai target
     * @param campaignId ID campaign
     * @return True jika target tercapai
     */
    function isCampaignSuccessful(
        uint256 campaignId
    ) external view returns (bool) {
        Campaign storage campaign = s_campaigns[campaignId];
        return campaign.amountCollected >= campaign.targetAmount;
    }

    /**
     * @notice Mendapatkan semua campaign (dengan pagination)
     * @param start Index awal
     * @param limit Jumlah maksimal campaign yang dikembalikan
     * @return campaigns Array of campaign data
     */
    function getCampaigns(
        uint256 start,
        uint256 limit
    ) external view returns (Campaign[] memory campaigns) {
        uint256 total = s_campaignCounter;
        if (start >= total) {
            return new Campaign[](0);
        }

        uint256 end = start + limit;
        if (end > total) {
            end = total;
        }

        campaigns = new Campaign[](end - start);
        for (uint256 i = start; i < end; i++) {
            campaigns[i - start] = s_campaigns[i];
        }
    }
}

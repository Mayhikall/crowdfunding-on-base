// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CrowdFunding
 * @notice Platform crowdfunding dengan dukungan pembayaran ETH dan ERC20 Token
 */
contract CrowdFunding is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    enum PaymentType {
        ETH, // Native ETH
        TOKEN // ERC20 Token (SDT)
    }

    struct Campaign {
        address creator;
        PaymentType paymentType;
        bool claimed;
        uint128 targetAmount;
        uint128 amountCollected;
        uint64 deadline;
        string title;
        string description;
        string imageCID;
    }

    IERC20 public immutable i_acceptedToken;
    uint256 private s_campaignCounter;
    mapping(uint256 => Campaign) private s_campaigns;
    mapping(uint256 => mapping(address => uint256)) private s_donations;
    mapping(uint256 => address[]) private s_donators;

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

    error CrowdFunding__CampaignNotFound();
    error CrowdFunding__InvalidDeadline();
    error CrowdFunding__InvalidTargetAmount();
    error CrowdFunding__CampaignEnded();
    error CrowdFunding__CampaignNotEnded();
    error CrowdFunding__NotCreator();
    error CrowdFunding__TargetNotReached();
    error CrowdFunding__AlreadyClaimed();
    error CrowdFunding__NoDonationToRefund();
    error CrowdFunding__TargetReached();
    error CrowdFunding__InvalidDonationAmount();
    error CrowdFunding__WrongPaymentType();
    error CrowdFunding__TransferFailed();
    error CrowdFunding__EmptyTitle();

    constructor(address acceptedToken) Ownable(msg.sender) {
        i_acceptedToken = IERC20(acceptedToken);
    }

    function createCampaign(
        string calldata title,
        string calldata description,
        uint128 targetAmount,
        uint64 duration,
        string calldata imageCID,
        PaymentType paymentType
    ) external returns (uint256 campaignId) {
        if (bytes(title).length == 0) {
            revert CrowdFunding__EmptyTitle();
        }
        if (targetAmount == 0) {
            revert CrowdFunding__InvalidTargetAmount();
        }
        if (duration == 0) {
            revert CrowdFunding__InvalidDeadline();
        }

        uint64 deadline = uint64(block.timestamp) + duration;
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

        emit CampaignCreated(
            campaignId,
            msg.sender,
            paymentType,
            targetAmount,
            deadline
        );
    }

    function donateETH(uint256 campaignId) external payable nonReentrant {
        Campaign storage campaign = s_campaigns[campaignId];
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

        campaign.amountCollected += uint128(msg.value);
        if (s_donations[campaignId][msg.sender] == 0) {
            s_donators[campaignId].push(msg.sender);
        }
        s_donations[campaignId][msg.sender] += msg.value;

        emit DonationReceived(
            campaignId,
            msg.sender,
            msg.value,
            PaymentType.ETH
        );
    }

    function donateToken(
        uint256 campaignId,
        uint256 amount
    ) external nonReentrant {
        Campaign storage campaign = s_campaigns[campaignId];
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

        campaign.amountCollected += uint128(amount);
        if (s_donations[campaignId][msg.sender] == 0) {
            s_donators[campaignId].push(msg.sender);
        }
        s_donations[campaignId][msg.sender] += amount;

        i_acceptedToken.safeTransferFrom(msg.sender, address(this), amount);

        emit DonationReceived(
            campaignId,
            msg.sender,
            amount,
            PaymentType.TOKEN
        );
    }

    function withdraw(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = s_campaigns[campaignId];
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

        campaign.claimed = true;
        uint256 amount = campaign.amountCollected;
        if (campaign.paymentType == PaymentType.ETH) {
            (bool success, ) = payable(campaign.creator).call{value: amount}(
                ""
            );
            if (!success) {
                revert CrowdFunding__TransferFailed();
            }
        } else {
            i_acceptedToken.safeTransfer(campaign.creator, amount);
        }

        emit FundsWithdrawn(campaignId, campaign.creator, amount);
    }

    function refund(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = s_campaigns[campaignId];
        if (campaign.creator == address(0)) {
            revert CrowdFunding__CampaignNotFound();
        }
        if (block.timestamp <= campaign.deadline) {
            revert CrowdFunding__CampaignNotEnded();
        }
        if (campaign.amountCollected >= campaign.targetAmount) {
            revert CrowdFunding__TargetReached();
        }

        uint256 donatedAmount = s_donations[campaignId][msg.sender];
        if (donatedAmount == 0) {
            revert CrowdFunding__NoDonationToRefund();
        }

        s_donations[campaignId][msg.sender] = 0;
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

    function getCampaign(
        uint256 campaignId
    ) external view returns (Campaign memory) {
        return s_campaigns[campaignId];
    }

    function getCampaignCount() external view returns (uint256) {
        return s_campaignCounter;
    }

    function getDonation(
        uint256 campaignId,
        address donator
    ) external view returns (uint256) {
        return s_donations[campaignId][donator];
    }

    function getDonators(
        uint256 campaignId
    ) external view returns (address[] memory) {
        return s_donators[campaignId];
    }

    function isCampaignActive(uint256 campaignId) external view returns (bool) {
        Campaign storage campaign = s_campaigns[campaignId];
        return
            campaign.creator != address(0) &&
            block.timestamp <= campaign.deadline &&
            !campaign.claimed;
    }

    function isCampaignSuccessful(
        uint256 campaignId
    ) external view returns (bool) {
        Campaign storage campaign = s_campaigns[campaignId];
        return campaign.amountCollected >= campaign.targetAmount;
    }

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

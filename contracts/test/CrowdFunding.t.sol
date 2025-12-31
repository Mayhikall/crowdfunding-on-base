// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {SedulurToken} from "../src/SedulurToken.sol";
import {CrowdFunding} from "../src/CrowdFunding.sol";

contract SedulurTokenTest is Test {
    SedulurToken public token;
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    function setUp() public {
        token = new SedulurToken();
    }

    function test_InitialSupply() public view {
        assertEq(token.totalSupply(), 1_000_000 * 10 ** 18);
        assertEq(token.balanceOf(address(this)), 1_000_000 * 10 ** 18);
    }

    function test_TokenNameAndSymbol() public view {
        assertEq(token.name(), "Sedulur Token");
        assertEq(token.symbol(), "SDT");
    }

    function test_ClaimFaucet() public {
        vm.prank(user1);
        token.claimFaucet();

        assertEq(token.balanceOf(user1), 100 * 10 ** 18);
    }

    function test_CannotClaimFaucetTwiceInCooldown() public {
        vm.startPrank(user1);
        token.claimFaucet();

        // Try to claim again immediately
        vm.expectRevert();
        token.claimFaucet();
        vm.stopPrank();
    }

    function test_CanClaimAfterCooldown() public {
        vm.startPrank(user1);
        token.claimFaucet();
        assertEq(token.balanceOf(user1), 100 * 10 ** 18);

        // Warp 24 hours
        vm.warp(block.timestamp + 24 hours + 1);
        token.claimFaucet();
        assertEq(token.balanceOf(user1), 200 * 10 ** 18);
        vm.stopPrank();
    }

    function test_CanClaimFaucetCheck() public {
        (bool canClaim, uint256 timeRemaining) = token.canClaimFaucet(user1);
        assertTrue(canClaim);
        assertEq(timeRemaining, 0);

        vm.prank(user1);
        token.claimFaucet();

        (canClaim, timeRemaining) = token.canClaimFaucet(user1);
        assertFalse(canClaim);
        assertGt(timeRemaining, 0);
    }
}

contract CrowdFundingTest is Test {
    SedulurToken public token;
    CrowdFunding public crowdfunding;

    address public creator = makeAddr("creator");
    address public donor1 = makeAddr("donor1");
    address public donor2 = makeAddr("donor2");

    uint128 public constant TARGET_AMOUNT = 10 ether;
    uint64 public constant DURATION = 7 days;

    function setUp() public {
        token = new SedulurToken();
        crowdfunding = new CrowdFunding(address(token));

        // Give donors some ETH and tokens
        vm.deal(donor1, 100 ether);
        vm.deal(donor2, 100 ether);

        // Transfer tokens to donors
        token.transfer(donor1, 1000 * 10 ** 18);
        token.transfer(donor2, 1000 * 10 ** 18);
    }

    /*//////////////////////////////////////////////////////////////
                          CAMPAIGN CREATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_CreateCampaignETH() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "Test Campaign",
            "Test Description",
            TARGET_AMOUNT,
            DURATION,
            "QmTestCID",
            CrowdFunding.PaymentType.ETH
        );

        CrowdFunding.Campaign memory campaign = crowdfunding.getCampaign(
            campaignId
        );

        assertEq(campaign.creator, creator);
        assertEq(campaign.targetAmount, TARGET_AMOUNT);
        assertEq(
            uint8(campaign.paymentType),
            uint8(CrowdFunding.PaymentType.ETH)
        );
        assertEq(campaign.amountCollected, 0);
        assertFalse(campaign.claimed);
    }

    function test_CreateCampaignToken() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "Token Campaign",
            "Test Description",
            1000 * 10 ** 18,
            DURATION,
            "QmTestCID",
            CrowdFunding.PaymentType.TOKEN
        );

        CrowdFunding.Campaign memory campaign = crowdfunding.getCampaign(
            campaignId
        );
        assertEq(
            uint8(campaign.paymentType),
            uint8(CrowdFunding.PaymentType.TOKEN)
        );
    }

    function test_RevertCreateCampaignEmptyTitle() public {
        vm.prank(creator);
        vm.expectRevert(CrowdFunding.CrowdFunding__EmptyTitle.selector);
        crowdfunding.createCampaign(
            "",
            "Description",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );
    }

    function test_RevertCreateCampaignZeroTarget() public {
        vm.prank(creator);
        vm.expectRevert(
            CrowdFunding.CrowdFunding__InvalidTargetAmount.selector
        );
        crowdfunding.createCampaign(
            "Title",
            "Description",
            0,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );
    }

    /*//////////////////////////////////////////////////////////////
                            DONATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_DonateETH() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "ETH Campaign",
            "Description",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );

        vm.prank(donor1);
        crowdfunding.donateETH{value: 5 ether}(campaignId);

        CrowdFunding.Campaign memory campaign = crowdfunding.getCampaign(
            campaignId
        );
        assertEq(campaign.amountCollected, 5 ether);
        assertEq(crowdfunding.getDonation(campaignId, donor1), 5 ether);
    }

    function test_DonateToken() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "Token Campaign",
            "Description",
            500 * 10 ** 18,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.TOKEN
        );

        vm.startPrank(donor1);
        token.approve(address(crowdfunding), 200 * 10 ** 18);
        crowdfunding.donateToken(campaignId, 200 * 10 ** 18);
        vm.stopPrank();

        CrowdFunding.Campaign memory campaign = crowdfunding.getCampaign(
            campaignId
        );
        assertEq(campaign.amountCollected, 200 * 10 ** 18);
    }

    function test_RevertDonateWrongPaymentType() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "ETH Campaign",
            "Description",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );

        vm.startPrank(donor1);
        token.approve(address(crowdfunding), 100 * 10 ** 18);
        vm.expectRevert(CrowdFunding.CrowdFunding__WrongPaymentType.selector);
        crowdfunding.donateToken(campaignId, 100 * 10 ** 18);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                            WITHDRAW TESTS
    //////////////////////////////////////////////////////////////*/

    function test_WithdrawETH() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "ETH Campaign",
            "Description",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );

        // Donate enough to reach target
        vm.prank(donor1);
        crowdfunding.donateETH{value: TARGET_AMOUNT}(campaignId);

        // Warp past deadline
        vm.warp(block.timestamp + DURATION + 1);

        uint256 creatorBalanceBefore = creator.balance;

        vm.prank(creator);
        crowdfunding.withdraw(campaignId);

        assertEq(creator.balance, creatorBalanceBefore + TARGET_AMOUNT);

        CrowdFunding.Campaign memory campaign = crowdfunding.getCampaign(
            campaignId
        );
        assertTrue(campaign.claimed);
    }

    function test_WithdrawToken() public {
        uint128 tokenTarget = 500 * 10 ** 18;

        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "Token Campaign",
            "Description",
            tokenTarget,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.TOKEN
        );

        // Donate tokens
        vm.startPrank(donor1);
        token.approve(address(crowdfunding), tokenTarget);
        crowdfunding.donateToken(campaignId, tokenTarget);
        vm.stopPrank();

        // Warp past deadline
        vm.warp(block.timestamp + DURATION + 1);

        uint256 creatorBalanceBefore = token.balanceOf(creator);

        vm.prank(creator);
        crowdfunding.withdraw(campaignId);

        assertEq(token.balanceOf(creator), creatorBalanceBefore + tokenTarget);
    }

    function test_RevertWithdrawNotCreator() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "ETH Campaign",
            "Description",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );

        vm.prank(donor1);
        crowdfunding.donateETH{value: TARGET_AMOUNT}(campaignId);

        vm.warp(block.timestamp + DURATION + 1);

        vm.prank(donor1);
        vm.expectRevert(CrowdFunding.CrowdFunding__NotCreator.selector);
        crowdfunding.withdraw(campaignId);
    }

    function test_RevertWithdrawBeforeDeadline() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "ETH Campaign",
            "Description",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );

        vm.prank(donor1);
        crowdfunding.donateETH{value: TARGET_AMOUNT}(campaignId);

        vm.prank(creator);
        vm.expectRevert(CrowdFunding.CrowdFunding__CampaignNotEnded.selector);
        crowdfunding.withdraw(campaignId);
    }

    function test_RevertWithdrawTargetNotReached() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "ETH Campaign",
            "Description",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );

        vm.prank(donor1);
        crowdfunding.donateETH{value: 1 ether}(campaignId); // Less than target

        vm.warp(block.timestamp + DURATION + 1);

        vm.prank(creator);
        vm.expectRevert(CrowdFunding.CrowdFunding__TargetNotReached.selector);
        crowdfunding.withdraw(campaignId);
    }

    /*//////////////////////////////////////////////////////////////
                            REFUND TESTS
    //////////////////////////////////////////////////////////////*/

    function test_RefundETH() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "ETH Campaign",
            "Description",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );

        vm.prank(donor1);
        crowdfunding.donateETH{value: 3 ether}(campaignId);

        // Warp past deadline (target not reached)
        vm.warp(block.timestamp + DURATION + 1);

        uint256 donorBalanceBefore = donor1.balance;

        vm.prank(donor1);
        crowdfunding.refund(campaignId);

        assertEq(donor1.balance, donorBalanceBefore + 3 ether);
        assertEq(crowdfunding.getDonation(campaignId, donor1), 0);
    }

    function test_RefundToken() public {
        uint128 tokenTarget = 500 * 10 ** 18;

        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "Token Campaign",
            "Description",
            tokenTarget,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.TOKEN
        );

        vm.startPrank(donor1);
        token.approve(address(crowdfunding), 200 * 10 ** 18);
        crowdfunding.donateToken(campaignId, 200 * 10 ** 18);
        vm.stopPrank();

        // Warp past deadline (target not reached)
        vm.warp(block.timestamp + DURATION + 1);

        uint256 donorBalanceBefore = token.balanceOf(donor1);

        vm.prank(donor1);
        crowdfunding.refund(campaignId);

        assertEq(token.balanceOf(donor1), donorBalanceBefore + 200 * 10 ** 18);
    }

    function test_RevertRefundTargetReached() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "ETH Campaign",
            "Description",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );

        vm.prank(donor1);
        crowdfunding.donateETH{value: TARGET_AMOUNT}(campaignId);

        vm.warp(block.timestamp + DURATION + 1);

        vm.prank(donor1);
        vm.expectRevert(CrowdFunding.CrowdFunding__TargetReached.selector);
        crowdfunding.refund(campaignId);
    }

    function test_RevertRefundNoDonation() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "ETH Campaign",
            "Description",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );

        vm.prank(donor1);
        crowdfunding.donateETH{value: 1 ether}(campaignId);

        vm.warp(block.timestamp + DURATION + 1);

        vm.prank(donor2); // donor2 did not donate
        vm.expectRevert(CrowdFunding.CrowdFunding__NoDonationToRefund.selector);
        crowdfunding.refund(campaignId);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetCampaigns() public {
        vm.startPrank(creator);
        crowdfunding.createCampaign(
            "Campaign 1",
            "Desc",
            TARGET_AMOUNT,
            DURATION,
            "CID1",
            CrowdFunding.PaymentType.ETH
        );
        crowdfunding.createCampaign(
            "Campaign 2",
            "Desc",
            TARGET_AMOUNT,
            DURATION,
            "CID2",
            CrowdFunding.PaymentType.TOKEN
        );
        crowdfunding.createCampaign(
            "Campaign 3",
            "Desc",
            TARGET_AMOUNT,
            DURATION,
            "CID3",
            CrowdFunding.PaymentType.ETH
        );
        vm.stopPrank();

        CrowdFunding.Campaign[] memory campaigns = crowdfunding.getCampaigns(
            0,
            10
        );
        assertEq(campaigns.length, 3);
        assertEq(campaigns[0].title, "Campaign 1");
        assertEq(campaigns[2].title, "Campaign 3");
    }

    function test_IsCampaignActive() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "Campaign",
            "Desc",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );

        assertTrue(crowdfunding.isCampaignActive(campaignId));

        vm.warp(block.timestamp + DURATION + 1);
        assertFalse(crowdfunding.isCampaignActive(campaignId));
    }

    function test_GetDonators() public {
        vm.prank(creator);
        uint256 campaignId = crowdfunding.createCampaign(
            "Campaign",
            "Desc",
            TARGET_AMOUNT,
            DURATION,
            "CID",
            CrowdFunding.PaymentType.ETH
        );

        vm.prank(donor1);
        crowdfunding.donateETH{value: 1 ether}(campaignId);

        vm.prank(donor2);
        crowdfunding.donateETH{value: 2 ether}(campaignId);

        address[] memory donators = crowdfunding.getDonators(campaignId);
        assertEq(donators.length, 2);
        assertEq(donators[0], donor1);
        assertEq(donators[1], donor2);
    }
}

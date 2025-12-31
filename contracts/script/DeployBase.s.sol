// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {SedulurToken} from "../src/SedulurToken.sol";
import {CrowdFunding} from "../src/CrowdFunding.sol";

/**
 * @title DeployBase
 * @notice Script untuk deploy SedulurToken dan CrowdFunding ke Base Sepolia
 * @dev Jalankan dengan: forge script script/DeployBase.sol --rpc-url <RPC_URL> --broadcast
 */
contract DeployBase is Script {
    function run() external returns (SedulurToken, CrowdFunding) {
        vm.startBroadcast();

        // 1. Deploy SedulurToken terlebih dahulu
        SedulurToken sedulurToken = new SedulurToken();
        console.log("SedulurToken deployed at:", address(sedulurToken));

        // 2. Deploy CrowdFunding dengan alamat SedulurToken
        CrowdFunding crowdfunding = new CrowdFunding(address(sedulurToken));
        console.log("CrowdFunding deployed at:", address(crowdfunding));

        vm.stopBroadcast();

        return (sedulurToken, crowdfunding);
    }
}

export const DOUBLE_OR_NOTHING_SOLIDITY = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DoubleOrNothingArcade
 * @notice 1980s Retro Arcade "Double or Nothing" Decentralized Coin Flip on BOT Chain Mainnet
 * @dev Network: BOT Chain Mainnet (Chain ID: 677)
 *      RPC URL: https://rpc.botchain.ai
 *      Contract: 0xFD51797C48f75aF10761F92Bdd639e4518358324
 *      Explorer: https://scan.botchain.ai/address/0xFD51797C48f75aF10761F92Bdd639e4518358324
 */

interface IVRFCoordinatorV2 {
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);
}

contract DoubleOrNothing {
    // ---------------------------------------------------------
    // CONSTANTS & CONFIGURATION
    // ---------------------------------------------------------
    uint256 public constant MAX_BET_PERCENTAGE = 5; // Max bet = 5% of house bankroll
    uint256 public constant HOUSE_EDGE_BPS = 0;     // Pure 50/50 fair odds (0% edge for retro arcade experience)
    
    enum Choice { HEADS, TAILS }
    enum Engine { PSEUDO_BLOCKHASH, CHAINLINK_VRF }

    struct ActiveStreak {
        address player;
        uint256 currentWager;
        uint256 streakCount;
        Choice lastChoice;
        bool exists;
    }

    address public owner;
    uint256 public totalBankroll;
    uint256 public totalVolumeFlipped;
    uint256 public totalPayoutsClaimed;
    uint256 public totalFlipsExecuted;

    mapping(address => ActiveStreak) public activeStreaks;

    // ---------------------------------------------------------
    // EVENTS (ARCADE CRT TELEMETRY)
    // ---------------------------------------------------------
    event BetPlaced(address indexed player, uint256 wager, Choice choice, Engine engine);
    event CoinFlipped(
        address indexed player, 
        Choice choice, 
        Choice outcome, 
        bool won, 
        uint256 payout, 
        uint256 streak,
        bytes32 provableHash
    );
    event StreakDoubled(address indexed player, uint256 newWager, uint256 streakCount);
    event WinningsCashedOut(address indexed player, uint256 amount);
    event BankrollDeposited(address indexed funder, uint256 amount);
    event BankrollWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "ARCADE: NOT OWNER");
        _;
    }

    constructor() payable {
        owner = msg.sender;
        totalBankroll = msg.value;
    }

    // ---------------------------------------------------------
    // HOUSE BANKROLL MANAGEMENT
    // ---------------------------------------------------------
    receive() external payable {
        totalBankroll += msg.value;
        emit BankrollDeposited(msg.sender, msg.value);
    }

    function depositBankroll() external payable {
        require(msg.value > 0, "INVALID_DEPOSIT");
        totalBankroll += msg.value;
        emit BankrollDeposited(msg.sender, msg.value);
    }

    function withdrawBankroll(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "INSUFFICIENT_FUNDS");
        totalBankroll -= amount;
        (bool ok, ) = payable(owner).call{value: amount}("");
        require(ok, "TRANSFER_FAILED");
        emit BankrollWithdrawn(owner, amount);
    }

    // ---------------------------------------------------------
    // CORE FLIP TRANSACTION
    // ---------------------------------------------------------
    /**
     * @notice Initiates a 50/50 coin flip.
     * @param choice 0 = HEADS, 1 = TAILS
     */
    function flipCoin(Choice choice) external payable {
        require(msg.value > 0, "MIN_BET_EXCEEDED");
        uint256 maxBet = (address(this).balance * MAX_BET_PERCENTAGE) / 100;
        require(msg.value <= maxBet || address(this).balance == 0, "BET_EXCEEDS_BANKROLL_LIMIT");

        totalVolumeFlipped += msg.value;
        totalFlipsExecuted += 1;

        // Commit-entropy generation (EVM blockhash + prevrandao + nonce)
        bytes32 entropyHash = keccak256(
            abi.encodePacked(
                block.prevrandao,
                block.timestamp,
                msg.sender,
                totalFlipsExecuted,
                blockhash(block.number - 1)
            )
        );

        Choice outcome = (uint256(entropyHash) % 2 == 0) ? Choice.HEADS : Choice.TAILS;
        bool won = (choice == outcome);

        if (won) {
            uint256 winningPayout = msg.value * 2;
            require(address(this).balance >= winningPayout, "HOUSE_INSOLVENT");

            // Set up active streak in case player desires to Double Again!
            activeStreaks[msg.sender] = ActiveStreak({
                player: msg.sender,
                currentWager: winningPayout,
                streakCount: 1,
                lastChoice: choice,
                exists: true
            });

            emit CoinFlipped(msg.sender, choice, outcome, true, winningPayout, 1, entropyHash);
        } else {
            // House retains wager
            delete activeStreaks[msg.sender];
            emit CoinFlipped(msg.sender, choice, outcome, false, 0, 0, entropyHash);
        }
    }

    /**
     * @notice Double or Nothing: Stake your uncollected winnings to 2x again!
     */
    function doubleAgain(Choice choice) external {
        ActiveStreak storage streak = activeStreaks[msg.sender];
        require(streak.exists, "NO_ACTIVE_WIN_TO_DOUBLE");
        
        uint256 currentStake = streak.currentWager;
        uint256 potentialPayout = currentStake * 2;
        require(address(this).balance >= potentialPayout, "BANKROLL_CAP_EXCEEDED");

        totalFlipsExecuted += 1;

        bytes32 entropyHash = keccak256(
            abi.encodePacked(
                block.prevrandao,
                block.timestamp,
                msg.sender,
                streak.streakCount,
                blockhash(block.number - 1)
            )
        );

        Choice outcome = (uint256(entropyHash) % 2 == 0) ? Choice.HEADS : Choice.TAILS;
        bool won = (choice == outcome);

        if (won) {
            streak.currentWager = potentialPayout;
            streak.streakCount += 1;
            streak.lastChoice = choice;

            emit StreakDoubled(msg.sender, potentialPayout, streak.streakCount);
            emit CoinFlipped(msg.sender, choice, outcome, true, potentialPayout, streak.streakCount, entropyHash);
        } else {
            delete activeStreaks[msg.sender];
            emit CoinFlipped(msg.sender, choice, outcome, false, 0, 0, entropyHash);
        }
    }

    /**
     * @notice Cash out and withdraw all accumulated winnings to your wallet.
     */
    function cashOut() external {
        ActiveStreak memory streak = activeStreaks[msg.sender];
        require(streak.exists && streak.currentWager > 0, "NOTHING_TO_CASH_OUT");

        delete activeStreaks[msg.sender];
        totalPayoutsClaimed += streak.currentWager;

        (bool success, ) = payable(msg.sender).call{value: streak.currentWager}("");
        require(success, "CASHOUT_TRANSFER_FAILED");

        emit WinningsCashedOut(msg.sender, streak.currentWager);
    }
}
`;

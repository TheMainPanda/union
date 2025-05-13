const { execSync } = require('child_process');
const fs = require('fs');

// ASCII Art
const ASCII_ART = `
███████╗██╗░░░░░░█████╗░███╗░░██╗░█████╗░██████╗░░█████╗░██╗░░░██╗  ░█████╗░░██████╗░██████╗
██╔════╝██║░░░░░██╔══██╗████╗░██║██╔══██╗██╔══██╗██╔══██╗╚██╗░██╔╝  ██╔══██╗██╔════╝██╔════╝
█████╗░░██║░░░░░███████║██╔██╗██║███████║██████╔╝██║░░╚═╝░╚████╔╝░  ██║░░╚═╝╚█████╗░╚█████╗░
██╔══╝░░██║░░░░░██╔══██║██║╚████║██╔══██║██╔══██╗██║░░██╗░░╚██╔╝░░  ██║░░██╗░╚═══██╗░╚═══██╗
███████╗███████╗██║░░██║██║░╚███║██║░░██║██║░░██║╚█████╔╝░░░██║░░░  ╚█████╔╝██████╔╝██████╔╝
╚══════╝╚══════╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚═╝╚═╝░░╚═╝░╚════╝░░░░╚═╝░░░  ░╚════╝░╚═════╝░╚═════╝░
`;

// Function to check and install dependencies
function installDependencies() {
  console.log('Checking and installing required dependencies...');
  const dependencies = ['ethers@5', 'readline-sync', 'axios'];
  
  dependencies.forEach(dep => {
    try {
      require(dep.split('@')[0]);
      console.log(`${dep} is already installed.`);
    } catch (e) {
      console.log(`Installing ${dep}...`);
      try {
        execSync(`npm install ${dep}`, { stdio: 'inherit' });
        console.log(`${dep} installed successfully.`);
      } catch (error) {
        console.error(`Failed to install ${dep}. Please install it manually using 'npm install ${dep}'.`);
        process.exit(1);
      }
    }
  });
}

// Telegram Channel Introduction
function displayTelegramIntro() {
  console.log(ASCII_ART);
  console.log('\nWelcome to the CS Surabaya Telegram Channel!');
  console.log('Join our community for updates, tips, and more: https://t.me/cssurabaya');
  console.log('Stay connected with the latest blockchain and crypto insights!\n');
}

// Ask if the user has joined the Telegram channel
function askJoinTelegram() {
  const readlineSync = require('readline-sync');
  const joined = readlineSync.question('Have you already joined our Telegram channel? (yes/no): ').toLowerCase();
  if (joined !== 'yes') {
    console.log('Please join our Telegram channel at https://t.me/cssurabaya for the latest updates!');
    const proceed = readlineSync.question('Would you like to continue anyway? (yes/no): ').toLowerCase();
    if (proceed !== 'yes') {
      console.log('Exiting... Please join the channel and try again.');
      process.exit(0);
    }
  } else {
    console.log('Awesome! Thanks for being part of our community!');
  }
}

// Original script (with minor adjustments for integration)
const ethers = require('ethers');
const readlineSync = require('readline-sync');
const axios = require('axios');

console.log(`Using ethers version: ${ethers.version}`);

function isValidHex(str) {
  return /^0x[0-9a-fA-F]*$/.test(str) && str.length % 2 === 0;
}

const SEPOLIA_RPC = 'https://eth-sepolia.public.blastapi.io';
const BRIDGE_CONTRACT = '0x5FbE74A283f7954f10AA04C2eDf55578811aeb03';
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const SEPOLIA_CHAIN_ID = 11155111;

const UCS03_ABI = [
  {
    inputs: [
      { internalType: 'uint32', name: 'channelId', type: 'uint32' },
      { internalType: 'uint64', name: 'timeoutHeight', type: 'uint64' },
      { internalType: 'uint64', name: 'timeoutTimestamp', type: 'uint64' },
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
      {
        components: [
          { internalType: 'uint8', name: 'version', type: 'uint8' },
          { internalType: 'uint8', name: 'opcode', type: 'uint8' },
          { internalType: 'bytes', name: 'operand', type: 'bytes' },
        ],
        internalType: 'struct Instruction',
        name: 'instruction',
        type: 'tuple',
      },
    ],
    name: 'send',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const USDC_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

const sepoliaProvider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);

const privateKey = readlineSync.question('Enter your private key: ', { hideEchoBack: true });
const wallet = new ethers.Wallet(privateKey).connect(sepoliaProvider);
const userAddress = wallet.address;
const usdcAmount = parseFloat(readlineSync.question('Enter amount of USDC to bridge (in USDC): '));
const loopCount = parseInt(readlineSync.question('Enter number of bridge loops: '));

if (isNaN(usdcAmount) || usdcAmount <= 0) throw new Error('Invalid USDC amount');
if (isNaN(loopCount) || loopCount <= 0) throw new Error('Invalid loop count');

const usdcAmountWei = ethers.utils.parseUnits(usdcAmount.toString(), 6); // USDC has 6 decimals
const SALT = ethers.utils.hexlify(ethers.utils.randomBytes(32));

async function checkBalance(provider, usdcAddress, userAddress, amountWei) {
  const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, provider);
  const balance = await usdcContract.balanceOf(userAddress);
  console.log(`USDC Balance: ${ethers.utils.formatUnits(balance, 6)} USDC`);
  return balance.gte(amountWei);
}

async function checkEthBalance(provider, userAddress) {
  const balance = await provider.getBalance(userAddress);
  console.log(`ETH Balance: ${ethers.utils.formatEther(balance)} ETH`);
  return balance.gte(ethers.utils.parseEther('0.01'));
}

async function checkApproval(provider, usdcAddress, userAddress, spender, amountWei) {
  const contract = new ethers.Contract(usdcAddress, USDC_ABI, provider);
  const allowance = await contract.allowance(userAddress, spender);
  console.log(`Allowance for ${spender}: ${ethers.utils.formatUnits(allowance, 6)} USDC`);
  return allowance.gte(amountWei);
}

async function approveUsdc(wallet, usdcAddress, spender, amountWei) {
  const contract = new ethers.Contract(usdcAddress, USDC_ABI, wallet);
  const tx = await contract.approve(spender, amountWei, { gasLimit: 70000 });
  const receipt = await tx.wait();
  console.log(`Approval TX Hash: ${tx.hash}`);
  return receipt.status === 1;
}

async function pollPacketHash(txHash, retries = 50, intervalMs = 5000) {
  const headers = {
    accept: 'application/graphql-response+json, application/json',
    'content-type': 'application/json',
    origin: 'https://app.union.build',
    referer: 'https://app.union.build/',
    'user-agent': 'Mozilla/5.0',
  };
  const data = {
    query: `
      query ($submission_tx_hash: String!) {
        v2_transfers(args: {p_transaction_hash: $submissionazie
      }
    `,
    variables: {
      submission_tx_hash: txHash.startsWith('0x') ? txHash : `0x${txHash}`,
    },
  };

  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.post('https://graphql.union.build/v1/graphql', data, { headers });
      const result = res.data?.data?.v2_transfers;
      if (result && result.length > 0 && result[0].packet_hash) {
        return result[0].packet_hash;
      }
    } catch (e) {
      console.error(`Packet error: ${e.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  console.warn('Failed to retrieve packet hash after retries');
  return null;
}

async function bridgeUsdcSepoliaToHolesky(amountWei) {
  console.log('Checking balances on Sepolia...');
  const hasUsdc = await checkBalance(sepoliaProvider, USDC_ADDRESS, userAddress, amountWei);
  const hasEth = await checkEthBalance(sepoliaProvider, userAddress);
  if (!hasUsdc) {
    console.log('Insufficient USDC balance');
    return false;
  }
  if (!hasEth) {
    console.log('Insufficient ETH balance for gas');
    return false;
  }

  const isApproved = await checkApproval(sepoliaProvider, USDC_ADDRESS, userAddress, BRIDGE_CONTRACT, amountWei);
  if (!isApproved) {
    console.log('Approving USDC on Sepolia...');
    const approvalSuccess = await approveUsdc(wallet, USDC_ADDRESS, BRIDGE_CONTRACT, amountWei);
    if (!approvalSuccess) {
      console.log('Approval failed on Sepolia');
      return false;
    }
  } else {
    console.log('USDC already approved on Sepolia');
  }

  const contract = new ethers.Contract(BRIDGE_CONTRACT, UCS03_ABI, wallet);
  const addressHex = userAddress.slice(2).toLowerCase();
  const channelId = 8;
  const timeoutHeight = 0;
  const now = BigInt(Date.now()) * 1_000_000n;
  const oneDayNs = 86_400_000_000_000n;
  const timeoutTimestamp = (now + oneDayNs).toString();
  const timestampNow = Math.floor(Date.now() / 1000);
  const salt = ethers.utils.solidityKeccak256(['address', 'uint256'], [userAddress, timestampNow]);

  const operand = '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000014' +
    addressHex +
    '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000014' +
    addressHex +
    '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000141c7d4b196cb0c7b01d743fbc6116a902379c72380000000000000000000000000000000000000000000000000000000000000000000000000000000000000004555344430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045553444300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001457978bfe465ad9b1c0bf80f6c1539d300705ea50000000000000000000000000';

  const instruction = {
    version: 0,
    opcode: 2,
    operand,
  };

  let data;
  const iface = new ethers.utils.Interface(UCS03_ABI);
  try {
    data = iface.encodeFunctionData('send', [channelId, timeoutHeight, timeoutTimestamp, salt, instruction]);
  } catch (error) {
    console.error('Failed to encode send function data:', error);
    return false;
  }

  console.log(`Sepolia to Holesky (send) data length: ${data.length}`);
  console.log(`Sepolia to Holesky (send) data valid hex: ${isValidHex(data)}`);

  try {
    const simulationResult = await sepoliaProvider.call({ to: BRIDGE_CONTRACT, data, from: userAddress });
    console.log('Simulation successful (send), result:', simulationResult);
  } catch (error) {
    console.error('Simulation failed (send):', error);
    if (error.data) {
      try {
        const decodedError = iface.parseError(error.data);
        console.error('Decoded revert reason:', decodedError.name, decodedError.args);
      } catch (parseError) {
        console.error('Failed to decode revert reason:', parseError);
      }
    }
    return false;
  }

  const tx = { to: BRIDGE_CONTRACT, data, chainId: SEPOLIA_CHAIN_ID };
  try {
    const txResponse = await wallet.sendTransaction(tx);
    console.log(`Transaction sent, hash: ${txResponse.hash}`);
    const receipt = await txResponse.wait();
    console.log(`Sepolia to Holesky Bridge TX Hash: ${txResponse.hash}`);
    if (receipt.status === 0) {
      console.error('Transaction reverted');
      return false;
    }
    const packetHash = await pollPacketHash(txResponse.hash);
    if (packetHash) {
      console.log(`Packet Submitted: https://app.union.build/explorer/transfers/${packetHash}`);
    }
    return true;
  } catch (error) {
    console.error('Transaction failed:', error);
    return false;
  }
}

async function main() {
  // Install dependencies
  installDependencies();
  
  // Display Telegram intro and ASCII art
  displayTelegramIntro();
  
  // Ask if user has joined Telegram
  askJoinTelegram();
  
  console.log(`Using salt: ${SALT}`);
  for (let i = 0; i < loopCount; i++) {
    console.log(`\nStarting bridge loop ${i + 1}/${loopCount}`);
    console.log('Bridging USDC from Sepolia to Holesky...');
    const success = await bridgeUsdcSepoliaToHolesky(usdcAmountWei);
    if (!success) {
      console.log('Sepolia to Holesky bridge failed');
      break;
    }
    console.log(`Loop ${i + 1} completed successfully`);
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  console.log('\nBridging process completed');
  console.log('Don’t forget to stay updated via our Telegram channel: https://t.me/cssurabaya');
}

main().catch((error) => {
  console.error('Error:', error);
});

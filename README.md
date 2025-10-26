# ETHOnline 2025

## Title  
GUDA: Multi-Asset DeFi Analytics Hub  

## Description  
GUDA is a DeFi analytics platform designed for EthGlobal 2025, empowering users to track portfolios across multiple assets (e.g., ETH, USDC) on Sepolia and Base Sepolia networks, execute cross-chain transfers with ease, and access detailed analytics via an AI-powered chat interface. Every transaction rewards users with PYUSD cashbacks up to 4%, enhancing engagement with a trusted settlement layer. Built with a sleek, responsive design and offline-ready features, GUDA simplifies DeFi, offering a seamless experience from wallet connection to asset management and secure transfers.

## Tech Stack  
- **Frontend**: Vite (for fast development), RainbowKit (wallet connection), Tailwind CSS (responsive design)  
- **Blockchain**: Avail Nexus SDK (cross-chain transfers), ethers.js (wallet interactions)  
- **Data & Analytics**: Blockscout API (asset fetching), Pyth Pull Oracle (crypto-to-USD conversion), ASI.one (AI chat analytics)  
- **Security**: Lit Wrapped Keys (secure transactions)  

## Sponsors Usage  
- **Avail**: Utilizes the Nexus SDK for seamless cross-chain transfers, enabling asset movement between Sepolia and Base Sepolia with a single click.  
- **Pyth**: Integrates the Pull Oracle for crypto-to-USD conversions and Entropy for random cashback generation (up to 4% in PYUSD).  
- **PayPal**: Employs PYUSD for cashback rewards, providing a fiat-like settlement layer that boosts user trust.  
- **Lit**: Implements wrapped keys to secure private key handling during PYUSD transfers, ensuring non-custodial safety.  
- **Blockscout**: Leverages its API to fetch account assets, powering the real-time Portfolio screen.  
- **ASI**: Powers the AI Chat with ASI.one, delivering analytics and advice based on user inputs.  

## Challenges Faced  
- **Integrating Avail Nexus SDK**: Initializing the SDK was challenging due to limited documentation clarity, leading to connection errors. This was resolved by manually signing a transaction to initialize the SDK, requiring iterative debugging with ethers.js logs to stabilize cross-chain transfer functionality.  

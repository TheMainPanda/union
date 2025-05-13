#!/bin/bash

# ASCII Art
ASCII_ART="
███████╗██╗░░░░░░█████╗░███╗░░██╗░█████╗░██████╗░░█████╗░██╗░░░██╗  ░█████╗░░██████╗░██████╗
██╔════╝██║░░░░░██╔══██╗████╗░██║██╔══██╗██╔══██╗██╔══██╗╚██╗░██╔╝  ██╔══██╗██╔════╝██╔════╝
█████╗░░██║░░░░░███████║██╔██╗██║███████║██████╔╝██║░░╚═╝░╚████╔╝░  ██║░░╚═╝╚█████╗░╚█████╗░
██╔══╝░░██║░░░░░██╔══██║██║╚████║██╔══██║██╔══██╗██║░░██╗░░╚██╔╝░░  ██║░░██╗░╚═══██╗░╚═══██╗
███████╗███████╗██║░░██║██║░╚███║██║░░██║██║░░██║╚█████╔╝░░░██║░░░  ╚█████╔╝██████╔╝██████╔╝
╚══════╝╚══════╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚═╝╚═╝░░╚═╝░╚════╝░░░░╚═╝░░░  ░╚════╝░╚═════╝░╚═════╝░
"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display Telegram intro and ASCII art
display_telegram_intro() {
    echo "$ASCII_ART"
    echo ""
    echo "Welcome to the CS Surabaya Telegram Channel!"
    echo "Join our community for updates, tips, and more: https://t.me/cssurabaya"
    echo "Stay connected with the latest blockchain and crypto insights!"
    echo ""
}

# Function to ask if the user has joined Telegram
ask_join_telegram() {
    read -p "Have you already joined our Telegram channel? (yes/no): " joined
    if [ "${joined,,}" != "yes" ]; then
        echo "Please join our Telegram channel at https://t.me/cssurabaya for the latest updates!"
        read -p "Would you like to continue anyway? (yes/no): " proceed
        if [ "${proceed,,}" != "yes" ]; then
            echo "Exiting... Please join the channel and try again."
            exit 0
        fi
    else
        echo "Awesome! Thanks for being part of our community!"
    fi
}

# Check for Node.js and npm
echo "Checking for Node.js and npm..."
if ! command_exists node || ! command_exists npm; then
    echo "Node.js or npm not found. Installing..."
    apt update && apt install -y nodejs npm
    if [ $? -ne 0 ]; then
        echo "Failed to install Node.js and npm. Please install them manually and try again."
        exit 1
    fi
else
    echo "Node.js and npm are already installed."
fi

# Install Node.js dependencies
echo "Installing required Node.js dependencies..."
npm install ethers@5 readline-sync axios
if [ $? -ne 0 ]; then
    echo "Failed to install Node.js dependencies. Please install them manually using 'npm install ethers@5 readline-sync axios'."
    exit 1
fi

# Display ASCII art and Telegram intro
display_telegram_intro

# Ask if the user has joined Telegram
ask_join_telegram

# Run the JavaScript script
echo "Starting the bridging script..."
node autotx.js

# Final Telegram reminder
echo ""
echo "Bridging process completed."
echo "Don’t forget to stay updated via our Telegram channel: https://t.me/cssurabaya"

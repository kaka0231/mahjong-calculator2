# 🀄 Mahjong Scoreboard (麻雀計分板)

A modern, mobile-friendly web application to track Mahjong scores, ensure balance, and calculate final settlements. Built with React, Tailwind CSS, and Lucide icons.

## 🚀 Features

- **Real-time Score Tracking**: Easily add scores for 4 players. The app ensures every round balances to zero before saving.
- **Round History**: View a detailed history of every round with timestamps and the ability to delete specific rounds.
- **Final Settlement Calculation**:
  - Set a custom value per chip (e.g., $1, $5, $10).
  - Automatically calculate the total profit/loss for each player.
  - **Payment Advice**: Smart algorithm that tells you exactly who should pay whom to settle the game with the fewest transactions.
- **Multi-language Support**: Toggle between **Traditional Chinese** and **English** with a single click.
- **Data Persistence**: All your scores, player names, and settings are saved automatically in your browser's `localStorage`. No data is lost even if you refresh or close the tab.
- **Mobile Optimized**: Specially designed for iPhone users to easily input negative numbers.
- **Clean UI**: Minimalist design with smooth animations using `motion`.

## 🛠️ Tech Stack

- **Frontend**: React 18+
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion (motion/react)
- **Build Tool**: Vite

## 📖 How to Use

1. **Set Player Names**: Click "Edit Names" to customize the names for the 4 players.
2. **Record a Round**: Enter the scores for each player. Ensure the total sum is 0, then click "Record Round".
3. **View History**: Scroll down to see all previous rounds and their timestamps.
4. **Settle the Game**:
   - Go to the "Final Settlement" section at the bottom.
   - Enter the "Value per chip".
   - Follow the "Payment Advice" to settle the money.
5. **Reset**: Use the "Reset" button to clear all data and start a new game.

## 📦 Deployment

This app is a static React application. You can easily deploy it to platforms like **Vercel**, **Netlify**, or **GitHub Pages**.

---
Created by **kakit** • 2026

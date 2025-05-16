# DeOrg - Decentralized Organizations

Built during [Colosseum Breakout Hackathon](https://www.colosseum.org/breakout)

## About

DeOrg revolutionizes how decentralized organizations operate by providing a seamless platform for on-chain governance and collaboration. Built on blockchain technology, DeOrg empowers communities to create, manage, and scale their organizations with transparent governance, efficient project management, and secure treasury operations.

## Key Features

### Core Features
- **Decentralized Governance** 🏛️
  - Create and manage proposals with customizable voting periods
  - Implement different voting thresholds (simple majority, super majority, consensus)
  - Track proposal status and voting progress in real-time
  - On-chain proposal execution and verification

- **Project Management** 📋
  - Create and organize projects with detailed descriptions
  - Manage tasks with Kanban board and list views
  - Assign tasks to team members
  - Set milestones and track project progress (Coming soon!)

- **Member Management** 👥
  - Role-based access control
  - Member onboarding and offboarding
  - Customizable permission levels
  - Member activity tracking (Coming soon)

- **Treasury Management** 💰
  - Secure fund management
  - Transaction history and tracking
  - Budget allocation and tracking
  - Real-time blockchain transaction monitoring

### User Experience
- **Modern UI/UX** 🎨
  - Clean and intuitive interface
  - Responsive design for all devices
  - Real-time updates and notifications

### Coming Soon
- **Activity Tracking** 📊
  - Comprehensive activity dashboard
  - Real-time organization analytics
  - Member contribution metrics
  - Project performance insights

## Tech Stack

- **Frontend Framework**: Next.js 14 with App Router
- **UI Library**: React with TypeScript
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Blockchain**:
  - Solana Network
  - Helius API for blockchain data indexing and real-time updates
  - Enhanced transaction monitoring and analytics

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gibwork/deorg-ui.git
cd deorg-ui
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Create a new `.env.local` file:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
- Update the values in `.env.local`

1. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

1. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/features` - Feature-based modules
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and shared logic

## Contributing

This project was built during the Colosseum Breakout Hackathon. We welcome contributions and feedback!

## License

[MIT License](LICENSE) 
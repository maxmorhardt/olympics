# Olympics

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Material-UI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)
![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)
![WebSocket](https://img.shields.io/badge/websocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

## Overview

The frontend for a family "olympics" yard-games tournament, built with React and TypeScript. Features OIDC authentication, an amber/gold Material-UI theme, and WebSocket connections that keep every viewer in sync as the tournament advances through its stages.

## Features

- **React 19** with TypeScript for modern frontend development
- **OIDC Authentication** with react-oidc-context (only admins create; anyone can view)
- **Material-UI Components** in a custom amber/gold dark theme
- **Redux Toolkit** for tournament state
- **Real-time Updates** via WebSocket connections
- **Staged experience** - One page per stage (setup, teams, group play, playoffs) with a live bracket and celebration modal
- **ESLint & TypeScript** for code quality and type safety

## Architecture

The app is organized as one page per tournament stage under a shared layout. A single WebSocket connection per tournament receives lifecycle and score events: when the admin advances a stage or records a result, every connected viewer reloads and is carried forward automatically, so all spectators stay on the same page in real time.

## Dependencies

This application requires the following services to be running:

- **Olympics API Backend** for data persistence and WebSocket handling
- **OIDC Provider** for authentication
- **Modern Web Browser** with WebSocket support

## Development

This project uses [pnpm](https://pnpm.io). Enable it with `corepack enable`.

1. Install dependencies: `pnpm install`
2. Start the development server: `pnpm dev`
3. Open browser to `http://localhost:3000`

## Production Build

Build the application for production deployment:

```bash
pnpm build
```

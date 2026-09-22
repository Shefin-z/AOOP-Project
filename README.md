# AOOP-Project

## Run locally

For a one-time setup and the daily one-click launch instruction, see [SETUP-RUN-BN.md](SETUP-RUN-BN.md). After setup, double-click `Start-CareerForge.bat`.

## Community chat: networking and multithreading

CareerForge uses a real WebSocket client-server channel at `/api/ws/chat` for private messages between accepted student connections. A message is saved in MySQL and delivered immediately to the open browser sessions of both students.

The server uses a fixed `ExecutorService` with named `community-chat-worker-*` threads. Each incoming socket message is processed by a worker thread, allowing multiple students to chat concurrently. `ConcurrentHashMap` and `CopyOnWriteArraySet` safely track every active session.

Before first use, run `database/upgrade-community-chat.sql` against the `careerforge` database, then start the backend and frontend normally.

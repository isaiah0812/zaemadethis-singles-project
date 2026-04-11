# The API

## Development

### Requirements

- [Node 22 or later](https://nodejs.org/en/download) OR
- [Docker](https://www.docker.com/products/docker-desktop/)

### Run with NPM

```bash
npm install -g typescript
npm install
npm run dev
```

### Docker

**With hot-reload** (refreshes when files are changed in the repository)

```bash
docker compose up --build -w
```

**Without hot-reload**

```bash
docker compose up --build
```

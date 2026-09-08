# The API

## Development

### Requirements

- [Node 22 or later](https://nodejs.org/en/download) OR
- [Docker](https://www.docker.com/products/docker-desktop/)

> 💡 TIP: Use node 26 or later to avoid constant changes to the `package-lock.json` file, as it is not a part of the `.gitignore`.

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

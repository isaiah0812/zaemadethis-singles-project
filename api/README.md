# The API

## Development

### Requirements

- [Node 22 or later](https://nodejs.org/en/download) OR
- [Docker](https://www.docker.com/products/docker-desktop/)

> 💡 TIP: Use node 26 or later to avoid constant changes to the `package-lock.json` file, as it is not a part of the `.gitignore`.

### Secrets

Set these values as either environment variables on your machine or in a `.env` file before running.

#### STRIPE_KEY

<!--TODO: add instructions for test stripe key-->

#### JWT_SECRET

For the most "production-like" results, run the following command in the terminal.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# abcdefg...
```

Copy the result and add the `JWT_SECRET` variable to your environment.

```plaintext
# .env

JWT_SECRET=<your-value-here>
```

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

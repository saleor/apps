### Install dependencies

This project uses [pnpm](https://pnpm.io) for managing dependencies

```
pnpm install
```

### Run Watch Mode

```
pnpm watch
```

### Run CLI

```
node build/cli.js ...
```

### Available commands

List of available commands:

```
node dist/app-cli.js -h
```

Description of available arguments:

```
node dist/app-cli.js [command name] -h
```

### Configuration

If options are not passed as arguments, cli will try to read environment variables. Example configuration is available in `.env.example` file.

# companion-module-streamlingo-streamlingo

A [Bitfocus Companion](https://bitfocus.io/companion) module for controlling [Streamlingo](https://streamlingo.net) live translation.

Start, stop, pause and resume your Streamlingo conference from a Stream Deck or any other Companion surface, and show its status on your buttons.

See [HELP.md](./companion/HELP.md) for setup and usage, and [LICENSE](./LICENSE) for licensing.

## Streamlingo API

This module uses Streamlingo's "Remote Control via URL" integration. Each request is a `GET` to:

```
https://app.streamlingo.net/api/<apiKey>/<action>
```

| Action   | Allowed when             | Result         |
| -------- | ------------------------ | -------------- |
| `status` | Always                   | Current status |
| `start`  | `stopped`                | `starting`     |
| `stop`   | Any state except stopped | `stopped`      |
| `pause`  | `running`                | `paused`       |
| `resume` | `paused`                 | `running`      |

A successful request returns `{"newStatus":"<status>"}` with HTTP 200. An invalid key or a command that is not allowed in the current state returns HTTP 400 with a plain text body.

After `start`, the status goes from `starting` to `waiting_for_input`, then to `running` once Streamlingo receives audio.

## Getting started

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.

To build a package that can be imported into Companion, run `yarn package`.

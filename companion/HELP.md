## Streamlingo

Control [Streamlingo](https://streamlingo.net) live translation from Companion: start, stop, pause and resume your conference, and show its status on your buttons.

### Setup

1. In Streamlingo, open **Settings → Integrations** and enable **Remote Control via URL**.
2. Copy any of the URLs shown there, for example `https://app.streamlingo.net/api/AbCdEf123456/status`.
3. Paste it into the **API Key or Remote Control URL** field of this connection. You can paste the whole URL or just the key between `/api/` and the action.

Keep the key private: anyone who has it can control your translation. If it leaks, use **Regenerate URLs** in Streamlingo and paste the new one here.

Streamlingo must stay open in a browser, with audio going to it, for translation to run. Companion only sends the commands.

### Configuration

| Option                        | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| API Key or Remote Control URL | The key from Streamlingo, or any of its remote control URLs        |
| Status Poll Interval (ms)     | How often to ask Streamlingo for the current status (default 2000) |

### Actions

| Action                | Description                                |
| --------------------- | ------------------------------------------ |
| Start translation     | Starts the translation (only when stopped) |
| Stop translation      | Stops the translation                      |
| Pause translation     | Pauses the translation (only when running) |
| Resume translation    | Resumes the translation (only when paused) |
| Toggle pause / resume | Pauses when running, resumes when paused   |
| Toggle start / stop   | Starts when stopped, otherwise stops       |

Streamlingo ignores commands that don't fit the current state, such as pausing while stopped. These show as a warning in the connection log.

### Feedbacks

| Feedback           | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| Translation status | Changes the button style when the translation is in the chosen state |

### Variables

| Variable                     | Description                                                                 |
| ---------------------------- | --------------------------------------------------------------------------- |
| `$(streamlingo:status)`      | Raw status: `stopped`, `starting`, `waiting_for_input`, `running`, `paused` |
| `$(streamlingo:status_text)` | Display text: Stopped, Starting, Waiting for audio, Running, Paused         |

Replace `streamlingo` with your connection's label if you renamed it.

### Status values

| Status            | Meaning                                                     |
| ----------------- | ----------------------------------------------------------- |
| Stopped           | Translation is not running                                  |
| Starting          | Translation was just started                                |
| Waiting for audio | Started, but Streamlingo is not receiving audio yet         |
| Running           | Translating                                                 |
| Paused            | Paused, resume to continue                                  |
| Unknown           | Companion cannot reach Streamlingo, or the key was rejected |

### Presets

Ready-made buttons for each command, start/stop and pause/resume toggles, and a status display. They are colored by status: green when running, amber while starting, waiting or paused, red when stopped.

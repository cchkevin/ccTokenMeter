# token-meter

A Claude Code mod that keeps one line in the status line:

```
Sonnet 5.5 · 5h 76% · Week 41% · last 35.2k/350
```

- **Model**: the session's current model, with its version (`claude-sonnet-5-5` → `Sonnet 5.5`).
- **5h / Week**: remaining quota of the 5-hour and 7-day windows (subscription plans only; shown after the first API call).
- **last**: total input tokens (uncached + cache read + cache write) / output tokens of the most recent API call.

## Install

```
/plugin install token-meter --marketplace <owner>/<repo>
```

Answer `y` to add the marketplace, then choose the **user** scope.

Update later with `claude plugin update`.

## Develop

```
claude plugin validate .
claude plugin test .
```

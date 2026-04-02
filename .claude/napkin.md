# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-04-02] This app already has a live S3 deployment**
   Do instead: treat `http://iprep.dagc-development.org.s3-website-us-east-1.amazonaws.com` as the existing public deployment baseline before suggesting new hosting or publish steps.

## Shell & Command Reliability
1. **[2026-04-02] AWS commands may inherit a broken local proxy**
   Do instead: clear `HTTP_PROXY`, `HTTPS_PROXY`, and `ALL_PROXY` for AWS CLI commands if requests fail against `127.0.0.1:9`.

## Domain Behavior Guardrails
1. **[2026-04-02] The app is a SPA with local view state**
   Do instead: keep S3 website hosting configured with `index.html` as both index and error document so deep-link fallback remains safe if routing is introduced later.

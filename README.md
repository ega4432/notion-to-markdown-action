# notion-to-markdown-action

[![build-test](https://github.com/ega4432/notion-to-markdown-action/actions/workflows/test.yml/badge.svg)](https://github.com/ega4432/notion-to-markdown-action/actions/workflows/test.yml)
[![Check dist/](https://github.com/ega4432/notion-to-markdown-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/ega4432/notion-to-markdown-action/actions/workflows/check-dist.yml)
[![auto-merge](https://github.com/ega4432/notion-to-markdown-action/actions/workflows/auto-merge.yml/badge.svg)](https://github.com/ega4432/notion-to-markdown-action/actions/workflows/auto-merge.yml)
[![auto-release](https://github.com/ega4432/notion-to-markdown-action/actions/workflows/auto-release.yml/badge.svg)](https://github.com/ega4432/notion-to-markdown-action/actions/workflows/auto-release.yml)

## Overview

This action converts and downloads pages that exist in Notion's specified database to a markdown files.

## Usage

`.github/workflows/download.yml`

```yaml
name: download

on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  import:
    runs-on: ubuntu-latest
    steps:
      - uses: ega4432/notion-to-markdown-action@v0
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
        with:
          # Optional
          output_path: some-dir # default: output
```

## Environments

### `NOTION_API_KEY`

API key of Notion integrations

- required

### `NOTION_DATABASE_ID`

Database ID of target Notion page.

- required

## Inputs

### `output_path`

Directory path to output files.

- optional
- default: `output`

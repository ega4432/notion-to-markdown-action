# notion-to-markdown-action

## Environment

- Node.js v16.16.0
- npm v8.11.0

## Setup

Install the dependencies

```bash
$ npm install
```

Build the typescript and package it for distribution

```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:

```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

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
        with:
          notion_api_key: ${{ secrets.NOTION_API_KEY }}
          notion_database_id: ${{ secrets.NOTION_DATABASE_ID }}
```

## Inputs

### `notion_api_key`

API key of Notion integrations

- required

### `notion_database_id`

Database ID of target Notion page.

- required

### `output_path`

Directory path to output files.

- optional
- default: `output`

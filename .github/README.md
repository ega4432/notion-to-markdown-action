# notion-to-markdown-action

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
```

## Environments

### `notion_api_key`

API key of Notion integrations

- required

### `notion_database_id`

Database ID of target Notion page.

- required

## Inputs

### `output_path`

Directory path to output files.

- optional
- default: `output`

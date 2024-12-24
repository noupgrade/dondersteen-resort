# DonderSteen Frontend

This project serves as the frontend for the BoothBits platform. It consists of both the form that event assistants use to give feedback of their experience as well as the dashboard that event promoters use to see that feedback processed.

## Architecture

You can check out our Architecture Decision Records in the [ADR folder](./docs/adr/). Feel free to also take a look at our [Code structure docs](./docs/code-structure.md).

## Useful prompts

```text
Refactor the entire AssistantDefinitionSection file so that all plain text is replaced by it's translation using the format t('translation.key', 'plain text'). Do not forget to add the useTranslation hook. Never translate variables, just the plain text. Do not change logs or tracking. If there is a variable inside the text use this notation: setErrorMessage(t('file.exceeds.size', File {{name}} exceeds 100 MB, { name: selectedFiles[i].name }))
```

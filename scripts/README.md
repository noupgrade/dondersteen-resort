# Scripts

We have a set of scripts to trigger certain cloud functions or interact with our DB.

> All scripts will run in local environment by default. This means that you will need to have the local environment running (`pnpm run start`).
> If you want to target the production environment use the `--prod` flag.

## `download`

Downloads an event from the Firestore DB to the local `event.json` file.
It's usually used together with the `upload` script to copy an event from the production DB to your locally emulated DB.

```shell
pnpm run download <eventId>
```

> The `<eventId>` has to match the document id of the event in Firestore.

## `generate-random-answers`

Generates a set of random answers for testing purposes. The answers will be saved to the local `event.json` file.
This is useful for testing and development purposes when you need sample feedback data.

```shell
pnpm run generate-random-answers
```

> Keep in mind that you need the `OPENAI_SECRET_KEY` environment variable to run the script, `.env.local` in case it's not present (follow the example in `.env.example`).

## `upload`

Uploads an event from the local `event.json` file to the Firestore DB.

```shell
pnpm run upload <eventId>
```

> The `<eventId>` has to match the document id of the event in Firestore.

## `categorise-feedback`

Categorises the free text answers of an event and updates the feedback collection inside the event document in the Firestore DB.

```shell
pnpm run categorise-feedback <eventId>
```

> The `<eventId>` has to match the document id of the event in Firestore.
> Locally it's mocking the categorisation to avoid real calls to the OpenAI API.

## `upload-google-reviews`

Reads the local `Google Maps Reviews.xlsx` file and uploads those reviews as answers of free text format inside the event document in the Firestore DB.
It's usually used to create a dashboard with data from Google Maps for demo purposes.
To get that initial `Google Maps Reviews.xlsx` file we've been using [Pavuk AI](https://pavuk.ai/).

```shell
pnpm run upload-google-reviews <eventId>
```

> The `<eventId>` has to match the document id of the event in Firestore.

## `get-event-form-statistics`

Processes the data from the feedbacks of an event in the Firestore DB and outputs basic statistical data from it.
It outputs:

-   The nº of answered feedbacks (nº of users that answered the form)
-   The nº of questions in the form
-   The distribution of nº of questions answered by nº of users
-   The distribution of nº of feedbacks answered by date

```shell
pnpm run get-event-form-statistics <eventId>
```

> The `<eventId>` has to match the document id of the event in Firestore.

## `process-google-forms`

Processes a Google Forms XLSX file to determine question types and outputs them to a JSON file.

```shell
pnpm run process-google-forms <filePath> [options]
```

- `<filePath>`: Path to the XLSX file.
- `-r, --radio <questions...>`: List of questions to force as radio type. Provide the exact question titles as they appear in the XLSX file.
- `-i, --ignore <questions...>`: List of questions to ignore. These questions will not be included in the output.

Example:

```shell
pnpm run process-google-forms path/to/form.xlsx --radio "Question 1" "Question 3" --ignore "Question 2"
```

This command will process the XLSX file, force "Question 1" and "Question 3" to be treated as radio questions, and ignore "Question 2" entirely.

## `designate-as-admin`

Designates a user as an admin by setting custom claims in Firebase.

```shell
pnpm run designate-as-admin <email>
```

> The `<email>` is the email address of the user to be designated as an admin.

## `list-admin-users`

Lists all users who have been designated as admins.

```shell
pnpm run list-admin-users
```

## DB Migrations

We have the following Firestore migrations:

### `migrate-summaries-and-questions-to-subcollections`

Transforms the summaries and questions fields in the event document into subcollections where the id is the language code (`default` by default).

```shell
pnpm run migrate-summaries-and-questions-to-subcollections
```

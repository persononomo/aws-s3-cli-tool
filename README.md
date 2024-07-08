# AWS S3 CLI Tool

A Node.js CLI tool for managing AWS S3 buckets using the AWS SDK and Commander.js.

## Installation

1. Clone the repository:

    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```
   
3. Create a `.env` file in the root of the project directory with the following content:

    ```plaintext
    AWS_REGION=your-region
    S3_BUCKET=your-s3-bucket
    S3_PREFIX=your-s3-prefix
    ```

### Option 1: Use Globally with `s3-cli`

4. Link the package globally:

    ```bash
    npm link
    ```

5. Use the `s3-cli` command to run the CLI tool (e.g., `s3-cli list-files`). When you are done, you can unlink the package with `npm unlink`.

### Option 2: Use Locally with `./cli.js`

4. Use the `./cli.js` command to run the CLI tool without global installation (e.g., `./cli.js list-files`).

## Usage

The CLI tool provides several commands to interact with your S3 bucket. Each command accepts an optional `--aws-profile` parameter to specify which AWS profile to use from your credentials file. If not provided, the default profile will be used.

### List Files

List all files in the S3 bucket:

    ```bash
    s3-cli list-files --bucket <bucket> --prefix <prefix> --filter <filter>
    ```

- `--bucket <bucket>`: (Optional) The S3 bucket name. Defaults to the value in the `.env` file.
- `--prefix <prefix>`: (Optional) The S3 prefix. Defaults to the value in the `.env` file.
- `--filter <filter>`: (Optional) The filter to apply to the file list. This is a regular expression. Defaults to `.*`.

Example:

    ```bash
    s3-cli list-files --bucket my-bucket --prefix my-prefix --filter '.*\.txt$'
    ```

### Upload File

Upload a local file to a defined location in the S3 bucket:

    ```bash
    s3-cli upload-file --bucket <bucket> --key <key> --file <file>
    ```

- `--bucket <bucket>`: (Optional) The S3 bucket name. Defaults to the value in the `.env` file.
- `--key <key>`: The destination key in the S3 bucket.
- `--file <file>`: The local file path.

Example:

    ```bash
    s3-cli upload-file --bucket my-bucket --key my-prefix/my-file.txt --file path/to/local/file.txt
    ```

### Delete Files

Delete all files in the S3 bucket that match the filter:

    ```bash
    s3-cli delete-files --bucket <bucket> --prefix <prefix> --filter <filter>
    ```

- `--bucket <bucket>`: (Optional) The S3 bucket name. Defaults to the value in the `.env` file.
- `--prefix <prefix>`: (Optional) The S3 prefix. Defaults to the value in the `.env` file.
- `--filter <filter>`: The filter to apply to the file list. This is a regular expression.

Example:

    ```bash
    s3-cli delete-files --bucket my-bucket --prefix my-prefix --filter '.*\.txt$'
    ```

### Help

Display help information for the CLI tool:

    ```bash
    s3-cli help
    ```

## .env File Example

Create a `.env` file in the root of the project directory with the following content:

    ```plaintext
    AWS_REGION=my-region
    S3_BUCKET=my-bucket
    S3_PREFIX=my-prefix
    ```

## Environment Variables

Ensure the following environment variables are set in your environment or use aws profiles:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

Optionally, if you use session tokens:

- `AWS_SESSION_TOKEN`
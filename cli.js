#!/usr/bin/env node

const { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-providers');
const { Command } = require('commander');
const fs = require('fs');
require('dotenv').config();

const S3 = new S3Client();
const program = new Command();

const createS3Client = (profile) => {
    const credentials = profile ? fromIni({ profile }) : undefined;
    return new S3Client({
        region: process.env.S3_REGION,
        credentials
    });
};

program
    .version('1.0.0')
    .description('A Node.js CLI tool for AWS S3')
    .option('--aws-profile <profile>', 'AWS profile to use from credentials file. If not provided, the default profile will be used.');

program
    .command('help')
    .description('Display help information')
    .action(() => {
        program.outputHelp();
    });

program
    .command('list-files')
    .description('List all files in the S3 bucket')
    .option('--bucket <bucket>', 'The S3 bucket name', process.env.S3_BUCKET)
    .option('--prefix <prefix>', 'The S3 prefix', process.env.S3_PREFIX)
    .option('--filter <filter>', 'The filter to apply to the file list. This is a regular expression.', '.*')
    .action(async (options) => {
        const S3 = createS3Client(program.opts().awsProfile);

        try {
            let continuationToken = undefined;
            do {
                const params = {
                    Bucket: options.bucket,
                    Prefix: options.prefix,
                    ContinuationToken: continuationToken
                };
                const filter = new RegExp(options.filter);

                const command = new ListObjectsV2Command(params);
                const data = await S3.send(command);

                if (data.Contents) {
                    data.Contents.forEach(file => {
                        if (filter.test(file.Key)) {
                            console.log(file.Key);
                        }
                    });
                } else {
                    console.log('No files found in the bucket.');
                }

                continuationToken = data.NextContinuationToken;
            } while (continuationToken);
        } catch (error) {
            console.error("Error listing files: ", error.message);
        }
    });

program
    .command('upload-file')
    .description('Upload a local file to a defined location in the S3 bucket')
    .option('--bucket <bucket>', 'The S3 bucket name', process.env.S3_BUCKET)
    .option('--key <key>', 'The destination key in the S3 bucket')
    .option('--file <file>', 'The local file path')
    .action(async (options) => {
        const S3 = createS3Client(program.opts().awsProfile);

        const bucketName = options.bucket;
        const key = process.env.S3_PREFIX + '/' + options.key || '';
        const filePath = options.file;

        if (!filePath || !key) {
            console.error('File path and destination key are required.');
            process.exit(1);
        }

        try {
            const fileContent = fs.readFileSync(filePath);

            const params = {
                Bucket: bucketName,
                Key: key,
                Body: fileContent
            };
            const command = new PutObjectCommand(params);
            await S3.send(command);
            console.log(`File uploaded successfully to ${bucketName}/${key}`);
        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    });

program
    .command('delete-files')
    .description('Delete all files in the S3 bucket that match the filter')
    .option('--bucket <bucket>', 'The S3 bucket name', process.env.S3_BUCKET)
    .option('--prefix <prefix>', 'The S3 prefix', process.env.S3_PREFIX)
    .option('--filter <filter>', 'The filter to apply to the file list. This is a regular expression.')
    .action(async (options) => {
        const S3 = createS3Client(program.opts().awsProfile);

        try {
            let continuationToken = undefined;
            const keysToDelete = [];

            do {
                const params = {
                    Bucket: options.bucket,
                    Prefix: options.prefix,
                    ContinuationToken: continuationToken
                };
                const filter = new RegExp(options.filter);

                const command = new ListObjectsV2Command(params);
                const data = await S3.send(command);

                if (data.Contents) {
                    data.Contents.forEach(file => {
                        if (filter.test(file.Key)) {
                            keysToDelete.push({ Key: file.Key });
                        }
                    });
                } else {
                    console.log('No files found in the bucket.');
                }

                continuationToken = data.NextContinuationToken;
            } while (continuationToken);
            if (keysToDelete.length > 0) {
                const deleteParams = {
                    Bucket: options.bucket,
                    Delete: {
                        Objects: keysToDelete,
                        Quiet: false
                    }
                };
                const deleteCommand = new DeleteObjectsCommand(deleteParams);
                const deleteData = await S3.send(deleteCommand);
                console.log(`Deleted files: ${deleteData.Deleted.map(obj => obj.Key).join(', ')}`);
            } else {
                console.log('No files matched the filter, nothing to delete.');
            }
        } catch (error) {
            console.error("Error listing files: ", error.message);
        }
    });

program.parse(process.argv);
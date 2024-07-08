#!/usr/bin/env node

const { S3Client, ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Command } = require('commander');
const fs = require('fs');
require('dotenv').config();

const S3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})
const program = new Command();

program
    .version('1.0.0')
    .description('A Node.js CLI tool for AWS S3');

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

program.parse(process.argv);
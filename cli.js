#!/usr/bin/env node

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Command } = require('commander');
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
    .action(async (options) => {
        // todo get more that 1000 files, or paginate
        try {
            const params = {
                Bucket: options.bucket,
                Prefix: options.prefix
            };
            const command = new ListObjectsV2Command(params);
            const data = await S3.send(command);
            if (data.Contents) {
                data.Contents.forEach(file => {
                    console.log(file.Key);
                });
            } else {
                console.log('No files found in the bucket.');
            }
        } catch (error) {
            console.error("Error listing files: ", error.message);
        }
    });

program.parse(process.argv);
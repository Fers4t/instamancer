#!/usr/bin/env node

import winston = require("winston");

import {Hashtag, Location, User, ApiOptions} from "./api"


let argv = require('yargs')
    .command(
        'hashtag [id]',
        'Scrape a hashtag',
        {},
        async function f(args) {
            await spawn(args);
        }
    )
    .command(
        'location [id]',
        'Scrape a location',
        {},
        spawn
    )
    .command(
        'user [id]',
        'Scrape a user',
        {},
        spawn
    )
    .options({
        'count': {
            alias: 'c',
            default: 0,
            describe: 'Number of posts to download. 0 to download all'
        },
        'visible': {
            default: false,
            describe: 'Show browser on the screen'
        },
        'download': {
            alias: 'd',
            boolean: true,
            default: false,
            describe: "Save images and videos from posts"
        },
        'filename': {
            alias: ['file', 'f', 'out'],
            default: "out.csv",
            describe: "Name of the output file"
        },
        'filetype': {
            alias: ['type', 't'],
            default: 'csv',
            choices: ['csv', 'json'],
            describe: "Type of output file "
        },
        'downdir': {
            default: 'downloads',
            describe: 'Directory to save thumbnails'
        },
        'logging': {
            default: 'none',
            choices: ['none', 'info', 'debug'],
            describe: 'Level of logger'
        },
        'logfile': {
            default: 'socialcreaper.log',
            describe: 'Name of the log file'
        }
    })
    .argv;

async function spawn(args) {
    let logger = winston.createLogger({
        level: args['logging'],
        silent: args['logging'] == "none",
        transports: [
            new winston.transports.File({
                filename: args['logfile']
            })
        ]
    });

    let api;
    if (args['_'] == "hashtag") {
        api = Hashtag;
    } else if (args['_'] == "location") {
        api = Location;
    } else if (args['_'] == "user") {
        api = User;
    }

    let options: ApiOptions = {
        total: args['count'],
        headless: !args['visible'],
        logger: logger
    };

    let obj = new api(args['id'], options);
    // console.log("Beginning");
    await obj.start();
    let posts = []
    for await (const post of obj.itr()) {
        posts.push(post);
    }
}

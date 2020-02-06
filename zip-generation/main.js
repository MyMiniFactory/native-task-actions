#!/usr/bin/env node

const archiver = require('archiver');
const fs = require('fs');

async function main(args, workspace) {
    return new Promise((resolve, reject) => {

        var start = new Date().getTime();

        var output = fs.createWriteStream(workspace + '/output/' + args[1] +'.zip');
        var archive = archiver('zip');
    
        output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');

            var end = new Date().getTime();
            var time = end - start;

            let status = JSON.stringify(
                [{
                    "zip": {
                        "status": "done",
                        "progress": "100%"
                    }
                }, {
                    "processing": {
                        "status": "done",
                        "progress": "100%",
                        "execution_time": time
                    }
                }] , null, 2
            );

            fs.writeFileSync(workspace + '/output/status.json', status);

            fs.writeFileSync(workspace + '/results.json', JSON.stringify(
                {"ARCHIVE":{"location":"output","name":args[1] +'.zip'}}
            ));
            resolve();
        });
        
        archive.on('error', function(err) {
        fs.writeFileSync(workspace + '/output/status.json', JSON.stringify(
            {
                "zip": {
                    "status": "error"
                }
            }
        ));
        throw err;
        });
        
        archive.pipe(output);
        
        archive
        .directory(workspace + '/input/', false)
        .finalize();
    });

}

module.exports.run = main;

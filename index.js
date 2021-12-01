const commandExists = require('command-exists');
const got = require('got');
const fs = require('fs');
const util = require('util');
const stream = require('stream');
const exec = util.promisify(require('child_process').exec);
const yaml = require('js-yaml');
const pipeline = util.promisify(stream.pipeline);

async function execute(command, outputYaml = false) {
    try {
        try {
            await commandExists(__dirname + '/bin/argocd')
        } catch {
            await pipeline(
                got.stream('https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64'),
                fs.createWriteStream(__dirname + '/bin/argocd')
            );

            await exec(`chmod +x argocd`, {
                cwd: __dirname + '/bin'
            });
        }
        const { stdout } = await exec(`./argocd ${command}`, {
            cwd: __dirname + '/bin'
        });
        if (outputYaml)
            return yaml.load(stdout);
        else
            return stdout;
    } catch (err) {
        console.error(err);
    }
}

module.exports = execute
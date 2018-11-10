const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');

const baseDir = path.join(__dirname, "..");
const electronBin = path.join(baseDir, "node_modules", ".bin", "electron");

describe('Application launch', function () {
    this.timeout(30000);

    const app = new Application({
        path: electronBin,
        args: [baseDir]
    });

    beforeEach(function () {
        return app.start();
    })

    afterEach(function () {
        if (app && app.isRunning()) {
            return app.stop();
        }
    })

    it('shows an initial window', function () {
        return app.client.getWindowCount().then(function (count) {
            assert.equal(count, 2)
        })
    })
})
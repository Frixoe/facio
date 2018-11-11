const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');

const baseDir = path.join(__dirname, "..");

const app = new Application({
    path: electronPath,
    args: [baseDir],
    env: {
        ELECTRON_ENABLE_LOGGING: true,
        ELECTRON_ENABLE_STACK_DUMPING: true
    }
});

const chaiAsPromised = require("chai-as-promised");
const chai = require("chai");

chai.should();
chai.use(chaiAsPromised);

describe('Application', function () {
    this.timeout(50000);

    beforeEach(function () {
        chaiAsPromised.transferPromiseness = app.transferPromiseness;
        return app.start();
    });

    afterEach(function () {
        if (app && app.isRunning()) {
            return app.stop();
        }
    });

    it('shows an initial window', function () {
        return app.client.waitUntilWindowLoaded().getWindowCount().should.eventually.equal(2);
    });

    it("should show all the mode btns and edit path btn", function () {
        app.client.isVisibleWithinViewport("#data-entry-btn").should.eventually.equal(true);
        app.client.isVisibleWithinViewport("#field-btn").should.eventually.equal(true);
        app.client.isVisibleWithinViewport("#edits-paths-btn").should.eventually.equal(true);
    });

    describe("Data Entry Mode", function () {
        it("should be able to see the page", function () {
            app.client.isEnabled("#data-entry-btn").then(function (enabled) {
                if (enabled) {
                    app.client.click("#data-entry-btn");
                    return app.client.waitUntilWindowLoaded().isVisibleWithinViewport(".container").should.eventually.equal(true);
                }
            });
        });

        it("should have an empty input field after page has loaded", function () {
            app.client.click("#data-entry-btn");
            return app.client.waitUntilWindowLoaded().getValue("#create-new-tray-input").should.eventually.equal("");
        });

        it("should be able to enter a new tray", function () {
            app.client.click("#data-entry-btn");

            app.client.waitUntilWindowLoaded().setValue("#create-new-tray-input", "testingtray");
            app.client.click("#add-tray-btn");
            app.client.click("#pick-a-tray-btn");
            app.client.click("#my-tray-testingtray");
            app.client.click("#edit-tray-btn");

            return app.client.waitUntilWindowLoaded().getValue("#create-new-tray-input").should.eventually.equal("");
        });
    });

    describe("Edit Paths", function () {
        it("should be able to see the page", function () {
            app.client.click("#edit-paths-btn");
            return app.client.waitUntilWindowLoaded().isVisibleWithinViewport(".container").should.eventually.equal(true);
        });
    });

    describe("Field Mode", function () {
        it("container should be visible if the button is enabled", function () {
            app.client.isEnabled("#field-btn").then(function (enabled) {
                if (enabled) {
                    app.client.click("#field-btn");
                    return app.client.waitUntilWindowLoaded().isVisibleWithinViewport(".container").should.eventually.equal(false);
                }
            });
        });
    });
});
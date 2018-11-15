const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');

const baseDir = path.join(__dirname, "..");

const app = new Application({
    path: electronPath,
    args: [baseDir],
    startTimeout: 60000
});

const chaiAsPromised = require("chai-as-promised");
const chai = require("chai");

chai.should();
chai.use(chaiAsPromised);

var app1;
var app2; 

describe("Data Entry Mode Tests", function () {
    this.timeout(60000);

    before(function () {
        app1 = new Application({
            path: electronPath,
            args: [baseDir],
            startTimeout: 60000
        });
        chaiAsPromised.transferPromiseness = app1.transferPromiseness;
        return app1.start();
    });

    after(function () {
        if (app1 && app1.isRunning()) {
            return app1.stop();
        }
    });

    it("should be able to see the container", function () {
        app1.client.isEnabled("#data-entry-btn").then(function (enabled) {
            if (enabled) {
                app1.client.click("#data-entry-btn");
                return app1.client.waitUntilWindowLoaded().isVisibleWithinViewport(".container").should.eventually.equal(true);
            }
        });
    });

    it("should have an empty input field after page has loaded", function () {
        return app1.client.waitUntilWindowLoaded().getValue("#create-new-tray-input").should.eventually.equal("");
    });
});

describe('Application Tests', function () {
    this.timeout(60000);

    beforeEach(function () {
        app2 = new Application({
            path: electronPath,
            args: [baseDir],
            startTimeout: 60000
        });

        chaiAsPromised.transferPromiseness = app2.transferPromiseness;
        return app2.start();
    });

    afterEach(function () {
        if (app2 && app2.isRunning()) {
            return app2.stop();
        }
    });

    it('shows an initial window', function () {
        return app2.client.waitUntilWindowLoaded().getWindowCount().should.eventually.have.at.least(1)
        .browserWindow.isMinimized().should.eventually.be.false
        .browserWindow.isVisible().should.eventually.be.true
        .browserWindow.getBounds().should.eventually.have.property('width').and.be.above(0)
        .browserWindow.getBounds().should.eventually.have.property('height').and.be.above(0);
    });

    it("should show all the mode btns and edit path btn", function () {
        app2.client.isVisibleWithinViewport("#data-entry-btn").should.eventually.equal(true);
        app2.client.isVisibleWithinViewport("#field-btn").should.eventually.equal(true);
        app2.client.isVisibleWithinViewport("#edits-paths-btn").should.eventually.equal(true);
    });

    describe("Data Entry Mode", function () {
        it("should be able to see the page", function () {
            app2.client.isEnabled("#data-entry-btn").then(function (enabled) {
                if (enabled) {
                    app2.client.click("#data-entry-btn");
                    return app2.client.waitUntilWindowLoaded().isVisibleWithinViewport(".container").should.eventually.equal(true);
                }
            });
        });

        it("should have an empty input field after page has loaded", function () {
            app2.client.click("#data-entry-btn");
            return app2.client.waitUntilWindowLoaded().getValue("#create-new-tray-input").should.eventually.equal("");
        });

        it("should be able to enter a new tray", function () {
            app2.client.click("#data-entry-btn");

            app2.client.waitUntilWindowLoaded().setValue("#create-new-tray-input", "testingtray");
            app2.client.click("#add-tray-btn");
        });
    });

    describe("Edit Paths", function () {
        it("should be able to see the page", function () {
            app2.client.click("#edit-paths-btn");
            return app2.client.waitUntilWindowLoaded().isVisibleWithinViewport(".container").should.eventually.equal(true);
        });
    });

    describe("Field Mode", function () {
        it("container should be visible if the button is enabled", function () {
            app2.client.isEnabled("#field-btn").then(function (enabled) {
                if (enabled) {
                    app2.client.click("#field-btn");
                    return app2.client.waitUntilWindowLoaded().isVisibleWithinViewport(".container").should.eventually.equal(false);
                }
            });
        });
    });
});
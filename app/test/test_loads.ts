let webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;
let path = require('path');
let index = 'file:///' + path.resolve('.', 'index.html');

import * as assert from 'assert';

describe('New map creation test', function() {
    let driver;

    before(function() {
        driver = new webdriver.Builder()
            .forBrowser('firefox')
            .build();
        console.log('Firefox browser loaded');
    });

    after(function() {
        driver.quit();
    });

    it('Should load the welcome screen and go through the dialogs to load a map', function(done) {
        driver.get(index);
        this.timeout(20000);
        driver.findElement(By.id('newMapButton')).click();
        // check that we are on correct page
        driver.findElement(By.css('.dropZone > input')).sendKeys(path.resolve('.') + '/app/test/categories.geojson');
        driver.findElement(By.css('.primaryButton')).click();
        driver.sleep(200);
        // check that we are on correct page
        driver.findElement(By.css('#createMapButton')).click().then(function() { console.log('finish'); done(); });


    });

});

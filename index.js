var Twitter = require('twitter');
var csv = require('csvtojson')
var fs = require('fs');
var config = require('./config.js');
var sleep = require('sleep');
var client = new Twitter({
    consumer_key: config.key,
    consumer_secret: config.sec, //Shh
    access_token_key: '',
    access_token_secret: ''
});

var namesAndCount = [];

function getAllNames() {
    var data = fs.readFileSync('vnps.csv', 'utf8');
    return data.split('\r\n,');
}

function processNamesIntoFormat(names) {
    var formatted = [];
    for (let i = 0; i < names.length; i++) {
        formatted.push({
            name: names[i],
            followers: -1
        });
    }
    return formatted;
}

function getFollowersCount(count = 0) {
    if (count == namesAndCount.length) {
        doneGetting();
    }
    var params = {
        screen_name: namesAndCount[count].name
    };

    client.get('users/show', params, function (error, tweets, response) {
        if (!error) {
            console.log(tweets.name + ":" + tweets.followers_count);
            namesAndCount[count].followers = tweets.followers_count;
            setTimeout(function () {
                getFollowersCount(count + 1);
            }, 1010);
        } else if (error[0].code == 50) {
            console.log('removed');
            namesAndCount.splice(count, 1); //remove element that was not found
            setTimeout(function () {
                getFollowersCount(count + 1);
            }, 1010);
        } else {
            console.log(error);
        }
    });
}

function doneGetting() {
    //Sort data based on follower count
    namesAndCount.sort(function (a, b) {
        if (a.followers < b.followers) return -1;
        if (a.followers < b.followers) return 1;
    });
    fs.writeFile("output.json", JSON.stringify(namesAndCount), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

namesAndCount = processNamesIntoFormat(getAllNames());

getFollowersCount();
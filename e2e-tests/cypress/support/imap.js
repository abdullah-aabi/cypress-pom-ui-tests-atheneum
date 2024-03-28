const imaps = require('imap-simple');
const _ = require('lodash');


//TODO WIP
var config = {
    imap: {
        user: process.env.CYPRESS_EMAIL_ADDRESS,
        password: process.env.CYPRESS_EMAIL_PASSWORD,
        host: 'outlook.office365.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
    },
};

async function getLatestEmailAndAttachments () {
    var attachments = [];

    var delay = 24 * 3600 * 1000;
    var yesterday = new Date();
    yesterday.setTime(Date.now() - delay);
    yesterday = yesterday.toISOString();
    var searchCriteria = ['UNSEEN', ['SINCE', yesterday], ['FROM', 'no-reply@selfdeploy.name']];
    var fetchOptions = {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'HEADER'],
        struct: true,
        markSeen: true,
    };

    let connection = await imaps.connect(config);

    await connection.openBox('INBOX');

    let messages = await connection.search(searchCriteria, fetchOptions);

    var subjects = messages.map(function (res) {
        return res.parts.filter(function (part) {
            return part.which === 'HEADER';
        })[0].body.subject;
    });

    // Get the latest email from INBOX
    subjects = subjects[subjects.length - 1];
    messages = messages[messages.length - 1];

    if (messages !== undefined && subjects !== undefined) {
        var parts = await imaps.getParts(messages.attributes.struct);
        var part = await parts.filter(function (part) {
            return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
        });

        for (let i = 0; i < part.length; i++) {
            var partData = await connection.getPartData(messages, part[i]);
            attachments.push({
                subject: subjects[0],
                filename: part[i].disposition.params.filename,
                data: partData,
            });
        }
    }

    await connection.end();

    return attachments;
}

async function getLatestNotificationEmailObject () {
    var emailObject = { subject: '', body: '', error: 'null' };

    var delay = 3600 * 1000;
    var yesterday = new Date();
    yesterday.setTime(Date.now() - delay);
    yesterday = yesterday.toISOString();

    //   var searchCriteria = ['UNSEEN', ['SINCE', yesterday], ['FROM', 'event-notifier@report.selfdeploy.com']];
    const searchCriteria = ['UNSEEN', ['SINCE', yesterday]];
    var fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        struct: true,
        markSeen: false,
    };

    try {
        let connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        let messages = await connection.search(searchCriteria, fetchOptions);

        if (messages.length !== 0) {
            messages = messages[messages.length - 1];
            let retrievedSubject = messages.parts.filter(function (part) {
                return part.which === 'HEADER';
            })[0].body.subject[0];
            emailObject.subject = retrievedSubject;

            var all = _.find(messages.parts, { which: 'TEXT' });
           
            emailObject.body =  (Buffer.from(all.body, 'base64').toString('ascii'))
        }

        await connection.end();

        // console.log(emailObject.body)

        return emailObject;
    } catch (e) {
        emailObject.error = e;
        return emailObject;
    }
}

// getLatestNotificationEmailObject()

exports.getLatestNotificationEmailObject = getLatestNotificationEmailObject;
exports.getLatestEmailAndAttachments = getLatestEmailAndAttachments;

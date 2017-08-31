import * as schedule from 'node-schedule';
import * as moment from 'moment';
import * as Configs from "./config";

// possible values of utc offset in the world
let utcOffsets: Array<number> = [
    -12, -11, -10, -9.5, -9, -8, -7, -6, -5, -4, -3.5, -3, -2, -1, 0, 1, 2, 3, 3.5, 4,
    4.5, 5, 5.5, 5.75, 6, 6.5, 7, 8, 8.5, 8.75, 9, 9.5, 10, 10.5, 11, 12, 12.75, 13, 14
];
// array of job objects
let jobs: Array<any> = [];
// time at which notifications will be sent.
const serverConfigs = Configs.getServerConfigs();
const morning: number = serverConfigs.notifTime.morning;
const evening: number = serverConfigs.notifTime.evening;
const night: number = serverConfigs.notifTime.night;

for (let i = 0; i < utcOffsets.length; i++) {
    setNotifSchedule(utcOffsets[i]);
}

function sendNotif(offset: number, time: string) {
    return function () {
        console.log(`sending notifications to users whose utc offset is ${offset} and preference ${time}`);
        // TODO
        // integrate onesignal and send notifications.
    };
}

// This function sets the runningTime of the cron job (morning/evening/night) according to the offset.
function setNotifSchedule(offset: number) {
    let jobObject: any = {};
    jobObject['offset'] = offset;
    let Schedule: any;
    // schedule a job to run in morning    
    let morningDiff: number = morning - offset;
    Schedule = getSchedule(morningDiff);
    let cronMorningTime: string = `${Schedule.minute} ${Schedule.hour} * * *`;
    jobObject['morning'] = schedule.scheduleJob(cronMorningTime, sendNotif(offset, 'morning'));
    // schedule a job to run at night
    let nightDiff: number = night - offset;
    Schedule = getSchedule(nightDiff);
    let cronNightTime: string = `${Schedule.minute} ${Schedule.hour} * * *`;
    jobObject['night'] = schedule.scheduleJob(cronNightTime, sendNotif(offset, 'night'));
    // schedule a job to run in evening
    let eveningDiff: number = evening - offset;
    Schedule = getSchedule(eveningDiff);
    let cronEveningTime: string = `${Schedule.minute} ${Schedule.hour} * * *`;
    jobObject['evening'] = schedule.scheduleJob(cronEveningTime, sendNotif(offset, 'evening'));
    jobs.push(jobObject);
}

// returns the hour and minute at which notification should be sent relative to the local tz
function getSchedule(diff: number): any {
    let time: number;
    if (diff >= 0 && diff <= 24) {
        time = diff;
    } else if (diff > 24) {
        time = diff - 24; // if next day convert the time to present day
    } else if (diff < 0) {
        time = 24 + diff; // if previous day convert the time to present day
    }
    // get hours and minutes after splitting around '.'
    let hour: number = +(time.toString().split('.')[0]);
    let minute: number = +('.' + time.toString().split('.')[1]) * 60 | 0;
    // get the utc date
    let utcDate = moment.utc([2017, 1, 1, hour, minute]);
    // convert the date to local time
    utcDate.local();
    return ({
        hour: utcDate.hours(),
        minute: utcDate.minutes()
    });
}

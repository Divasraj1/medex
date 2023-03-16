let reminders = [];

let messageInputs = document.querySelectorAll('.message');
let timeInputs = document.querySelectorAll('.time');
let submitButton = document.getElementById('submit');

submitButton.onclick = function(){
    chrome.alarms.clearAll();
    for(let i=0;i<messageInputs.length;i++){
        let message = messageInputs[i].value;
        let time = timeInputs[i].value;

        if(message && time){
            let reminder = {message,time};
            reminders.push(reminder);
        }
    }

    localStorage.setItem('reminders',JSON.stringify(reminders));

    let now = new Date();
    let day = now.getDay();

    for(let i=0;i<7;i++){
        let remindersForDay = reminders.filter((reminder) => {
            return reminder.time && (i===day);
        });
        for(let j=0;j<remindersForDay.length;j++){
            let reminder = remindersForDay[j];
            let timeParts = reminder.time.split(':');
            let alarmTime = new Date();
            alarmTime.setHours(timeParts[0],timeParts[1],0);
            alarmTime.setDate(alarmTime.getDate() + i);
            chrome.alarms.create(`reminder_${i}_${j}`,{when: alarmTime.getTime()});
        }
    }
    alert('Reminders Set.');
};

chrome.alarms.onAlarm.addListener(function(alarm){
    if(alarm.name.startWith('reminder_')){
        let parts = alarm.name.split('_');
        let day = parseInt(parts[1]);
        let index = parseInt(parts[2]);

        let remindersForDay = reminders.filter((reminder) => {
            return reminder.time && (day === new Date().getDay());
        });

        if(index < remindersForDay.length){
            let reminder = remindersForDay[index];
            alert(reminder.message);
        }
    }
})
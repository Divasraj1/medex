let reminders = [];

let messageInputs = document.querySelectorAll('.message');
let timeInputs = document.querySelectorAll('.time');
let submitButton = document.getElementById('submit');
let aisubmitButton = document.getElementById('aisubmit');
let airesponse = document.getElementById('airesponse');
let question = document.getElementById('aiquestion');
let pastmeds = document.getElementById('pastmeds');

function loadData(){
    const pastdata = JSON.parse(localStorage.getItem('reminders'));
    if (pastdata) {
      pastdata.forEach(data => {
          const listItem = document.createElement('p');
          listItem.textContent = data.message +" "+ data.time;
          pastmeds.appendChild(listItem);
        });
    }
}

// Retrieve data from localStorage on extension open
window.addEventListener('load', () => {
  loadData();
});

aisubmitButton.addEventListener('click', async () => {
    const prompt = question.value;
    console.log("prompt:",prompt);
    const response = await getAiResponse(prompt);
    console.log(response);
    airesponse.innerText = response;
    loadData();
});
  
  async function getAiResponse(prompt) {
    const response = await fetch('http://localhost:8080/chat', {
      method: 'POST',
      body: JSON.stringify({ "query":prompt }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  
    const { data } = await response.json();
    return data;
  }

submitButton.onclick = function(){
    console.log("messageInputs size",messageInputs.length);
    chrome.alarms.clearAll();
    for(let i=0;i<messageInputs.length-1;i++){
        let message = messageInputs[i].value;
        console.log(timeInputs[i].value);
        let time = timeInputs[i].value;
        console.log(i);

        if(message && time){
            let reminder = {message,time};
            console.log("reminder set:",reminder.message,reminder.time);
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
    
    const dat =localStorage.getItem('reminders');
    console.log("data:",dat);
    alert('Reminders Set.');
    
  chrome.alarms.create("checkReminders", {
    periodInMinutes: 1 // check every minute
});
};


function getFormattedTime(timestamp) {
    var date = new Date(timestamp);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
  }

function checkReminders() {
    const storedReminders = localStorage.getItem("reminders");

    // If there are stored reminders, parse them into an array
    let reminders = [];
    if (storedReminders) {
      reminders = JSON.parse(storedReminders);
    }
    // Get the current time as a Unix timestamp
    const currentTime = getFormattedTime(Date.now());
    console.log("check reminders");
    console.log("currentTime: ",currentTime);
    console.log("reminders",reminders);
    // Loop through the reminders and show any that are due
    reminders.forEach((reminder) => {
        console.log("Reminder time:", reminder.time);
        if (reminder.time === currentTime) {
            playSound("medexVoice.mp3");
            window.alert(reminder.message);
            console.log("Reminder message:", reminder.message);
        }
    });
}

function playSound(url) {
    const audio = new Audio(url);
    audio.play();
  } 
setInterval(checkReminders, 60000);
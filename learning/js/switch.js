// switch statement
let day = new Date().getDay();
let dayName;
switch (day) {
  case 0: dayName = 'Sunday'; break;
  case 1: dayName = 'Monday'; break;
  case 2: dayName = 'Tuesday'; break;
  case 3: dayName = 'Wednesday'; break;
  case 4: dayName = 'Thursday'; break;
  case 5: dayName = 'Friday'; break;
  default: dayName = 'Saturday';
}
console.log('today is ' + dayName);

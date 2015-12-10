var moment = rome.moment().add( 0 , 'days');
var tomorrow = rome.moment().add( 2 ,'days');

rome(checkin, { 
   weekStart: 1,
   time: false,
   monthsInCalendar: 2,
   initialValue: moment,
   min: moment
});
rome(checkout, { 
   weekStart: 1,
   time: false,
   monthsInCalendar: 2,
   dateValidator: rome.val.afterEq(checkin),
   initialValue: rome.moment(checkin).add( 1 ,'day')
});

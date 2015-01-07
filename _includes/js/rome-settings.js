var moment = rome.moment().add( 0 , 'days');
        var tomorrow = rome.moment().add( 2 ,'days');
        rome(checkout, { 
            weekStart: 1,
            time: false,
            min: tomorrow,
            initialValue: tomorrow
        });
        rome(checkin, { 
            weekStart: 1,
            time: false,
            initialValue: moment,
            min: moment
        });
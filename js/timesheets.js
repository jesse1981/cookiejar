function addTimeSheetEntry() {
	$('#timesheet_entries').append($('#timesheet_item').html());
	
	// Update _# values to the latest count
	var count = $('.timesheet_item').length;
	$('#timesheet_entries .timesheet_item:last-child').find('input,select').each(function() {
		var thisLabel = $(this).attr("name");
		thisLabel = thisLabel.replace("_#","_"+count);
		$(this).attr("name",thisLabel);
		$(this).attr("id",thisLabel);
	});
	
	// Add the timesheet_id value for the form.
	$.ajax({
		url: '/timesheets/createTimesheet',
		success: function(res) {
			$('#timesheet_id_'+count).val(parseInt(res));
		}
	});
	
	// Populate the companies
	$.ajax({
		url: '/query/getJsonData/companys',
		success: function(res) {
			var data = JSON.parse(res);
			for (var i in data) {
				$('#employer_'+count).append('<option value="'+data[i]["id"]+'">'+data[i]["company_name"]+'</option>');
			}
			
			// bind selection
			initCompanySelect(count);
		}
	});
	
	// Apply the date & time pickers
	$('#timesheet_entries .timesheet_item:last-child .datepick').datepicker({
        dateFormat: 'yy-mm-dd',
        //timeFormat: 'hh:mm:ss'
		onSelect: function(dateValue) {
			initDateChange($('#fortnight_'+count),dateValue);
		}
    });
	
	
	// set up validations
	/*
	$('.validate').unbind('blur');
	$('.validate').blur(function() {
		validateTime($(this).parent());
	});
	*/
}
function initCompanySelect(count) {
	$('#employer_'+count).unbind('change');
	$('#employer_'+count).change(function() {
		$('#employee_'+count).find('option').remove();
		$.ajax({
			url: '/companys/getStaff/'+$('#employer_'+count).val(),
			success: function(res) {
				var data = JSON.parse(res);
				for (var i in data) {
					$('#employee_'+count).append('<option value="'+data[i]["id"]+'">'+data[i]["name_first"]+' '+data[i]["name_last"]+'</option>');
				}
			}
		});
		
	});
}
function initDateChange(date) {
	var fortnightDate = moment(date);
	var dayCount = 14;
	$(document).find('table tbody tr td:nth-child(2)').each(function() {
		if ($(this).parent().find('td').length != 3) {
			dayCount--;
			$(this).find('input').val(fortnightDate.clone().subtract(dayCount,'days').format("YYYY-MM-DD"));
			$(this).prev().text(fortnightDate.clone().subtract(dayCount,'days').format("dddd"));
		}
	});
	return false;
}
function validateTime(objRow) {
	var lastTime = "";
	var totalMs = 0;
	for (i=3;i<=11;i+=4) {
		var a = objRow.find('td:nth-child('+i+') input');
		var b = objRow.find('td:nth-child('+(i+1)+') input');
		var aVal = moment(a.parent().parent().find('td:nth-child(2) input').val() + ' ' + a.val());
		var bVal = moment(b.parent().parent().find('td:nth-child(2) input').val() + ' ' + b.val());
		
		if ((aVal.isValid()==false) || (bVal.isValid()==false)) {		// Either the start or finish is an invalid time.
			// just ignore, continue
			continue;
		}
		else if (((aVal.isValid()) && (bVal.isValid())) &&				// Both have valid date/time
			(bVal.diff(aVal) > 0) &&									// Finish > Start
			((lastTime == "") || (aVal.diff(lastTime) > 0))) {			// lastTime is either not set, or the start time of this block is later.
			// Set the new last time
			lastTime = bVal;
			
			// Calculate the hours/mins (5, 8, 11)
			
			
			// Set these objects as valid
			a.removeClass('invalid').addClass('valid');
			b.removeClass('invalid').addClass('valid');
			
			// update the hours
			b.parent().next().next().find('input').val(moment.utc(bVal.diff(aVal)).format("HH:mm:ss"));
			totalMs += moment.utc(bVal.diff(aVal));
		}
		else if (((aVal.isValid()) && (bVal.isValid())) &&				// Both have valid date/time
				((bVal.diff(aVal) <= 0) || 								// Finish	<= Start OR 
					((lastTime!="") && (aVal.diff(lastTime) <= 0)))) {	// Start	<= Previous finish
			// Set these objects as invalid
			a.removeClass('valid').addClass('invalid');
			b.removeClass('valid').addClass('invalid');
		}
	}
	objRow.find('td:last-child input').val(moment.utc(totalMs).format("HH:mm:ss"));
	objRow.find('td:last-child input').attr("rel",totalMs);
	updateTotalWeek(objRow);
}
function updateTotalWeek(objRow) {
	var totalDuration = 0;
	var tbody = objRow.parent();
	for (i=1;i<=7;i++) {
		totalDuration += parseInt("0" + tbody.find('tr:nth-child('+i+') td:nth-child(15) input').attr("rel"));
	}
	objRow.parent().find('tr:last-child td:last-child input').val(moment.utc(totalDuration).format("HH:mm:ss"));
}
function submitAll() {
	var formIndex = 0;
	$('form').each(function() {
		formIndex++;
		var formData = {};
		
		formData.id				= $('#timesheet_id_' + formIndex).val();
		formData.employer_id 	= $('#employer_' + formIndex).val();
		formData.employee_id 	= $('#employee_' + formIndex).val();
		formData.position		= $('#position_' + formIndex).val();
		formData.fortnight		= $('#fortnight_' + formIndex).val();
		
		formData.shiftData = [];
		
		for (i=1;i<=7;i++) {
			var rowDate = $(this).find('table tbody tr:nth-child('+i+') td:nth-child(2)').innerHTML;
			for (x=3;x<=9;x+=3) {
				var a = $(this).find('table tbody tr:nth-child('+i+') td:nth-child('+x+') input');
				var b = $(this).find('table tbody tr:nth-child('+i+') td:nth-child('+(x+1)+') input');
				if (a.hasClass('valid')) {
					formData.shiftData.push({
						date: rowDate,
						start: a.val(),
						finish: b.val()
					});
				}
			}
		}
		
		$.ajax({
			url: '/timesheets/storeTimesheet',
			data: 'data='+formData,
			type: 'POST',
			success: function() {
				
			}
		});
	});
}
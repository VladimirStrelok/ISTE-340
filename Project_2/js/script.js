var availableCities, availableCounties;

function err(event){
	console.log(event);
}

function getStates(){
	$.ajax({
		type:'get',
		url:'proxy.php',
		dataType:'xml',
		data:{path:'/States'},
		success: function(data){
			$(data).find('row').each(function(){
				$('#search-state').append('<option>'+$(this).find('State').text()+'</option');
			});
		},
		error:err
	});
}
function getTypes(){
	$.ajax({
		type:'get',
		url:'proxy.php',
		dataType:'xml',
		data:{path:'/OrgTypes'},
		success: function(data){
			$(data).find('row').each(function(){
				$('#search-type').append('<option value="'+$(this).find('type').text()+'">'+$(this).find('type').text()+'</option');
			});
		},
		error:err
	});
}

function getCities(){
	var state;
	if($('#search-state').val()){
		state = $('#search-state').val();
	}
	else{
		state = '';
	}
	availableCities = []
	$.ajax({
		type:'get',
		url:'proxy.php',
		dataType:'xml',
		data:{path:'/Cities?state='+state},
		success: function(data){
			$(data).find('row').each(function(){
				availableCities.push($(this).find('city').text());
			});
		},
		error:err
	});
	$('#search-city').autocomplete({
		source: availableCities
	});
}

function getCounties(){
	var state;
	if($('#search-state').val()){
		state = $('#search-state').val();
	}
	else{
		state = '';
	}
	availableCounties = []
	$.ajax({
		type:'get',
		url:'proxy.php',
		dataType:'xml',
		data:{path:'/Counties?state='+state},
		success: function(data){
			$(data).find('row').each(function(){
				var county = $(this).find('CountyName').text();
				if($.inArray(county,availableCounties) >= 0){}
				else{
					availableCounties.push(county);
				}
			});
		},
		error:err
	});
	$('#search-county').autocomplete({
    minLength: 4,
		source: availableCounties
	});
}

function getTabs(data){
	$("#display-modal-title").text($(data).find('Name').text());
	buildTabs(data);
	$("#display-modal").modal('show');
	function buildTabs(org){
		var tabs = [];
		$.ajax({
			type:'get',
			url:'proxy.php',
			dataType:'xml',
			data:{path:'/Application/Tabs?orgId='+$(org).find('OrganizationID').text()},
			success: function(data){
				var tabDiv = $('<div id="display-modal-tabs"></div>');
				var ul = $('<ul>')
				tabDiv.append(ul);
				$(data).find('row').each(function(){
					$(ul).append($('<li>').append($('<a href="#'+$(this).text()+'">'+$(this).text()+'</a>')))
					var tabContent = $('<div id="'+$(this).text()+'"></div>')
					tabDiv.append(buildContent($(org).find('OrganizationID').text(),$(this).text()))
				})
				$('#display-modal-body').empty().append(tabDiv);
				$(tabDiv).tabs({
					show:{
						effect:"fade"
					},
					hide:{
						effect:"fade"

					}
				});
			},
			error:err
		});
	}
	function buildContent(org,tabName){
		var tabData, toReturn = $('<div id="'+tabName+'"></div>');
			$.ajax({
				type:'get',
				url:'proxy.php',
				dataType:'xml',
				data:{path: '/'+org+'/'+getTabDataName(tabName)},
				success: function(data){
					switch(tabName) {
						case 'General':
							var row = $('<div>').addClass('row');
							var left = $('<div>').addClass('col-sm-6');
							if($(data).find('name').text() != '' && $(data).find('name').text() != null)
							{
									$(left).append($('<div>').append($("<label>").text('Name')).append($("<div>").text($(data).find('name').text())))
							}
							if($(data).find('description').text() != '' &&$(data).find('description').text() != 'null')
							{
									$(left).append($('<div>').append($("<label>").text('Description')).append($("<div>").text($(data).find('description').text())))
							}
							if($(data).find('website').text() != '' &&$(data).find('website').text() != 'null')
							{
									$(left).append($('<div>').append($("<label>").text('Website')).append($("<div>").text($(data).find('website').text())))
							}
							if($(data).find('email').text() != '' && $(data).find('email').text() != 'null')
							{
									$(left).append($('<div>').append($("<label>").text('Email')).append($("<div>").text($(data).find('email').text())))
							}
							var right = $('<div>').addClass('col-sm-6');
							if($(data).find('nummembers').text() != '' && $(data).find('nummembers').text() != 'null')
							{
									$(right).append($('<div>').append($("<label>").text('Number of Members')).append($("<div>").text($(data).find('nummembers').text())))
							}
							if($(data).find('numcalls').text() != '' && $(data).find('numcalls').text() != 'null')
							{
									$(right).append($('<div>').append($("<label>").text('Number of Calls')).append($("<div>").text($(data).find('numcalls').text())))
							}
							if($(data).find('servicearea').text() != '' && $(data).find('servicearea').text() != 'null')
							{
									$(right).append($('<div>').append($("<label>").text('Service Area')).append($("<div>").text($(data).find('servicearea').text())))
							}
							$(row).append(left).append(right);
							$(toReturn).append(row);
							break;
						case 'Treatment':
							if($(data).find('count').text() == 0){
								$(toReturn).append($('<h3>').append('There are no Treatments at this Organization.'));
							} else {
								$(toReturn).append($('<h3>').append('Available Treatments.'));
								var table = $('<table>').addClass('table table-striped table-bordered');
								var thead = $('<thead>').append($('<tr>').append($('<th>').append('Type')).append($('<th>').append('Abbreviation')));
								var tbody = $('<tbody>');

								$(table).append(thead);

								$(table).append(tbody);

								$(data).find('treatment').each(function(){
									$(tbody).append(
										$('<tr>').append(
											$('<td>').append($(this).find('type').text())
										).append(
											$('<td>').append($(this).find('abbreviation').text())
										)
									)
								});

								$(toReturn).append(table);
								$(table).dataTable();
							}
							break;
						case 'Training':
							if($(data).find('count').text() == 0){
								$(toReturn).append($('<h3>').append('There is no Training at this Organization.'));
							} else {
								$(toReturn).append($('<h3>').append('Available Training.'));
								var table = $('<table>').addClass('table table-striped table-bordered');
								var thead = $('<thead>').append($('<tr>').append($('<th>').append('Type')).append($('<th>').append('Abbreviation')));
								var tbody = $('<tbody>');

								$(table).append(thead);

								$(table).append(tbody);

								$(data).find('training').each(function(){
									$(tbody).append(
										$('<tr>').append(
											$('<td>').append($(this).find('type').text())
										).append(
											$('<td>').append($(this).find('abbreviation').text())
										)
									)
								});

								$(toReturn).append(table);
								$(table).dataTable();
							}
							break;
						case 'Facilities':
							if($(data).find('count').text() == 0){
								$(toReturn).append($('<h3>').append('There are no Facilities in this Organization.'));
							} else {
								$(toReturn).append($('<h3>').append('Available Facilities.'));
								var table = $('<table>').addClass('table table-striped table-bordered');
								var thead = $('<thead>').append($('<tr>')
								.append($('<th>').append('Type'))
								.append($('<th>').append('Quantity'))
								.append($('<th>').append('Description')));
								var tbody = $('<tbody>');

								$(table).append(thead);

								$(table).append(tbody);

								$(data).find('facility').each(function(){
									$(tbody).append(
										$('<tr>').append(
											$('<td>').append($(this).find('type').text())
										).append(
											$('<td>').append($(this).find('quantity').text())
										).append(
											$('<td>').append($(this).find('description').text())
										)
									)
								});

								$(toReturn).append(table);
								$(table).dataTable();
							}
							break;
						case 'Equipment':
							if($(data).find('count').text() == 0){
								$(toReturn).append($('<h3>').append('There is no Equipment in this Organization.'));
							} else {
								$(toReturn).append($('<h3>').append('Available Equipment.'));
								var table = $('<table>').addClass('table table-striped table-bordered');
								var thead = $('<thead>').append($('<tr>')
								.append($('<th>').append('Type'))
								.append($('<th>').append('Quantity'))
								.append($('<th>').append('Description')));
								var tbody = $('<tbody>');

								$(table).append(thead);

								$(table).append(tbody);

								$(data).find('equipment').each(function(){
									$(tbody).append(
										$('<tr>').append(
											$('<td>').append($(this).find('type').text())
										).append(
											$('<td>').append($(this).find('quantity').text())
										).append(
											$('<td>').append($(this).find('description').text())
										)
									)
								});

								$(toReturn).append(table);
								$(table).dataTable();
							}
							break;
						case 'People':
							if($(data).find('siteCount').text() == 0){
								$(toReturn).append($('<h3>').append('There are no People in this Organization.'));
							} else {
								var select = $('<select>').addClass('form-control').appendTo(toReturn).change(function(){
									$("#display-modal-people").children().hide();
									$("#display-modal-people-"+$(this).val()).show('fade');
								});
								var peopleDiv = $('<div>').appendTo(toReturn).attr('id','display-modal-people');
								$(data).find('site').each(function(){
									$(select).append($('<option>').text($(this).attr('address')).val($(this).attr('siteId')));
									if($(this).find('personCount').text() == '0'){
										var siteDiv = $('<div>').attr('id','display-modal-people-'+$(this).attr('siteId')).attr('hidden',true).appendTo(peopleDiv).append($('<h4>').append('There are no people at this location.'));
									}
									else{
										var siteDiv = $('<div>').attr('id','display-modal-people-'+$(this).attr('siteId')).attr('hidden',true).appendTo(peopleDiv);
										var table = $('<table>').addClass('table table-striped table-bordered');
										var thead = $('<thead>').append($('<tr>')
										.append($('<th>').append('Name'))
										.append($('<th>').append('Role'))
										.append($('<th>').append('Contact Methods')));
										var tbody = $('<tbody>');

										$(table).append(thead);

										$(table).append(tbody);

										$(this).find('person').each(function(){
											$(tbody).append(
												$('<tr>').append(
													$('<td>').append($(this).find('honorific').text()+" "+$(this).find('fName').text()+" "+$(this).find('lName').text()+" "+$(this).find('suffix').text())
												).append(
													$('<td>').append($(this).find('role').text())
												).append(
													$('<td>').append("to do")
												)
											)
										});

										$(siteDiv).append(table);
										$(table).dataTable();
									}
								});
								$(select).change();
							}
							break;
						case 'Physicians':
							if($(data).find('count').text() == 0){
								$(toReturn).append($('<h3>').append('There are no Physicians at this Organization.'));
							} else {
								$(toReturn).append($('<h3>').append('Physicians'));
								var table = $('<table>').addClass('table table-striped table-bordered');
								var thead = $('<thead>').append(
									$('<tr>').append(
										$('<th>').append('Name')
									).append(
										$('<th>').append('Phone')
									).append(
										$('<th>').append('License')
									)
								);
								var tbody = $('<tbody>');

								$(table).append(thead);

								$(table).append(tbody);

								$(data).find('physician').each(function(){
									$(tbody).append(
										$('<tr>').append(
											$('<td>').append($(this).find('fName').text()+" "+$(this).find('lName').text()+" "+$(this).find('suffix').text())										).append(
											$('<td>').append($(this).find('phone').text())
										).append(
											$('<td>').append($(this).find('license').text())
										)
									)
								});

								$(toReturn).append(table);
								$(table).dataTable();
							}
							break;
						case 'People':
							if($(data).find('count').text() == 0){
								$(toReturn).append($('<h3>').append('There are no Physicians at this Organization.'));
							} else {
							}
							break;
						default:
								$(toReturn).append($('<span>').text(org + " " + tabName));
					}
				},
				error:err
			});

		return toReturn;
	}
	function getTabDataName(tabName){
		switch(tabName) {
				case 'Treatment':
					return 'Treatments'
					break;
				default:
					return tabName;
		}
	}
}

function buildTable(data){
	var table = $('<table>').append(
		$("<thead>").append(
				$('<tr>').append($("<th>Name</th>")).append($("<th>Type</th>")).append($("<th>City</th>")).append($("<th>State</th>")).append($("<th>Zipcode</th>"))
		)
	).append(
		$("<tbody>")
	).addClass('table table-striped table-bordered');
	$(data).find('row').each(function(){
		$(buildRow(this)).appendTo($(table).find('tbody'));
	})
	$('#output').empty().append(table).find('table').dataTable();

	function buildRow(data){
		if($(data).find('type').text() == "Physician"){
			return $('<tr>').append($("<th>"+$(data).find('fName').text()+" "+$(data).find('lName').text()+"</th>"))
											.append($("<th>"+$(data).find('type').text()+"</th>"))
											.append($("<th>"+$(data).find('city').text()+"</th>"))
											.append($("<th>"+$(data).find('State').text()+"</th>"))
											.append($("<th>"+$(data).find('zip').text()+"</th>"));

		}
		else{
			return $('<tr>').append($("<th>"+$(data).find('Name').text()+"</th>"))
											.append($("<th>"+$(data).find('type').text()+"</th>"))
											.append($("<th>"+$(data).find('city').text()+"</th>"))
											.append($("<th>"+$(data).find('State').text()+"</th>"))
											.append($("<th>"+$(data).find('zip').text()+"</th>")).click(function(){getTabs(data)});
		}
	}
}

function getOrgs(){
	$.ajax({
		type:'get',
		url:'proxy.php',
		dataType:'xml',
		data:{path:'/Organizations?'+$('#search-form').serialize()},
		success: function(data){
			$('#output').append(buildTable(data));

		},
		error:err
	});

}

function validate(){
	//to build
	return true;
}

function setUp(){

	//gets
	getStates();
	getTypes();
	getCities();
	getCounties();

	//set up events
	$('#search-state').change(function(){
		getCities();
		getCounties();
	});

	$('#search-form').submit(function(){
		if(validate()){
			getOrgs();
		}
		return false
	});
	$('#output-table').DataTable();
}

$().ready(function(){
	setUp();
})

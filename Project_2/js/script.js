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
				$(tabDiv).tabs();
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
							if($(data).has('name') && $(data).find('name').text() != null)
							{
									$(left).append($('<div>').append($("<label>").text('Name')).append($("<div>").text($(data).find('name').text())))
							}
							if($(data).has('description') &&$(data).find('description').text() != 'null')
							{
									$(left).append($('<div>').append($("<label>").text('Description')).append($("<div>").text($(data).find('description').text())))
							}
							if($(data).has('website') &&$(data).find('website').text() != 'null')
							{
									$(left).append($('<div>').append($("<label>").text('Website')).append($("<div>").text($(data).find('website').text())))
							}
							if($(data).has('email') &&$(data).find('email').text() != 'null')
							{
									$(left).append($('<div>').append($("<label>").text('Email')).append($("<div>").text($(data).find('email').text())))
							}
							var right = $('<div>').addClass('col-sm-6');
							if($(data).has('nummembers') && $(data).find('nummembers').text() != 'null')
							{
									$(right).append($('<div>').append($("<label>").text('Number of Members')).append($("<div>").text($(data).find('nummembers').text())))
							}
							if($(data).has('numcalls') &&$(data).find('numcalls').text() != 'null')
							{
									$(right).append($('<div>').append($("<label>").text('Number of Calls')).append($("<div>").text($(data).find('numcalls').text())))
							}
							if($(data).has('servicearea') &&$(data).find('servicearea').text() != 'null')
							{
									$(right).append($('<div>').append($("<label>").text('Service Area')).append($("<div>").text($(data).find('servicearea').text())))
							}
							$(row).append(left).append(right);
							$(toReturn).append(row);
							break;
						case 'Treatment':

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
}

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

function getOrgs(){
	console.log($('#search-form').serialize());
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

	$('#search-form').submit(function(){getOrgs(); return false;});
	$('#output-table').DataTable();
}

$().ready(function(){
	setUp();
})

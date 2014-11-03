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
							if($(data).find('name').text() != '' && $(data).find('name').text() != null){
								$(left).append($('<div>').append($("<label>").text('Name')).append($("<div>").text($(data).find('name').text())))
							}
							if($(data).find('description').text() != '' &&$(data).find('description').text() != 'null'){
								$(left).append($('<div>').append($("<label>").text('Description')).append($("<div>").text($(data).find('description').text())))
							}
							if($(data).find('website').text() != '' &&$(data).find('website').text() != 'null'){
								$(left).append($('<div>').append($("<label>").text('Website')).append($("<div>").text($(data).find('website').text())))
							}
							if($(data).find('email').text() != '' && $(data).find('email').text() != 'null'){
								$(left).append($('<div>').append($("<label>").text('Email')).append($("<div>").text($(data).find('email').text())))
							}
							var right = $('<div>').addClass('col-sm-6');
							if($(data).find('nummembers').text() != '' && $(data).find('nummembers').text() != 'null'){
								$(right).append($('<div>').append($("<label>").text('Number of Members')).append($("<div>").text($(data).find('nummembers').text())))
							}
							if($(data).find('numcalls').text() != '' && $(data).find('numcalls').text() != 'null'){
								$(right).append($('<div>').append($("<label>").text('Number of Calls')).append($("<div>").text($(data).find('numcalls').text())))
							}
							if($(data).find('servicearea').text() != '' && $(data).find('servicearea').text() != 'null'){
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
								case 'Locations':
									if($(data).find('count').text() == '0'){
										$(toReturn).append($('<h3>').append('There are no Physicians at this Organization.'));
									} else {
										if($(data).find('count').text() == '1'){
											var row = $('<div>').addClass('row');
											var left = $('<div>').addClass('col-sm-6');
											var theMarker;
											if(($(data).find('address1').text() != '' && $(data).find('address1 ').text() != null) &&
												 ($(data).find('city').text() != '' && $(data).find('city ').text() != null) &&
												 ($(data).find('state').text() != '' && $(data).find('state ').text() != null) &&
												 ($(data).find('zip').text() != '' && $(data).find('zip ').text() != null)){
												theMarker = {
													address: $(data).find('address1').text() + ' ' + $(data).find('city').text()+', '+$(data).find('state').text()+' '+$(data).find('zip').text()
												}
												$(left).append($('<div>').append(
													$('<address>').append(
														$('<strong>').append('Address')
													).append($('<br/>')).append(
														$(data).find('address1').text() + '<br/>'
													).append(
														(($(data).find('address2').text() != '' && $(data).find('address2').text() != null) ? $(data).find('address2').text() + '<br/>' : '')+''
													).append(
														$(data).find('city').text()+', '+$(data).find('state').text()+' '+$(data).find('zip').text()+ '<br/>'
													).append(
														(($(data).find('phone').text() != '' && $(data).find('phone').text() != null) ? '<abbr title="Phone">P:</abbr> '+ $(data).find('phone').text() + '<br/>' : '')+''
													).append(
														(($(data).find('ttyPhone').text() != '' && $(data).find('ttyPhone').text() != null) ? '<abbr title="ttyPhone">T:</abbr> '+ $(data).find('ttyPhone').text() + '<br/>' : '')+''
													)
												));
											}
											if(($(data).find('latitude').text() != '' && $(data).find('latitude ').text() != null) &&
												($(data).find('longitude').text() != '' && $(data).find('longitude ').text() != null)){
												theMarker = {
													latLng: [$(data).find('latitude').text(), $(data).find('longitude').text()]
												}
												$(left).append(
													$('<div>').append(
														$('<strong>').append('Latitude: ')
													).append(
														$(data).find('latitude').text()+"<br/>"
													).append(
														$('<strong>').append('Longitude: ')
													).append(
														$(data).find('longitude').text()
													)
												)

											}

											var right = $('<div>').addClass('col-sm-6');
											$(right).append($('<div id="gmap"></div>'))
											$(row).append(left).append(right);
											$(toReturn).append(row);
											$('#display-modal-body').on( "tabsactivate", function( event, ui ) {
												$('#gmap').gmap3({
													marker: theMarker,
													map: {
														options:{
															zoom: 14
														}
													}
												});
											});
										} else {
											var activeMarkers = {};
											var row = $('<div>').addClass('row');
											var left = $('<div>').addClass('col-sm-6');
											var select = $('<select>').addClass('form-control').appendTo(left).change(function(){
												$("#display-modal-locations").children().hide();
												$("#display-modal-locations-"+$(this).val()).show('fade');
												changeMap($(this).val());
											});
											function changeMap(id){
												$('#gmap').gmap3({
													marker: activeMarkers[id],
													map: {
														center:activeMarkers[id],
														options:{
															zoom: 14
														}
													}
												});
												if(activeMarkers[id].latitude){
													$('#gmap').gmap3('get').setCenter(new google.maps.LatLng(activeMarkers[id].latitude,activeMarkers[id].longitude));
												}
												else{
													var geocoder = new google.maps.Geocoder()
													geocoder.geocode( { 'address': activeMarkers[id].address}, function(results, status) {
											      if (status == google.maps.GeocoderStatus.OK) {
											        $('#gmap').gmap3('get').setCenter(results[0].geometry.location);
											      } else {
											        alert("Geocode was not successful for the following reason: " + status);
											      }
													});
												}
											}
											var locationsDiv = $('<div id="display-modal-locations"></div>');
											$(data).find('location').each(function(){
												console.log($(this).find('siteId').text())
												$(select).append(
													$('<option>').val($(this).find('siteId').text()).append($(this).find('type').text()+' - '+$(this).find('address1').text())
												)
												var locDiv = $('<div>')
												.attr('id','display-modal-locations-'+$(this).find('siteId').text())
												.attr('hidden',true)
												.appendTo(locationsDiv);
												if(($(this).find('address1').text() != '' && $(this).find('address1 ').text() != null) &&
													($(this).find('city').text() != '' && $(this).find('city ').text() != null) &&
													($(this).find('state').text() != '' && $(this).find('state ').text() != null) &&
													($(this).find('zip').text() != '' && $(this).find('zip ').text() != null)){
													activeMarkers[$(this).find('siteId').text()] = {
														address: $(this).find('address1').text() + ' ' + $(this).find('city').text()+', '+$(this).find('state').text()+' '+$(this).find('zip').text()
													}
													$(locDiv).append($('<div>').append(
														$('<address>').append(
															$('<strong>').append('Address')
														).append($('<br/>')).append(
															$(this).find('address1').text() + '<br/>'
														).append(
															(($(this).find('address2').text() != '' && $(this).find('address2').text() != null) ? $(this).find('address2').text() + '<br/>' : '')+''
														).append(
															$(this).find('city').text()+', '+$(this).find('state').text()+' '+$(this).find('zip').text()+ '<br/>'
														).append(
															(($(this).find('phone').text() != '' && $(this).find('phone').text() != null) ? '<abbr title="Phone">P:</abbr> '+ $(this).find('phone').text() + '<br/>' : '')+''
														).append(
															(($(this).find('ttyPhone').text() != '' && $(this).find('ttyPhone').text() != null) ? '<abbr title="ttyPhone">T:</abbr> '+ $(this).find('ttyPhone').text() + '<br/>' : '')+''
														)
													));
												}
												if(($(this).find('latitude').text() != '' && $(this).find('latitude ').text() != null) &&
													($().find('longitude').text() != '' && $(this).find('longitude ').text() != null)){
													activeMarkers[$(this).find('siteId').text()] = {
														latLng: [$(this).find('latitude').text(), $(this).find('longitude').text()]
													}
													$(locDiv).append(
														$('<div>').append(
															$('<strong>').append('Latitude: ')
														).append(
															$(this).find('latitude').text()+"<br/>"
														).append(
															$('<strong>').append('Longitude: ')
														).append(
															$(this).find('longitude').text()
														)
													)
												}
												$(locationsDiv).append(locDiv);
											})
											$(left).append(select).append(locationsDiv);

											var right = $('<div>').addClass('col-sm-6');
											$(right).append($('<div id="gmap"></div>'))
											$(row).append(left).append(right);
											$(toReturn).append(row);
											$('#display-modal-body').on( "tabsactivate", function( event, ui ) {
												$(select).change();
											});
											console.log(activeMarkers);
										}
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
								if($(data).find('fName')){
									console.log('asdf')
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
													$('#search-state').parent().tooltip('State').end().change(function(){
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

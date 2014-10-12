$().ready(function(){
  //now what?
	/*if they enter an orgId (we will get it next class through a search), we need to find:
		-What different areas of information the organization has (/Application/Tabs?orgId=x)
		-then, find each area on demand (each will need it's own call)
			General
				Path: ...ESD/{orgId}/General
			Locations
				Path: ...ESD/{orgId}/Locations
			Treatment
				Path: ...ESD/{orgId}/Treatments
			Training
				Path: ...ESD/{orgId}/Training
			Facilities
				Path: ...ESD/{orgId}/Facilities
			Equipment
				Path: ...ESD/{orgId}/Equipment
			Physicians
				Path: ...ESD/{orgId}/Physicians
			People
				Path: ...ESD/{orgId}/People
	*/

	/*
		getTabs - go out and get the names and number of tabs that I need to build!
			arg - orgId holds the organizational id of the org I want to know the tabs for
	*/
	function getTabs(orgId){
		//http://simon.ist.rit.edu:8080/Services/resources/ESD/Application/Tabs?orgId=1002
		$.ajax({
			type:'get',
			url:'proxy.php',
			dataType:'xml',
			data:{path:'/Application/Tabs?orgId='+orgId},
			success: function(data){
				//<data><row><Tab>General</Tab></row><row><Tab>Locations</Tab></row><row><Tab>Treatment</Tab></row><row><Tab>Training</Tab></row><row><Tab>Equipment</Tab></row><row><Tab>People</Tab></row></data>
				//build a select menu (you can't do this for your project, you must have tabs - but this will get you most of the way)
				var x='<select onchange="window[\'get\'+$(this).val()]('+orgId+')">';
				$('Tab',data).each(function(){
					//output the options
					x+='<option value="'+$(this).text()+'">'+$(this).text()+'</option>';
				});
				$('#dump').html(x+'</select>');
				getGeneral(orgId);
			},
			error:err
		});
	}

  function err(event){
    console.log(event);
  }


  function getGeneral(id){
    $.ajax({
      type:'get',
      url:'proxy.php',
      dataType:'xml',
      data:{path:'/'+id+'/General'},
      success: function(data){
        var x='<tr><td>Name:</td><td>'+$(data).find('name').text()+'</td></tr>';
        x+='<tr><td>Description</td><td>'+$(data).find('description').text()+'</td></tr>';
        x+='<tr><td>Email:</td><td>'+$(data).find('email').text()+'</td></tr>';
        x+='<tr><td>Website:</td><td>'+$(data).find('website').text()+'</td></tr>';
        x+='<tr><td>Number of Members:</td><td>'+$(data).find('nummembers').text()+'</td></tr>';
        x+='<tr><td>Number of Calls:</td><td>'+$(data).find('numcalls').text()+'</td></tr>';
        $('#output').html(x);
      },
      error:err
    });
  }

  function getLocations(id){
    alert('get locations for '+id);
  }

  function getFacilities(id){
    alert('get fac for '+id);
  }

  function getPeople(id){
    alert('get peps for '+id);
  }
})

  /*
    Written by Brett Casswell
    http://stackoverflow.com/questions/597268/element-prototype-in-ie7

    puts the prototype elements on everything
  */

if ( !window.Element )
{
    Element = function(){};

    var __createElement = document.createElement;
    document.createElement = function(tagName)
    {
        var element = __createElement(tagName);
        if (element == null) {return null;}
        for(var key in Element.prototype)
                element[key] = Element.prototype[key];
        return element;
    }

    var __getElementById = document.getElementById;
    document.getElementById = function(id)
    {
        var element = __getElementById(id);
        if (element == null) {return null;}
        for(var key in Element.prototype)
                element[key] = Element.prototype[key];
        return element;
    }
}

  //fixing IE8 isue with Object.keys
  if (!Object.keys) {
    Object.keys = function(obj) {
      var keys = [];
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          keys.push(i);
        }
      }
      return keys;
    };
  }

  // Prototype
  Object.prototype.bindEvent = function(type, foo, flag){
    if (this.addEventListener){
      this.addEventListener(type, foo, flag);
    } else if (this.attachEvent){
      this.attachEvent('on'+type, function(){foo()});
    }
  }
  // Shortcuts
  var $, _, __;

  // getElementById shortcut
  // swaps things based on #
  $ = function (input,which){
    if(input.charAt(0) == '#'){
      var id = input.substring(1,input.length)
      return document.getElementById(id);
    }
    else{
      if(which){
        return document.getElementsByTagName(input)[which];
      }
      else{
        return document.getElementsByTagName(input);
      }
    }
  }

  // createElement shortcut
  // can pass in an array of attributes
  _ = function (tag, attributes){
    var ele = document.createElement(tag);
    if(attributes){
      for(var i = 0, l = attributes.length; i < l; i ++){
        ele.setAttribute(attributes[i][0],attributes[i][1]);
      }
    }
    return ele;
  }

  //shortcut to create text node
  __ = function(text){
    return document.createTextNode(text);
  }



  // variables
  var jsonData, activeDatasetName, activeDataset, form, ie7;

  //checks for ie7
  ie7 = false;
  if(document.all && !document.querySelector){
    ie7 = true;
  }

  // functions

  var createForm, getData, startUp, setUp, createSection, createSelect, selectChange, generateNav, anchorClick, print, getSelected, reset, clear, save, clearHistory, bindEvent;

  // builds the content for the page
  build = function(){
    //get body
    var body = $('body','0');
    //create the header tag
    var header = _('header');
    //create the nav tag
    var nav = _('nav',[['id','nav']]);
    //create a span to hold the title of the page
    var span = _('span');
    span.appendChild(__('Data Sets'));
    nav.appendChild(span);
    header.appendChild(nav);
    body.appendChild(header);

    var main = _('main');
    var h1 = _('h1',[['id','category']]);
    var form = _('form');

    var b1 = _('button');
    b1.appendChild(__('Reset'));
    b1.bindEvent('click',reset,false);

    var b2 = _('button');
    b2.appendChild(__('Print'));
    b2.bindEvent('click',print);

    var b3 = _('button');
    b3.appendChild(__('Save'));
    b3.bindEvent('click',save);

    var b4 = _('button');
    b4.appendChild(__('Clear Saved History'));
    b4.bindEvent('click',clearHistory);
    b4.bindEvent('click',reset);

    var output = _('span',[['id','output']]);

    main.appendChild(h1);
    main.appendChild(form);
    main.appendChild(b1);
    main.appendChild(b2);
    main.appendChild(b3);
    main.appendChild(b4);
    main.appendChild(output);

    main.appendChild(createContact());
    body.appendChild(main);
    getData();
    document.close();

  }

  //gets the json data via ajax
  getData = function(){
    var request, response;
    request = new XMLHttpRequest();
    request.open( "GET", "./data2.json", true );
    request.setRequestHeader("Content-type", "application/json");

    request.onreadystatechange = function(){
      if( request.readyState == 4 && request.status == 200 ){
        jsonData = JSON.parse( request.responseText );
        startUp();
      }
    }
    request.send();
  }

  //starts the build process
  startUp = function(){
    activeDatasetName = Object.keys(jsonData)[0];
    form = document.forms[0];
    generateNav();

    //sets things up based on the storagetype
    if(!ie7){
      setUp(localStorage);
    }
    else{
      var data = {};
      data.state = GetCookie('state');
      data.dataset = GetCookie('dataset')
      console.log(data);
      setUp(data);
    }
  }

  //generates the navbar based on the datasets
  generateNav = function(){
    var keys, nav;
    keys = Object.keys(jsonData);
    nav = $("#nav");
    for(var i=0, l=keys.length; i < l; i++){
      var key, anchor;
      key = keys[i];
      anchor = _('a',[["id",key]]);
      if(!ie7){
        anchor.bindEvent('click', anchorClick);
      }
      else{
        anchor.bindEvent('click', function(){anchorClick(key)});
      }


      anchor.appendChild(__(jsonData[key].text));
      nav.appendChild(anchor);
    }
  }

  //sets up the form
  setUp = function(data){
    if(data && data.dataset){
      activeDatasetName = data.dataset;
    }
    var initial, category;

    while(form.firstChild){
      form.removeChild(form.firstChild);
    }

    activeDataset = jsonData[activeDatasetName];
    $("#"+activeDatasetName).setAttribute((ie7 ? 'className' :'class'),'active');

    initial = createSection(activeDataset);
    form.appendChild(initial);

    if(data && data.state){

      state = JSON.parse(data.state);

      form.firstChild.getElementsByTagName('select')[0].value = state[0];
      var tempDataset = activeDataset;
      for(var i = 0, l = state.length-1; i < l; i++){
        var child = createSection(tempDataset.answers[state[i]]);
        child.getElementsByTagName('select')[0].value = state[i+1];
        form.appendChild(child);
        tempDataset = tempDataset.answers[state[i]];
      }
      print();
    }

    var category = $('#category')
    clear($('#category'));
    category.appendChild(__(jsonData[activeDatasetName].text));
  }

  //creates a section that holds the question and select options
  createSection = function(data){
    var section, question, select;

    section = _('section');

    question = _('span');
    question.appendChild(__(data.question));
    section.appendChild(question);

    select = createSelect(data.answers);
    section.appendChild(select);

    return section;
  }

  //builds a selsect based off of data sebmitted
  createSelect = function(data){
    var element = _('select');
    element.bindEvent('change',function(){selectChange(this)});
    var firstChild =  _("option",[["value",""],["disabled", true],["selected", true],["hidden", true]]);
    firstChild.appendChild(__("Choose an Option"));
    element.appendChild(firstChild);
    var keys = Object.keys(data);
    for(var i=0, l=keys.length; i < l; i++){
      var key = keys[i];
      var child = _('option',[['value',key]]);
      child.appendChild(__(data[key].text));
      element.appendChild(child);
    }
    return element;
  }

  //the function to be called on select change
  selectChange = function(cur){
    var output = $('#output');
    if(cur.parentNode){
      while(cur.parentNode.nextSibling){
        cur.parentNode.parentNode.removeChild(cur.parentNode.nextSibling)
        clear($('#output'));
      }
    }
    else{
      while(cur.parent.nextSibling){
        cur.parentNode.parent.removeChild(cur.parent.nextSibling)
        clear($('#output'));
      }
    }

    var currentData = activeDataset;
    var values = getSelectedValues();
    for(var i = 0, l = values.length; i < l; i++){
      currentData = currentData.answers[values[i]];
    }
    if(currentData.answers){
      var nextChild = createSection(currentData);
    }
    else{
      print();
    }
    if(nextChild){
      form.appendChild(nextChild);
    }

  }

  // what is called when one of the anchor elements in the head is called
  anchorClick = function(id){
    if(this.id != activeDatasetName){
      var nav = $("#nav");
      var anchors = nav.getElementsByTagName('a');
      for(var i = 0, l=anchors.length; i < l; i++){
        anchors[i].setAttribute('class','');
      }
      activeDatasetName = this.id;
      clear($('#output'));
      setUp();
    }
  }

  //prints the dataset, called at the end of data OR when the print button is pressed
  print = function(){
    var values = getSelectedValues();
    if(values.length){
      var printTable = _('table');
      var tableHead = _('thead');

      var tableHeadRow = _('tr');

      var tableHead1 = _('th')
      tableHead1.appendChild(__('Question'));

      var tableHead2 = _('th')
      tableHead2.appendChild(__('Response'));

      tableHeadRow.appendChild(tableHead1);
      tableHeadRow.appendChild(tableHead2);

      tableHead.appendChild(tableHeadRow);

      var tableBody = _('tbody');
      var currentData = activeDataset;
      for(var i = 0, l = values.length; i < l; i++){
        tableBody.appendChild(createRow([currentData.question, currentData.answers[values[i]].text]))
        currentData = currentData.answers[values[i]];
      }

      clear($('#output'));
      printTable.appendChild(tableHead);
      printTable.appendChild(tableBody);
      output.appendChild(printTable);
    }
  }
  //empties and element
  clear = function(ele){
    while(ele.firstChild){
      ele.removeChild(ele.firstChild)
    }
  }

  //creates a row for a table based off of data submitted
  createRow = function(data){
    var row = _('tr');
    for(var i = 0, l = data.length; i < l; i++){
      var cell = _('td');
      cell.appendChild(__(data[i]));
      row.appendChild(cell);
    }
    return row;
  }
  //gets the selected values for the data and returns it as a
  getSelectedValues = function(){
    var selected, toReturn = [];
    selected  = form.getElementsByTagName("select");
    for(var i = 0, l = selected.length; i < l; i++){
      var val =selected[i].options[selected[i].selectedIndex].value;
      if(val){
        toReturn.push(val);
      }
    }
    return toReturn;
  }
  getSelectedText = function(){
    var selected, toReturn = [];
    selected  = form.getElementsByTagName("select");
    for(var i = 0, l = selected.length; i < l; i++){
      var val =selected[i].options[selected[i].selectedIndex].value;
      var text = selected[i].options[selected[i].selectedIndex].textContent;
      if(val){
        toReturn.push(text);
      }
    }
    return toReturn;
  }
  //resets the page
  reset = function(){
    clear($('#output'));
    setUp();
  }

  //creates the contact form
  createContact = function(){
    var formDiv = _('div',[['id','contactFormDiv']]);
    var formTitle = _('h2');
    formTitle.appendChild(__('Contact Form'));
    formDiv.appendChild(formTitle);
    var form = _('form',[['id','contactForm']]);


    //Name
    var nameGroup =_('div',[['class','form-group']]);
    var nameLabel = _('label',[['for','form-name']]);
    nameLabel.appendChild(__('Name: '));
    var nameInput = _('input',[['type','text'],['name','name'],['id','form-name']]);
    nameInput.bindEvent('change',validateName);
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);

    //email
    var emailGroup =_('div',[['class','form-group']]);
    var emailLabel = _('label',[['for','form-email']]);
    emailLabel.appendChild(__('Email: '));
    var emailInput = _('input',[['type','email'],['name','email'],['id','form-email']]);
    emailInput.bindEvent('change',validateEmail);
    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);
    form.appendChild(emailGroup);

    //comment
    var commentGroup =_('div',[['class','form-group']]);
    var commentLabel = _('label',[['for','form-comment']]);
    commentLabel.appendChild(__('Comment: '));
    var commentInput = _('textarea',[['name','comment'],['id','form-comment']]);
    commentGroup.appendChild(commentLabel);
    commentGroup.appendChild(commentInput);
    form.appendChild(commentGroup);


    var submit = _('input',[['type','submit']]);
    form.appendChild(submit);

    form.bindEvent('submit',submitContact);
    formDiv.appendChild(form);
    return formDiv;
  }

  //validates the name

  validateName = function(){
    var name = $('#form-name').value;
    if(name =='' || name == undefined){
      $('#form-name').style.backgroundColor = '#A10E0E';
      return false;
    }
    else{
      $('#form-name').style.backgroundColor = '#2AA198';
      return true;
    }
  }

  //validates the email

  validateEmail = function(){
    var email = $('#form-email').value;
    if(email.match(/.*@.*\..*/)){
      $('#form-email').style.backgroundColor = '#2AA198';
      return true;
    }
    else{
      $('#form-email').style.backgroundColor = '#A10E0E';
      return false;
    }
  }

  submitContact = function(event){
    event.preventDefault();
    var valid = true
    if(!validateEmail()){
      valid = false;
    }
    if(!validateName()){
      valid = false;
    }
    if(valid){
      $('#contactForm').reset()
      $('#form-email').style.backgroundColor = '';
      $('#form-name').style.backgroundColor = '';
    }
  }


  //swaps the save and clear history functions based on the version
  if(!ie7){
    save = function(){
      localStorage.setItem('dataset',activeDatasetName);
      localStorage.setItem('state',JSON.stringify(getSelectedValues()));
    }
    clearHistory = function(){
      localStorage.clear();
    }
  }
  else{
    save = function(){
      SetCookie('dataset',activeDatasetName);
      SetCookie('state',JSON.stringify(getSelectedValues()));
    }
    clearHistory = function(){
      DeleteCookie('dataset');
      DeleteCookie('state');
    }
  }

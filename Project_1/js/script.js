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
    } else if (anchor.attachEvent){
      anchor.attachEvent('onclick', anchorClick);
    }
  }

  // Shortcuts
  var $, _, __;

  // getElementById shortcut
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

  //createElement shortcut
  _ = function (tag, attributes){
    var ele = document.createElement(tag);
    if(attributes){
      for(var i = 0, l = attributes.length; i < l; i ++){
        ele.setAttribute(attributes[i][0],attributes[i][1]);
      }
    }
    return ele;
  }

  __ = function(text){
    return document.createTextNode(text);
  }



  // variables
  var jsonData, activeDatasetName, activeDataset, form, ie7;

  ie7 = false;
  if(document.all && !document.querySelector){
    ie7 = true;
  }

  // functions

  var getData, startUp, setUp, createSection, createSelect, selectChange, generateNav, anchorClick, print, getSelected, reset, clear, save, clearHistory, bindEvent;

  build = function(){
    var body = $('body','0');
    var header = _('header');
    var nav = _('nav',[['id','nav']]);
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
    b3.addEventListener('click',save);

    var b4 = _('button');
    b4.appendChild(__('Clear Saved History'));
    b4.addEventListener('click',clearHistory);
    b4.addEventListener('click',reset);

    var output = _('span',[['id','output']]);

    main.appendChild(h1);
    main.appendChild(form);
    main.appendChild(b1);
    main.appendChild(b2);
    main.appendChild(b3);
    main.appendChild(b4);
    main.appendChild(output);

    body.appendChild(main);
    getData();
    document.close();

  }

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

  startUp = function(){
    activeDatasetName = Object.keys(jsonData)[0];
    form = document.forms[0];
    generateNav();
    setUp(localStorage);
  }
  generateNav = function(){
    var keys, nav;
    keys = Object.keys(jsonData);
    nav = $("#nav");
    for(var i=0, l=keys.length; i < l; i++){
      var key, anchor;
      key = keys[i];
      anchor = _('a',[["id",key]]);
      if (anchor.addEventListener){
        anchor.addEventListener('click', anchorClick, false);
      } else if (anchor.attachEvent){
        anchor.attachEvent('onclick', anchorClick);
      }
      anchor.appendChild(__(jsonData[key].text));
      nav.appendChild(anchor);
    }
  }

  setUp = function(data){
    if(data && data.dataset){
      activeDatasetName = data.dataset;
    }
    var initial, category;

    while(form.firstChild){
      form.removeChild(form.firstChild);
    }

    activeDataset = jsonData[activeDatasetName];
    $("#"+activeDatasetName).setAttribute('class','active');

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

  createSelect = function(data){
    var element = _('select',[['onchange','selectChange(this)']]);
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
  selectChange = function(cur){
    var output = $('#output');
    while(cur.parentNode.nextSibling){
      cur.parentNode.parentNode.removeChild(cur.parentNode.nextSibling)
      clear($('#output'));
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

  anchorClick = function(){
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
  clear = function(ele){
    while(ele.firstChild){
      ele.removeChild(ele.firstChild)
    }
  }
  createRow = function(data){
    var row = _('tr');
    for(var i = 0, l = data.length; i < l; i++){
      var cell = _('td');
      cell.appendChild(__(data[i]));
      row.appendChild(cell);
    }
    return row;
  }

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
  reset = function(){
    clear($('#output'));
    setUp();
  }

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
    console.log("IE 7");
  }

  build();

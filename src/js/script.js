/**
 * Returns data from db.json as an array for use
 *
 * @returns {*} 
 */
function getCodes () {
  /** @type {string} */
  var url = `file:///src/db.json`;
  // var url = `file:///resources/app/src/db.json`;

  var info = {"Data":{
    "repeatable": [],
    "oneTime": []
  }};

  /** @type {*} */
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status === 200) {
      var data = JSON.parse(request.responseText);
      for (var i = 0; i <data.Data.oneTime.length; i++) {
        info.Data.oneTime.push(data.Data.oneTime[i])
      }
      for (var i = 0; i <data.Data.repeatable.length; i++) {
        info.Data.repeatable.push(data.Data.repeatable[i])
      }
    }
  }
  request.send();
  return info;
}



/**
 * Inserts a new Node (newNode) before another node (referenceNode)
 *
 * @param {Object} newNode - Node to be added
 * @param {Object} referenceNode - Node to be inserted before
 */
function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}



/**
 * Add a new line for rental information to the input form
 *
 * @param {string} chargeType - type of line to be added
 */
function addRentalRow(chargeType) {
  var adder;
  var type;
  var description;
  switch (chargeType) {
    case 'repeatable':
      added_rows_repeatable++;
      adder = added_rows_repeatable;
      type = 'rep';
      description = 'Repeatable';
      repeatable = true;
      break;
    case 'single':
      added_rows_one_time++;
      adder = added_rows_one_time;
      type = 'one_time';
      description = 'One Time';
      repeatable = false;
      break;
    default:
      break;
  }
  var row = document.createElement('tr');
  Object.assign(row, {
    id:        `${type}_charge_row_${adder}`,
    className: `${type}`
  })

  var descriptionInput = document.createElement('input');
  Object.assign(descriptionInput, {
    id:        `${type}_charge_${adder}`,
    className: `${type} description`,
    name:      `${description} Charge ${adder}`
  })
  descriptionInput.setAttribute('list',`${type}_charge_${adder}_options`);

  var datalist = document.createElement('datalist');
  Object.assign(datalist, {
    id: `${type}_charge_${adder}_options`
  })

  var price_entry = document.createElement('input');
  Object.assign(price_entry, {
    id:          `${type}_charge_${adder}_price`,
    className:   `${type} price`,
    placeholder: 'Price'
  })

  var deleteButton = document.createElement('button');
  Object.assign(deleteButton, {
    id:        `${type}_charge_${adder}_delete`,
    className: `${type} delete`,
    type:      'button',
    innerHTML: 'X'
  })
  deleteButton.setAttribute('onclick',`javascript: deleteRow('${row.id}');`);

  row.insertCell(0)

  var cell1 = row.insertCell(1)
  cell1.appendChild(descriptionInput)
  cell1.appendChild(datalist)

  var cell2 = row.insertCell(2)
  cell2.appendChild(price_entry)

  var cell3 = row.insertCell(3)
  cell3.appendChild(deleteButton)

  insertAfter(row, document.getElementById(`${type}_charge_row_${adder - 1}`))
  populateDatalist(descriptionInput, repeatable)
}



/**
 * Pulls a list of charges on the input form
 *
 * @param {*} type - (rep/one_time) what type of line to pull
 * @return {object} contains the description code and price of each line
 */
function getLines (type) {
  var getLines = $(`tr.${type}`).map(function () {
    var description = $(this).find('.description').val()
    return {
      'description': description.split(' - ')[0],
      'value': description.split(' - ')[1],
      'price': $(this).find('.price').val()
    }
  }).get()
  return getLines
}



/**
 * Takes all info from the input form and creates the upload table, tied to button on html
 *
 */
function createUpload () {
  $('#rental').toggle()

  var items = {'repeatable':getLines('rep'), 'oneTime':getLines('one_time')}
  var job_num = $('#job_num').val()
  var startDate = $('#start_date').val()
  var duration = $('#duration').val()
  var rentalLength = parseInt($('input[name="rental length"]:checked').val());
  var taxCode = $('#tax_code').val()

  items.repeatable.forEach(element => {
    addLineToUpload(element,job_num,startDate,0,rentalLength,taxCode,true)
  });
  items.oneTime.forEach(element => {
    addLineToUpload(element,job_num,startDate,0,rentalLength,taxCode)
  });
  if (duration > 1) {
    for (let month = 1; month < duration; month++) {
      items.repeatable.forEach(element => {
        addLineToUpload(element,job_num,startDate,month,rentalLength,taxCode,true)
      });
    }
  }
}



/**
 * Pads a number with leading zeros
 *
 * @param {number} num - the number to be padded
 * @param {number} size - the length of the number to be returned
 * @return {string} - the initial number with enough leading zeros to be the size provided
 */
function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}



/**
 * Called by the create upload function to add the individual lines
 *
 * @param {object} dataObject
 * @param {string} jobNumber
 * @param {Date} startDate
 * @param {number} monthTick
 * @param {number} rentalLength
 * @param {boolean} repeatable
 */
function addLineToUpload (dataObject, jobNumber, startDate, monthTick, rentalLength, taxCode, repeatable) {
  var row = document.createElement('tr')
  var descriptionWithDuration

  if (repeatable) {
    var date1 = new Date(`${startDate} 00:00`);
    var year = date1.getFullYear();
    var month = date1.getMonth();
    var day = date1.getDate();
    date1.setDate(day + (monthTick * rentalLength))
    var date2 = new Date(year,month,day + ((monthTick + 1) * rentalLength));
    descriptionWithDuration = `
      ${dataObject.description} -
      ${date1.getFullYear()}/${pad(date1.getMonth() + 1,2)}/${pad(date1.getDate(),2)} -
      ${date2.getFullYear()}/${pad(date2.getMonth() + 1,2)}/${pad(date2.getDate(),2)}`
  } else descriptionWithDuration = dataObject.description

  var holder = row.insertCell(0)
  holder.innerHTML = `&nbsp;`
  var addedLineType = row.insertCell(1)
  addedLineType.innerHTML = 'C'
  var plantItem = row.insertCell(2)
  plantItem.innerHTML = 'N'
  var job = row.insertCell(3)
  job.innerHTML = jobNumber
  var code = row.insertCell(4)
  code.innerHTML = dataObject.value
  var description = row.insertCell(5)
  description.innerHTML = descriptionWithDuration
  var wbsCode = row.insertCell(6)
  wbsCode.innerHTML = '0A-00-'
  var quantity = row.insertCell(7)
  quantity.innerHTML = 1
  var un = row.insertCell(8)
  un.innerHTML = 'EA'
  var price = row.insertCell(9)
  price.innerHTML = dataObject.price
  var per = row.insertCell(10)
  per.innerHTML = 'EA'
  row.insertCell(11).innerHTML = `&nbsp;`
  row.insertCell(12).innerHTML = `&nbsp;`
  var taxCodeCell = row.insertCell(13)
  taxCodeCell.innerHTML = taxCode
  row.insertCell(14).innerHTML = `&nbsp;`
  row.insertCell(15).innerHTML = `&nbsp;`
  var pol_chgovd = row.insertCell(16)
  pol_chgovd.innerHTML = 'no'
  var tx = row.insertCell(17)
  tx.innerHTML = 'no'
  var pol_taxovr = row.insertCell(18)
  pol_taxovr.innerHTML = 'yes'
  row.insertCell(19).innerHTML = `&nbsp;`
  row.insertCell(20).innerHTML = `&nbsp;`
  row.insertCell(21).innerHTML = `&nbsp;`
  row.insertCell(22).innerHTML = `&nbsp;`
  row.insertCell(23).innerHTML = `&nbsp;`
  row.insertCell(24).innerHTML = `&nbsp;`
  row.insertCell(25).innerHTML = `&nbsp;`
  row.insertCell(26).innerHTML = `&nbsp;`
  row.insertCell(27).innerHTML = `&nbsp;`
  row.insertCell(28).innerHTML = `&nbsp;`
  row.insertCell(29).innerHTML = `&nbsp;`
  row.insertCell(30).innerHTML = `&nbsp;`
  var dueDate = row.insertCell(31)
  dueDate.innerHTML = new Date().toLocaleDateString()
  row.insertCell(32).innerHTML = `&nbsp;`
  row.insertCell(33).innerHTML = `&nbsp;`
  row.insertCell(34).innerHTML = `&nbsp;`
  var costType = row.insertCell(35)
  costType.innerHTML = '400E'
  var costCategory = row.insertCell(36)
  costCategory.innerHTML = 'E'
  var polFactor = row.insertCell(37)
  polFactor.innerHTML = 1
  row.insertCell(38).innerHTML = `&nbsp;`
  row.insertCell(39).innerHTML = `&nbsp;`

  document.getElementById('rental-body').appendChild(row)
}



function deleteRow(id) {
  var row = document.getElementById(id)
  row.remove()
}



function selectElementContents(el) {
  var body = document.body, range, sel;
  if (document.createRange && window.getSelection) {
      range = document.createRange();
      sel = window.getSelection();
      sel.removeAllRanges();
      try {
          range.selectNodeContents(el);
          sel.addRange(range);
      } catch (e) {
          range.selectNode(el);
          sel.addRange(range);
      }
  } else if (body.createTextRange) {
      range = body.createTextRange();
      range.moveToElementText(el);
      range.select();
      document.execCommand("copy");
  }
  document.execCommand("copy");
}

function populateDatalist(input, repeatable) {
  var datalist = input.nextElementSibling;
  var arrayOfCharges = repeatable ? mainData.Data.repeatable : mainData.Data.oneTime;
  for (let i = 0; i < arrayOfCharges.length; i++) {
    var option = document.createElement('option');
    option.value = arrayOfCharges[i].Description + ' - ' + arrayOfCharges[i].tsv_code
    datalist.appendChild(option)
  }
}


var added_rows_repeatable = 1;
var added_rows_one_time = 1;
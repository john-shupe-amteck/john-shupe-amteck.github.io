function searchableSelect(input, repeatable) {
  var div = input.nextElementSibling;  
  var text = input.value
  div.innerHTML = ''
  if (input.value != '') {
    var arrayOfCharges = repeatable ? mainData.Data.repeatable : mainData.Data.oneTime;
    for (let i = 0; i < arrayOfCharges.length; i++) {
      var upper = arrayOfCharges[i].Description.toUpperCase()
      if (upper.includes(text.toUpperCase())) {
        var option = document.createElement('div')
        Object.assign(option, {
          innerHTML: arrayOfCharges[i].Description,
          className: 'search-option',
          id:        arrayOfCharges[i].tsv_code
        })
        option.setAttribute('onclick',`javascript: setValue(this);`);
        input.nextElementSibling.append(option)
      }
    }    
    $(div).show();    
  } else {
    $(div).hide();
  }
}


function setValue(node) {
  var descriptionInput = node.parentNode.previousElementSibling;
  var codeInput = node.parentNode.nextElementSibling;
  descriptionInput.value = node.innerHTML;
  codeInput.value = node.id;
  $(node.parentNode).hide();
  if (codeInput.value == 'MISC-E') {
    var miscDescription = document.createElement('input');
    miscDescription.classList = 'misc-description'
    insertAfter(miscDescription,codeInput)
  }
}

$('input#description').on(events, function () {
  
});
console.log('DOMContentLoaded');
const divlist = document.querySelector('#div-list');
const addForm = document.forms['add-ticker'];
const inputField = addForm.querySelector('input[type="text"]');
const loadBtn = document.querySelector('#load');
const deleteOnExit = [];

loadBtn.addEventListener('click', () =>{
    renderList();
});

// renderList from JSON;
const renderList = async () => {
    console.log('in renderList...');
    let uri = 'http://localhost:3000/tickers';

    const res = await fetch(uri);
    const tickers = await res.json();
    
    let rowTemplate = '';
    tickers.forEach(ticker => {
        if (ticker.snooze==""){thisRowsClassList="row"}
        else{thisRowsClassList="row rowHidden"}
        if (ticker.flag==""){thisFlagsClassList="flag"}
        else{thisFlagsClassList="flag flagOn"}

        rowTemplate += `
        <div id=${ticker.id} class="${thisRowsClassList}">
            <span class="left">
                <span class="delTicker">&#x2716;</span>
                <span class="snooze">snooze</span>
                <span class="${thisFlagsClassList}">flag</span>
            </span>
            <span class="right">${ticker.tickerSymbol}</span>
        </div>
        `
    });
    divlist.innerHTML = rowTemplate;
    
    inputField.select();
}

// Adding new row to DOC
const addToDoc = async (value) => {
    // create elements
    const row = document.createElement('div');
    const left = document.createElement('span');
    const right = document.createElement('span');

    const delTicker = document.createElement('span');
    const snooze = document.createElement('span');
    const flag = document.createElement('span');
    // const ticker = document.createElement('span');
    
    // set content
    delTicker.textContent = "\u2716";
    snooze.textContent = 'snooze';
    flag.textContent = 'flag';
    // ticker.textContent = value.toUpperCase();
    right.textContent = value.toUpperCase();

    // append child items
    left.appendChild(delTicker);
    left.appendChild(snooze);
    left.appendChild(flag);
    row.appendChild(left);
    row.appendChild(right);
    divlist.appendChild(row);

    // add classes
    row.classList.add('row');
    left.classList.add('left');
    right.classList.add('right');
    delTicker.classList.add('delTicker');
    snooze.classList.add('snooze');
    flag.classList.add('flag');
}

// check DOC for duplicates
function DivListHasValue(divlist, value) {
    if (divlist != null) {
        // needs to be array of innerHTML, not spans themselves
        var arrTickers = [];
        let tickers = divlist.getElementsByClassName('right');
        [].forEach.call(tickers, function (item) {
            arrTickers.push(item.innerHTML);
        });
        return (arrTickers.indexOf(value.toUpperCase()) > -1);
    } else {
        return false;
    }
}

function addBusinessDays(d,n) {
    // this should be adding days to the timestamp value and not current date
    console.log('d='+d);
    d.setDate(d.getDate() + (7*Math.floor(n/5)) + (n % 5));
    var yyyymmdd = d.toISOString().toString().split('T')[0].replace(/-/g,'');   
    return yyyymmdd;
}

// SUBMIT - ADD TICKER (& ROW) TO DOC
addForm.addEventListener('submit', function(e){
    e.preventDefault();
    const inputField = addForm.querySelector('input[type="text"]');
    const value = inputField.value.toUpperCase();
    console.log(value + ' submitted');
    
    if(!(DivListHasValue(divlist, value))){
        console.log(value +  ' not in divlist. Adding to DOC');
        addToDoc(value);
        //TODO: x.classList.add('markAsNew'); ?     
    } 
    divlist.scrollTop = divlist.scrollHeight;
    inputField.select();
});

// call delete, update and new
document.body.addEventListener("unload", delItemsFromAPI => {
    // API DELETE
    delItemsFromAPI()
    // API
});

// DELETE
async function APIDeleteItems(){
    deleteOnExit.forEach(id => {
        let res = fetch('http://localhost:3000/tickers/' + id, { // await
            method: 'DELETE'
        });
    });   
}

// UPDATE
async function APIUpdateRowsWithId(){
    console.log('In APIUpdateRowsWithId');
    const rows = document.getElementsByClassName('row');
    console.log('rows with ids = '+ rows.length);
    Array.from(rows).forEach(row => {
        if(row.id){
            console.log('row id found: '+ row.id);
            let snooze = '';
            let snoozeContent = row.getElementsByClassName('snooze')[0].textContent;
            if (snoozeContent != 'snooze'){
                d = new Date();
                snooze = addBusinessDays(d, snoozeContent);
            }
            let flag = '';
            if (Array.from(row.getElementsByClassName('flag')[0].classList).indexOf('flagOn') != -1){
                flag = 'flagOn'
            }

            fetch('http://localhost:3000/tickers/' + row.id, {
                method: 'PATCH',
                body: JSON.stringify({
                    flag: flag,
                    snooze: snooze
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            });
        }
    });
}

// NEW
async function APIAdd(){
    console.log('In APIAdd');
    const rows = document.getElementsByClassName('row');
    Array.from(rows).forEach(row => {
        if(!row.id){
            console.log('row id not found in current row.');
            let snooze = '';
            let snoozeContent = row.getElementsByClassName('snooze')[0].textContent;
            if (snoozeContent != 'snooze'){
                d = new Date();
                snooze = addBusinessDays(d, snoozeContent);
            }

            let flag = '';
            if (Array.from(row.getElementsByClassName('flag')[0].classList).indexOf('flagOn') != -1){
                flag = 'flagOn'
            }
            let tickerSymbol = row.getElementsByClassName('right')[0].textContent;

            fetch('http://localhost:3000/tickers/', {
                method: 'POST',
                body: JSON.stringify({
                    tickerSymbol: tickerSymbol,
                    flag: flag,
                    snooze: snooze
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            });
        }
    });
}

// test button for unload
const btnUnload = document.getElementById('unload');
btnUnload.addEventListener('click', function(){
    APIDeleteItems();
    //updateRowsWithId();
});

// test button for update
const btnUpdate = document.getElementById('update');
btnUpdate.addEventListener('click', function(){
    APIUpdateRowsWithId();
});

// test button for new
const btnNew = document.getElementById('new');
btnNew.addEventListener('click', function(){
    APIAdd();
});


// click event for delete, snooze, flag, and select ticker
divlist.addEventListener('click',function(e){
    const tgt = e.target; // must define the const to get className, etc.
    const classClicked = tgt.className;
    let currentRow = '';
    if(classClicked == 'right'){
        currentRow = tgt.parentElement;
    } else {
        currentRow = tgt.parentElement.parentElement;
    }
    const tkr = currentRow.getElementsByClassName('right')[0];

    // DELETE CLICKED
    if (tgt.className == 'delTicker'){
        currentRow.parentElement.removeChild(currentRow);
        if(currentRow.id){
            console.log('row id = '+currentRow.id);
            deleteOnExit.push(currentRow.id);
            console.log('ids to delete = '+deleteOnExit)
        }
    } 
    // SNOOZE CLICKED
    else if (tgt.className == 'snooze') {
        var snoozeVal = prompt("Days to snooze", "");
        if (!(snoozeVal == null || snoozeVal == "")) {
            tgt.textContent = snoozeVal;
        }
        if (!(tgt.textContent == 'snooze')){
            tgt.classList.add('snoozeSet');
        }
    }
    // FLAG CLICKED
    else if (Array.from(tgt.classList).indexOf('flag') != -1) {
        console.log('a flag was clicked');
        if (Array.from(tgt.classList).indexOf('flagOn') != -1){
            console.log('flagOn is present. Removing...');
            tgt.classList.remove('flagOn');
        } else {
            console.log('flagOn is missing. Adding...');
            tgt.classList.add('flagOn');
        }
    }
    // RIGHT (TICKER SYMBOL) CLICKED
    else if (tgt.className == 'right') { // right is the span with ticker symbol
        console.log('right clicked, tkr = '+tkr.textContent);
        let allTickers = divlist.getElementsByClassName('right');
        Array.from(allTickers).forEach(ticker =>{
            ticker.classList.remove('rightSelected');
        });
        tgt.classList.add('rightSelected');
        let p2 = document.getElementById('p2');
        p2.textContent = tkr.textContent;
    }
});

// addToJSON(value);
const addToJSON = async (value) => {
    //alert('adding to json: ' + value);
    const doc = {
        tickerSymbol: value
    }
    await fetch('http://localhost:3000/tickers', {
        method: 'POST',
        body: JSON.stringify(doc),
        headers: {'Content-Type': 'application/json'}
    });
}

// change selection
/* divlist.addEventListener('click', (event) => {
    let eventTarget = event.target;
    console.log('divlist click event eventTarget='+eventTarget);
}); */





//renderList();

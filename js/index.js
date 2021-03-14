console.log('DOMContentLoaded');
const divlist = document.querySelector('#div-list');
const addForm = document.forms['add-ticker'];
const inputField = addForm.querySelector('input[type="text"]');

// renderList from JSON;
const renderList = async () => {
    console.log('in renderList...');
    let uri = 'http://localhost:3000/tickers';

    const res = await fetch(uri);
    const tickers = await res.json();
    console.log(tickers);

    let rowTemplate = '';
    tickers.forEach(ticker => {
        console.log(ticker.tickerSymbol);
        // if snooze <= today
        rowTemplate += `
        <div class="row">
            <span class="left">
                <span class="delTicker">&#x2716;</span>
                <span class="snooze">snooze</span>
                <span class="flag">flag</span>
            </span>
            <span id=${ticker.id} class="right">${ticker.tickerSymbol}</span>
        </div>
        `
    });
    divlist.innerHTML = rowTemplate;
    inputField.select();
}

// check for duplicates
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

// SUBMIT
addForm.addEventListener('submit', function(e){
    e.preventDefault();
    const inputField = addForm.querySelector('input[type="text"]');
    const value = inputField.value.toUpperCase();
    console.log(value + ' submitted');
    
    if(!(DivListHasValue(divlist, value))){
        console.log('not in divlist. Adding ' + value);
        addToJSON(value);
        //TODO: x.classList.add('markAsNew'); ?     
    } else {
        inputField.select();
    }
});

// add to json
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

//DELETE
async function delItemFromJSON(tkr){
    const id = tkr.id;
    const res = await fetch('http://localhost:3000/tickers/' + id, {
        method: 'DELETE'
    });   
}

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

    if (tgt.className == 'delTicker'){
        console.log('obj with delTicker class was clicked.')
        // delRowFromHTML(divlist, currentRow);
        delItemFromJSON(tkr);
    } else if (tgt.className == 'snooze') {
        alert('snooze for how many days?');
    }
    else if (tgt.className == 'flag') {
        //console.log('flag clicked, current row = '+currentRow.innerHTML);
        console.log('flag clicked, tkr = '+tkr.textContent);
    }
    else if (tgt.className == 'right') { // right is the span with ticker symbol
        //console.log('right clicked, current row = '+currentRow.innerHTML);
        console.log('right clicked, tkr = '+tkr.textContent);
        let p2 = document.getElementById('p2');
        p2.textContent = tkr.textContent;
        /* let rows = Array.from(divlist.children);
        console.log(rows.length);
        let myRowIdx = rows.indexOf(currentRow);
        console.log('myRowIdx= ' + myRowIdx); */
        /* const myRow = rows[myRowIdx];
        myRow.classList.add('rowSelect'); */
    }
});

renderList();

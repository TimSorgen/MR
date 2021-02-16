// Pass selected option on change
const selectElement = document.querySelector('.stockSelect');

selectElement.addEventListener('change', (event) => {
    const result = document.getElementById('p2');
    result.textContent = `You like ${event.target.value}`;
});

// Add ticker to watchlist
const form = document.querySelector('form');
const addTicker = async (e) => {
    e.preventDefault();

    const doc = {
        tickerSymbol: form.ticker.value
    }

    await fetch('http://localhost:3000/tickers', {
        method: 'POST',
        body: JSON.stringify(doc),
        headers: { 'content-Type': 'application/json' }
    });

    window.location.replace('/20210205.html');
}

form.addEventListener('submit', addTicker);

// JavaScript for populating the watchlist
const stockSelect = document.querySelector('.stockSelect');
const renderList = async () => {
    let uri = 'http://localhost:3000/tickers';

    const res = await fetch(uri);
    const tickers = await res.json();
    console.log(tickers);

    let selectTemplate = '';
    tickers.forEach(ticker => {
        selectTemplate += `
        <option value="${ticker.tickerSymbol}">${ticker.tickerSymbol}</option>
        `
    });
    stockSelect.innerHTML = selectTemplate;
    
}

window.addEventListener('DOMContentLoaded', () => renderList());

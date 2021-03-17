function yyyymmdd(date) {
    var date = new Date(date);
    return (date).toISOString().split('T')[0].replace(/-/g, '');
}

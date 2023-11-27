function convertDate(date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth() + 1).toString();
  var dd = date.getDate().toString();

  var mmChars = mm.split("");
  var ddChars = dd.split("");

  return (
    yyyy +
    "-" +
    (mmChars[1] ? mm : "0" + mmChars[0]) +
    "-" +
    (ddChars[1] ? dd : "0" + ddChars[0])
  );
}

function paginateArray(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

module.exports = { convertDate, paginateArray };

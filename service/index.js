const Kelas = require("../models/kelas");
const Ranking = require("../models/ranking");

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

async function countRanking(kelas) {
  await Ranking.find({
    kelas,
  }).deleteMany();

  const targetClass = await Kelas.findById(kelas);

  let userIds = [];

  for (var i = 0; i < targetClass.peserta.length; i++) {
    userIds.push(targetClass.peserta[i].user);
  }

  // let result = finishAt - startAt;

  // const hours = Math.floor(result / 3600);

  // const minutes = Math.floor(hours * 60);
  // const seconds = minutes % 60;

  // return res.json({
  //   unix1,
  //   unix2,
  //   result,
  //   duration: `${minutes}:${seconds}`,
  // });
}

function paginateArray(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

module.exports = { convertDate, countRanking, paginateArray };

const Kelas = require("../models/kelas");
const Ranking = require("../models/ranking");
const TestAnswer = require("../models/testAnswer");

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

async function countRanking(kelas, res) {
  try {
    await Ranking.find({
      kelas,
    }).deleteMany();

    const targetClass = await Kelas.findById(kelas);

    let userIds = [];
    let userData = [];

    for (var i = 0; i < targetClass.peserta.length; i++) {
      userIds.push(targetClass.peserta[i].user);
    }

    if (userIds.length > 0) {
      for (var i = 0; i < userIds.length; i++) {
        let nilai = 0;
        let startAt = 0;
        let finishAt = 0;

        const answers = await TestAnswer.find({
          user: userIds[i],
          $and: [
            {
              kelas,
            },
          ],
        });

        return res.json(answer);
        if (answers.length > 0) {
          for (var j = 0; j < answers.length; j++) {
            nilai = nilai + answers[j].nilai;
            startAt = startAt + answers[j].startAt;
            finishAt = finishAt + answers[j].finishAt;
          }

          nilai = Math.floor(nilai / answers.length);
          startAt = Math.floor(startAt / answers.length);
          finishAt = Math.floor(finishAt / answers.length);

          userData.push({
            user: userIds[i],
            nilai,
            startAt,
            finishAt,
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
    return res.json(error);
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

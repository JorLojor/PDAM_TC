const Kelas = require("../models/kelas");
const materi = require("../models/materi");
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

function converttoMinute(duration) {
  return Math.floor(duration / 60) + ":" + Math.floor(duration % 60);
}

function converttoSecond(finish, start) {
  var dateFinish = new Date(finish);
  var dateStart = new Date(start);

  const diffTime = Math.abs(dateFinish - dateStart);

  return diffTime;
}

async function countRanking(kelas) {
  try {
    await Ranking.find({
      kelas,
    }).deleteMany();

    const targetClass = await Kelas.findById(kelas);

    let rankingBox = [];
    let userIds = [];
    let userData = [];

    let len = 1;

    for (var i = 0; i < targetClass.peserta.length; i++) {
      userIds.push(targetClass.peserta[i].user);
    }

    let finishedTestCount = await TestAnswer.find({
      class: kelas,
    }).countDocuments();

    if (userIds.length > 0) {
      finishedTestCount = Math.floor(finishedTestCount / userIds.length);

      for (var i = 0; i < userIds.length; i++) {
        let nilai = 0;
        let duration = 0;

        const answers = await TestAnswer.find({
          user: userIds[i],
          $and: [
            {
              class: kelas,
            },
          ],
        });

        if (answers.length > 0 && finishedTestCount == answers.length) {
          len = answers.length;

          for (var j = 0; j < answers.length; j++) {
            nilai = nilai + answers[j].nilai;
            duration =
              duration +
              converttoSecond(answers[j].finishAt, answers[j].startAt);
          }

          nilai = Math.floor(nilai / answers.length);
          duration = Math.floor(duration / answers.length);

          userData.push({
            user: userIds[i],
            nilai,
            duration,
          });
        }
      }
    }

    if (userData.length > 0) {
      for (var i = 0; i < userData.length; i++) {
        const durasi = converttoMinute(userData[i].duration);

        rankingBox.push({
          user: userData[i].user,
          nilai: userData[i].nilai,
          durasi,
          duration: userData[i].duration,
        });
      }
    }

    rankingBox.sort((a, b) => {
      if (a.nilai !== b.nilai) {
        return b.nilai - a.nilai;
      } else {
        return a.duration - b.duration;
      }
    });

    for (var i = 0; i < rankingBox.length; i++) {
      await Ranking.create({
        user: rankingBox[i].user,
        kelas,
        ranking: i + 1,
        value: rankingBox[i].nilai,
        duration: rankingBox[i].durasi,
      });
    }

    return true;
  } catch (error) {
    console.error(error);
  }
}

async function getInstructorClass(user) {
  let ids = [];
  let materiIds = [];

  const materiData = await materi.find();

  for (let i = 0; i < materiData.length; i++) {
    for (let j = 0; j < materiData[i].instruktur.length; j++) {
      if (materiData[i].instruktur[j] == user) {
        materiIds.push(materiData[i]._id);
      }
    }
  }

  const kelas = await Kelas.find({
    materi: {
      $in: materiIds,
    },
  });

  for (let i = 0; i < kelas.length; i++) {
    ids.push(kelas[i]._id);
  }

  return ids;
}

function paginateArray(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

module.exports = {
  convertDate,
  converttoMinute,
  converttoSecond,
  countRanking,
  getInstructorClass,
  paginateArray,
};

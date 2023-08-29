const Test = require("../models/test");
const response = require("../respons/response");
const MateriModel = require("../models/materi");
const User = require("../models/user");
const testAnswer = require("../models/testAnswer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function calculateGrade(answerArray, maxGrade) {
  const booleanAnswers = answerArray.filter(
    (element) => typeof element === "boolean"
  );
  const correctCount = booleanAnswers.reduce((acc, currentValue) => {
    if (currentValue === true) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const percentageCorrect = (correctCount / booleanAnswers.length) * 100;
  const grade = (percentageCorrect / 100) * maxGrade;

  return Math.ceil(grade);
}

module.exports = {
  store: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let { data } = req.body;
      const { slug, title } = req.params;
      // data = data.replaceAll("'", '"')
      let imageTest = "/uploads/test-image/";
      const dataPertanyaan = JSON.parse(data);
      if (req.files.length > 0 || req.files != null) {
        imageTest = "/upload/" + req.files[0].path.split("/upload/").pop();
      }
      const questions = dataPertanyaan.questions.map((data) => {
        let path = null;
        if (data.img != null) {
          path = imageTest;
        }
        let answer = data.answer.map((answer) => {
          let pathAnswer = null;
          if (answer.img != null) {
            pathAnswer = imageTest;
          }
          return {
            value: answer.value,
            isTrue: answer.isTrue,
            img: pathAnswer,
          };
        });
        return {
          value: data.value,
          type: data.type,
          img: path,
          kode: makeid(8),
          answer,
        };
      });
      const post = {
        judul: dataPertanyaan.judul,
        type: dataPertanyaan.type,
        pembuat: dataPertanyaan.pembuat,
        question: questions,
      };
      const tests = new Test(post);
      tests.save({ session });
      if (dataPertanyaan.type == "pre") {
        await MateriModel.updateOne(
          { slug: slug },
          { $set: { "test.pre": tests._id } },
          { upsert: true, new: true, session }
        );
      } else if (dataPertanyaan.type == "post") {
        await MateriModel.updateOne(
          { slug: slug },
          { $set: { "test.post": tests._id } },
          { upsert: true, new: true, session }
        );
      }
      if (title != "null" && dataPertanyaan.type == "quiz") {
        await MateriModel.updateOne(
          { slug: slug, "items.title": title },
          { $set: { "items.$.quiz": tests._id } },
          { upsert: true, new: true, session }
        );
      }

      await session.commitTransaction();
      response(200, {}, "Test Berhasil di masukan", res);
    } catch (error) {
      response(500, error, error.message, res);
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  },

  getTest: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await TestModel.findById(id).populate("pembuat");

      if (!result) {
        response(404, id, "Test tidak di temukan", res);
      }

      response(200, result, "Test di dapat", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  getTestAnswer: async (req, res) => {
    try {
      const data = await testAnswer.find({}).populate("user").populate("test");

      if (!data) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      return response(200, data, "Data ditemukan", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  getTestAnswerFiltered: async (req, res) => {
    try {
      const data = await testAnswer
        .find({ ...req.body })
        .populate("user")
        .populate("test");

      if (!data) {
        return response(400, null, "Data tidak ditemukan", res);
      }

      return response(200, data, "Data ditemukan", res);
    } catch (error) {
      console.log(error);

      return response(500, error, "Server error", res);
    }
  },

  getQuiz: async (req, res) => {
    try {
      const { slug } = req.params;

      let materi = await MateriModel.findOne({ slug })
        .populate("items.quiz", "-question")
        .select("items.quiz items.title");

      materi = await User.populate(materi, {
        path: "items.quiz.pembuat",
        select: "name",
      });

      if (!materi) {
        response(404, id, "Test tidak di temukan", res);
      }

      response(200, materi, "Test di dapat", res);
    } catch (error) {
      response(500, error, "Server error", res);
    }
  },

  nilai: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      let { data } = req.body;
      // data = data.replaceAll("'", '"') cuma buat test
      const dataJawaban = JSON.parse(data);
      let jawaban = dataJawaban.answer.map((answer) => {
        return answer.value;
      });

      const nilai = calculateGrade(jawaban, 100);
      const post = {
        user: dataJawaban.user_id,
        test: id,
        answer: dataJawaban.answer,
        nilai,
      };
      let answer = new testAnswer(post);
      answer.save({ session });

      await session.commitTransaction();
      session.endSession();
      response(200, nilai, "Nilai berhasil dimasukan", res);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      response(500, error, "Server error", res);
    }
  },

  deleteTest: async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();

    try {
      const { id, slug, title } = req.params;
      const test = await Test.findOne({ _id: id });
      const dirname = __dirname.replace("/controllers", "");
      test.question.forEach((question) => {
        if (question.img != null) {
          fs.unlinkSync(path.join(dirname, question.img), {
            recursive: true,
            force: true,
          });
        }
        question.answer.forEach((answer) => {
          if (answer.img != null) {
            fs.unlinkSync(path.join(dirname, answer.img), {
              recursive: true,
              force: true,
            });
          }
        });
      });
      test.deleteOne({ session });

      if (test.type == "pre") {
        await MateriModel.updateOne(
          { "test.pre": id },
          { $set: { "test.pre": null } },
          { upsert: true, new: true, session }
        );
      } else if (test.type == "post") {
        await MateriModel.updateOne(
          { "test.post": id },
          { $set: { "test.post": null } },
          { upsert: true, new: true, session }
        );
      } else if (test.type == "quiz") {
        await MateriModel.updateOne(
          { slug, "items.title": title },
          { $set: { "items.$.quiz": null } },
          { upsert: true, new: true, session }
        );
      }

      await session.commitTransaction();
      response(200, [], "Test Berhasil Dihapus", res);
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      response(500, error, error.message, res);
    } finally {
      session.endSession();
    }
  },

  updateTest: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let { data } = req.body;
      const { id } = req.params;
      // data = data.replaceAll("'", '"') cuma buat experiment
      let imageTest = "/uploads/test-image/";
      const dataPertanyaan = JSON.parse(data);

      if (req.files.length > 0) {
        imageTest = req.files[0].path.split("/PDAM_TC/")[1];
      }
      const questions = dataPertanyaan.questions.map((data) => {
        let path = null;
        if (data.img != null) {
          path = imageTest + data.img.name;
        }
        let answer = data.answer.map((answer) => {
          let pathAnswer = null;
          if (answer.img != null) {
            pathAnswer = imageTest + answer.img.name;
          }
          return {
            value: answer.value,
            isTrue: answer.isTrue,
            img: pathAnswer,
          };
        });
        return {
          value: data.value,
          type: data.type,
          img: path,
          kode: makeid(8),
          answer,
        };
      });
      const post = {
        judul: dataPertanyaan.judul,
        type: dataPertanyaan.type,
        pembuat: dataPertanyaan.pembuat,
        question: questions,
      };
      await Test.updateOne({ _id: id }, post, {
        new: true,
        upsert: true,
        session,
      });

      await session.commitTransaction();
      session.endSession();
      return response(200, {}, "Test Berhasil di masukan", res);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      response(500, error, "Server error", res);
    }
  },
};

const express = require("express"); // express 호출
const router = express.Router(); // express.Router() 함수 활성화
const multer = require("multer"); // multer 호출
const path = require("path"); // path 모듈 호출
const fs = require("fs");
const { unlink } = require("fs/promises");

// @ts-ignore
router.get("/new", function (req, res, next) {
  // 세션에 저장된 파일을 삭제
  // @ts-ignore
  const filenames = req.session.imagefiles;

  const deleteFiles = async (paths) => {
    const deleting = paths.map((file) =>
      unlink(path.join(__dirname, "..", `/public/images/${file}`))
    );
    await Promise.all(deleting);
  };
  deleteFiles(filenames);

  // 세션에서 데이터를 제거
  // @ts-ignore
  req.session.imagefiles = undefined;

  // 루트 URL로 리디렉션
  res.redirect("/");
});

// PDFkit 호출
const PDFDocument = require("pdfkit");
// @ts-ignore
router.post("/pdf", function (req, res, next) {
  const body = req.body;

  // 새 pdf 생성
  const doc = new PDFDocument({ size: "A4", autoFirstPage: false });
  const pdfName = "pdf-" + Date.now() + ".pdf";

  // pdf를 public/pdf 폴더에 저장
  doc.pipe(
    fs.createWriteStream(path.join(__dirname, "..", `/public/pdf/${pdfName}`))
  );

  // pdf 페이지를 만들고 이미지를 추가
  for (const name of body) {
    doc.addPage();
    doc.image(path.join(__dirname, "..", `/public/images/${name}`), 20, 20, {
      width: 555.28,
      align: "center",
      valign: "center",
    });
  }
  // 프로세스 종료
  doc.end();

  // 브라우저로 주소를 다시 전송
  res.send(`/pdf/${pdfName}`);
});

// multer 파일 스토리지 구성
// multer.diskStorage()메서드 사용: public/images폴더에 이미지 저장(위치), 이름을 어떻게 변경해야하는지 설명
const storage = multer.diskStorage({
  // @ts-ignore
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  // 이미지 이름 변경
  // @ts-ignore
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + "." + file.mimetype.split("/")[1]
    );
  },
});

// '.png' 또는 '.jpg'만 저장되도록 파일 필터링 구성
// @ts-ignore
const fileFilter = (req, file, callback) => {
  const ext = path.extname(file.originalname);
  // 파일 확장자가 '.png' 또는 '.jpg'가 아닌 경우 오류 페이지 반환, 그렇지 않으면 true를 반환
  if (ext !== ".png" && ext !== ".jpg") {
    return callback(new Error("png와 jpg만 변환 가능합니다 :("));
  } else {
    return callback(null, true);
  }
};

// 스토리지 및 파일 필터링 구성을 넣어 Multer를 초기화
const upload = multer({ storage, fileFilter: fileFilter });

router.post("/upload", upload.array("images"), function (req, res) {
  const files = req.files;
  const imgNames = [];

  // 파일명 추출
  // @ts-ignore
  for (const i of files) {
    const index = Object.keys(i).findIndex(function (e) {
      return e === "filename";
    });
    imgNames.push(Object.values(i)[index]);
  }
  // 세션에 이미지 파일 이름 저장
  // @ts-ignore
  req.session.imagefiles = imgNames;

  // 요청을 루트 URL 경로로 리디렉션
  res.redirect("/");
});

// public/html 폴더에 저장된 index.html 파일을 반환하는 '/'GET 경로의 모든 요청을 처리하는 route메서드 정의
// route 메서드가 요청 수신할 때마다 res.sendFile사용하여 index.html파일을 사용자에게 다시 보냄
// @ts-ignore
router.get("/", function (req, res, next) {
  // 세션에 imagefiles가 없는 경우, 일반 HTML 페이지를 반환
  // @ts-ignore
  if (req.session.imagefiles === undefined) {
    res.sendFile(path.join(__dirname, "..", "/public/html/index.html"));
    //path.join()메서드와 __dirname변수는 index.html파일의 주소를 정확하게 지정하는데 도움
  } else {
    // 세션에 저장된 imagefiles가 있는 경우, index.jade 파일에 렌더링
    // @ts-ignore
    res.render("index", { images: req.session.imagefiles });
  }
});

module.exports = router;

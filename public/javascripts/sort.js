// Sortablejs코어 자바스크립트 호출: 이미지요소의 부모요소에서 활성화
import Sortable from "./sortable.core.esm";

// 이미지 태그의 컨테이너 요소에 sortablejs 사용
const list = document.querySelector("div");
// @ts-ignore
const sort = Sortable.create(list);

const convertButton = document.querySelector("a.convert");

// convert 버튼을 클릭한 경우
// @ts-ignore
convertButton.onclick = function () {
  const images = document.querySelectorAll("img");
  const loader = document.querySelector("span.loader");
  const convertText = document.querySelector("span.text");
  const downloadButton = document.querySelector("a.download");

  const filenames = [];
  // 이미지명을 배열로 추출
  for (const image of images) {
    filenames.push(image.dataset.name);
  }
  // 로딩 애니메이션 활성화
  // @ts-ignore
  loader.style.display = "inline-block";
  // @ts-ignore
  convertText.style.display = "none";

  // 이미지 파일명을 '/pdf' 경로로 전송하고 PDF 파일 링크를 수신하는 POST 요청을 작성합니다.
  fetch("/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filenames),
  })
    .then((resp) => {
      return resp.text();
    })
    .then((data) => {
      // 로딩애니메이션 비활성화
      // @ts-ignore
      loader.style.display = "none";

      // convert 및 download 버튼 표시
      // @ts-ignore
      convertText.style.display = "inline-block";
      // @ts-ignore
      downloadButton.style.display = "inline-block";

      // download 버튼에 주소 첨부
      // @ts-ignore
      downloadButton.href = data;
    })
    .catch((error) => {
      console.error(error.message);
    });
};

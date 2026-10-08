# Interactive Dish

Palmer dinnerware의 메인 화면을 재현한 정적 웹사이트입니다.

- 드래그로 그릇을 탐색하는 반복 배치와 등장 애니메이션
- 색상·종류·크기 필터, 확대·축소, 컬렉션 그리드
- 그릇 클릭 시 원본 컬렉션 상세페이지로 이동
- 데스크톱·모바일 대응 및 모션 감소 설정 지원

## 실행

Node.js 22 이상에서 실행합니다. 외부 패키지 설치는 필요하지 않습니다.

```sh
npm run dev
```

미리보기: http://localhost:4173

```sh
node tests/explorer.test.mjs
npm run build
```

빌드 결과는 `dist/`에 생성됩니다. 정적 호스팅 서비스에서 배포할 수 있습니다.

## 참고

[원본 사이트](https://www.palmer-dinnerware.com/) · [배포된 재현 사이트](https://palmer-dinnerware-recreation.ch-ai.chatgpt.site/)

디자인, 상품 이미지, 폰트 및 브랜드 자산은 원본에서 가져왔습니다. 이 저장소는 재현 프로젝트이며, 자산의 권리는 원 소유자에게 있습니다.

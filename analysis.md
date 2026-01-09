# Palmer Dinnerware Deep Dive Analysis (팔머 디너웨어 심층 분석)

## 🕵️‍♂️ Tech Stack & Architecture Deconstruction (기술 스택 및 아키텍처 분석)
Based on deep browser inspection and code analysis, the Palmer Dinnerware site is **NOT** a standard React/Next.js application as initially assumed. It is a highly customized **Webflow** build designed by **DevUncommon**, leveraging the **Finsweet** ecosystem.
(브라우저 검사 및 코드 분석 결과, 팔머 디너웨어 사이트는 초기에 가정한 표준 React/Next.js 애플리케이션이 **아닙니다**. 이 사이트는 **DevUncommon**이 설계한 고도로 커스터마이징된 **Webflow** 빌드이며, **Finsweet** 에코시스템을 활용하고 있습니다.)

### Core Technologies (핵심 기술)
1.  **Platform (플랫폼)**: **Webflow**
    *   Identified via `data-wf-site` and `w-mod-js` classes.
    *   (`data-wf-site` 및 `w-mod-js` 클래스를 통해 확인됨.)
    *   Allows for visual development but heavily extended with custom code.
    *   (시각적 개발이 가능하지만 커스텀 코드로 대폭 확장됨.)

2.  **Interaction Engine (인터랙션 엔진)**: **GSAP (GreenSock Animation Platform)**
    *   **Draggable**: Used for the signature "tossable" table interface.
    *   (**Draggable**: 이 사이트의 특징인 "던질 수 있는(tossable)" 테이블 인터페이스에 사용됨.)
    *   **InertiaPlugin**: Provides the momentum/physics when images are thrown.
    *   (**InertiaPlugin**: 이미지를 던질 때의 관성/물리 효과를 제공.)
    *   **ScrollTrigger**: Handles parallax effects and scroll-based animations.
    *   (**ScrollTrigger**: 패럴랙스 효과 및 스크롤 기반 애니메이션 처리.)

3.  **Scroll Experience (스크롤 경험)**: **Lenis**
    *   The site uses Studio Freight's (now Darkroom) **Lenis** for smooth, momentum-based scrolling.
    *   (이 사이트는 Studio Freight(현 Darkroom)의 **Lenis**를 사용하여 부드러운 관성 스크롤을 구현함.)
    *   This is critical for the "premium" feel.
    *   (이는 "프리미엄" 느낌을 주는 데 필수적임.)

4.  **Component Library (컴포넌트 라이브러리)**: **Finsweet Attributes**
    *   `fs-attributes`: Used for complex CMS filtering and interactions.
    *   (`fs-attributes`: 복잡한 CMS 필터링 및 인터랙션에 사용됨.)
    *   **Key Reference**: The hero interaction is a direct custom implementation of Finsweet's **"CMS Infinite Draggable Image Grid"**.
    *   (**핵심 참조**: 히어로 섹션의 인터랙션은 Finsweet의 **"CMS Infinite Draggable Image Grid"**를 직접 커스텀 구현한 것임.)

---

## 🎨 The "Real" Palmer User Experience ("진짜" 팔머 사용자 경험)
The initial analysis missed the forest for the trees. The site does not rely on standard "Hero with Text" patterns.
(초기 분석은 나무만 보고 숲을 보지 못했습니다. 이 사이트는 표준적인 "텍스트가 있는 히어로" 패턴에 의존하지 않습니다.)

### 1. The "Scattered Table" Concept (Hero Section) - "흩어짐이 있는 테이블" 컨셉 (히어로 섹션)
*   **No Standard Hero**: There is no big bold text saying "We sell plates".
*   (**표준 히어로 없음**: "우리는 접시를 팝니다"라는 식의 크고 굵은 텍스트가 없음.)
*   **Visual Metaphor**: The screen represents a table.
*   (**시각적 은유**: 화면 자체가 하나의 테이블을 나타냄.)
*   **Interaction**: Users see a chaotic (scattered) arrangement of plates. They can **drag** the entire surface. It feels infinite.
*   (**인터랙션**: 사용자는 무질서하게(흩어져) 배치된 접시들을 보게 됨. 전체 표면을 **드래그**할 수 있으며, 무한하게 느껴짐.)
*   **Parallax**: As you drag or scroll, items move at different speeds (depth perception).
*   (**패럴랙스**: 드래그하거나 스크롤할 때 아이템들이 서로 다른 속도로 움직임(원근감/깊이감).)

### 2. Navigation (내비게이션)
*   **Bottom-Fixed**: Navigation is NOT at the top. It is a floating bar at the bottom center.
*   (**하단 고정**: 내비게이션이 상단에 있지 않음. 하단 중앙에 떠 있는 바 형태임.)
*   **Minimalist**: Only essential controls (`Menu`, `Filter`, `Search`) are visible.
*   (**미니멀리즘**: `메뉴`, `필터`, `검색` 등 필수 컨트롤만 보임.)

### 3. Dual-View Modes (듀얼 뷰 모드)
The interface likely supports two distinct viewing modes to balance immersion with usability.
(인터페이스는 몰입감과 사용성의 균형을 위해 두 가지 뚜렷한 뷰 모드를 지원할 것으로 보입니다.)

#### A. Experience View (경험 뷰) - "The Scattered Table"
*   **Concept**: Mimics a real dinner table where plates are scattered naturally.
*   (**컨셉**: 접시들이 자연스럽게 흩어져 있는 실제 저녁 식사 테이블을 모방.)
*   **Layout**: Organic, non-linear, and chaotic. No rigid rows or columns.
*   (**레이아웃**: 유기적이고 비선형적이며 무질서함. 엄격한 행이나 열이 없음.)
*   **Interaction**: Heavy use of physics (throwing/dragging) and parallax (depth). Designed for **exploration** and "vibes".
*   (**인터랙션**: 물리 효과(던지기/드래그)와 패럴랙스(깊이감)를 적극 활용. **탐색**과 "분위기"에 초점을 맞춤.)

#### B. Grid View (그리드 뷰) - "The Catalog"
*   **Concept**: A structured index for efficiently finding specific items.
*   (**컨셉**: 특정 아이템을 효율적으로 찾기 위한 구조화된 인덱스.)
*   **Layout**: Organized Masonry or strict grid alignment. Everything is visible and evenly spaced.
*   (**레이아웃**: 정돈된 Masonry 또는 엄격한 그리드 정렬. 모든 항목이 잘 보이고 균등하게 배치됨.)
*   **Interaction**: Standard scroll. Optimized for **scanning** and readability.
*   (**인터랙션**: 표준 스크롤. **스캐닝**과 가독성에 최적화됨.)

### 4. Transitions (트랜지션/전환)
*   **Zoom-to-Detail**: Clicking a product doesn't just "load a page". The camera appears to "zoom in" to the plate, transitioning seamlessly from the chaotic grid to a focused detail view.
*   (**줌-투-디테일**: 제품을 클릭하면 단순히 "페이지를 로드"하는 것이 아님. 카메라가 접시로 "줌인"하는 것처럼 보이며, 무질서한 그리드에서 초점이 맞춰진 상세 뷰로 매끄럽게 전환됨.)

### 5. Detail View & Collection Context (상세 뷰 및 컬렉션 컨텍스트)
This is the most critical interaction for conversion. It bridges the gap between "exploration" and "commerce".
(이것은 구매 전환에 있어 가장 중요한 인터랙션입니다. "탐색"과 "상업" 사이의 격차를 해소합니다.)

#### Visual Composition (시각적 구성)
*   **Hero Transition**: The clicked plate floats up and scales to become the "Hero" on the left/center.
*   (**히어로 트랜지션**: 클릭된 접시가 떠오르고 확대되어 좌측/중앙의 "히어로"가 됩니다.)
*   **Background Treatment**: The infinite grid behind it doesn't disappear; it **blurs** and **darkens** significantly (e.g., `backdrop-filter: blur(10px)`). This maintains context—you remain "at the table".
*   (**배경 처리**: 뒤에 있는 무한 그리드는 사라지지 않고 상당히 **흐려지고** **어두워집니다** (예: `backdrop-filter: blur(10px)`). 이는 컨텍스트를 유지하여 여전히 "테이블 위"에 있다는 느낌을 줍니다.)
*   **Collection Strip**: At the bottom of the detail interface, other items from the *same collection* appear as a horizontal list or mini-grid.
*   (**컬렉션 스트립**: 상세 인터페이스 하단에 *동일한 컬렉션*의 다른 아이템들이 가로 리스트나 미니 그리드 형태로 나타납니다.)

#### Micro-Interactions (마이크로 인터랙션)
*   **URL Update**: The URL changes to `/product/slug` immediately without a page reload.
*   (**URL 업데이트**: 페이지 리로드 없이 URL이 즉시 `/product/slug`로 변경됩니다.)
*   **Cursor Change**: The cursor might change from "Drag" (Grid) to "Default" or "Close" (Detail).
*   (**커서 변경**: 커서가 "드래그"(그리드)에서 "기본" 또는 "닫기"(상세)로 변경될 수 있습니다.)

---

## 🛠 Re-Implementation Strategy (Next.js Version) - 재구현 전략 (Next.js 버전)
We will replicate this high-end experience using **Next.js**, **Tailwind CSS**, and **GSAP**.
(우리는 **Next.js**, **Tailwind CSS**, **GSAP**를 사용하여 이 하이엔드 경험을 복제할 것입니다.)

### Goal: "The Infinite Scattered Table" (목표: "무한한 흩어진 테이블")
instead of the previous generic text hero.
(이전의 일반적인 텍스트 히어로 대신.)

1.  **Engine (엔진)**:
    *   `gsap` + `@gsap/react` for animations. (애니메이션용)
    *   `lenis` for smooth scrolling. (부드러운 스크롤용)
2.  **Hero Component (히어로 컴포넌트)**:
    *   `InfiniteDraggableGrid`: A custom component that renders a grid of images.
    *   (`InfiniteDraggableGrid`: 이미지 그리드를 렌더링하는 커스텀 컴포넌트.)
    *   **Loop Logic**: Use modulo arithmetic to reposition items that drag off-screen to the other side, creating an illusion of infinity.
    *   (**루프 로직**: 화면 밖으로 드래그된 아이템을 반대쪽으로 재배치하기 위해 모듈로 연산을 사용하여 무한한 착시 효과 생성.)
3.  **Layout (레이아웃)**:
    *   Use `absolute` positioning with seeded random offsets to create the "scattered" look while maintaining a rigid underlying grid for hit detection.
    *   (클릭(히트) 감지를 위한 견고한 기본 그리드를 유지하면서, 시드 기반 난수 오프셋을 적용한 `absolute` 포지셔닝을 사용하여 "흩어진" 룩을 생성.)
4.  **Navigation (내비게이션)**:
    *   Implement the `BottomNav` bar.
    *   (`BottomNav` 바 구현.)

### Reference (참고 자료)
*   **Inspiration**: [Finsweet CMS Infinite Draggable Image Grid](https://finsweet.com/attributes/cms-infinite-draggable-image-grid)

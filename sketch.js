// 상수 정의
const initialCanvasWidth = 1000;
const initialCanvasHeight = 700;
const numMovingObjects = 25;
const centerObjectImageWidth = 500;
const centerObjectImageHeight = 500;
const centerObjectPositionX = initialCanvasWidth / 2;
const centerObjectPositionY = initialCanvasHeight / 2;
const objectImageNames = ["striped_ball.png", "striped_ball2.png", "eyes.png", "eyes.png"];
const centralContentBaseSize = 600; // 중앙 콘텐츠 크기 기준값 (픽셀)

let centerObjectImage;
let objectImages = [];
let movingObjects = [];
let cursorImage;
let linkImage;
let specialImage;

// 동적 변수
let mainScaleFactor;
let centerObjectScaleRatio;
let centerObjectDisplaySize;
let cursorDisplaySize;
let linkDisplaySize;
let specialDisplaySize;

// =========================================================================
// Class Definitions
// =========================================================================

class MovingObject {
  constructor(x, y, radius, image) {
    this.x = x;
    this.y = y;
    this.r = radius;
    this.angle = random(TWO_PI);
    this.angularVelocity = random(-0.02, 0.02);
    this.assignedImage = image;
    
    // Physics properties
    this.m = this.r * 0.1; // Mass (based on radius)
    this.vx = random(-0.5, 0.5);
    this.vy = random(-0.5, 0.5);
  }

  update(allObjects) {
    // Boundary collision
    if (this.x + this.r > width || this.x - this.r < 0) {
      this.vx *= -1;
      this.x = constrain(this.x, this.r, width - this.r);
    }
    if (this.y + this.r > height || this.y - this.r < 0) {
      this.vy *= -1;
      this.y = constrain(this.y, this.r, height - this.r);
    }

    // Object collision (Simplified for performance on many objects)
    for (let other of allObjects) {
      if (other !== this) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        let distSq = dx * dx + dy * dy;
        let minR = this.r + other.r;
        let minRSq = minR * minR;

        if (distSq < minRSq) {
          // Calculate the minimum translation distance to push objects apart
          let dist = sqrt(distSq);
          let overlap = minR - dist;
          
          // Separate objects
          let normalX = dx / dist;
          let normalY = dy / dist;
          
          this.x -= normalX * overlap / 2;
          this.y -= normalY * overlap / 2;
          other.x += normalX * overlap / 2;
          other.y += normalY * overlap / 2;
          
          // Collision response (1D elastic collision on the normal vector)
          let v1n = this.vx * normalX + this.vy * normalY;
          let v2n = other.vx * normalX + other.vy * normalY;
          
          // Calculate tangential velocities (no change)
          let v1tX = this.vx - v1n * normalX;
          let v1tY = this.vy - v1n * normalY;
          let v2tX = other.vx - v2n * normalX;
          let v2tY = other.vy - v2n * normalY;
          
          // Calculate new normal velocities (elastic collision formula)
          let v1n_after = (v1n * (this.m - other.m) + 2 * other.m * v2n) / (this.m + other.m);
          let v2n_after = (v2n * (other.m - this.m) + 2 * this.m * v1n) / (this.m + other.m);
          
          // Final new velocities
          this.vx = v1tX + v1n_after * normalX;
          this.vy = v1tY + v1n_after * normalY;
          other.vx = v2tX + v2n_after * normalX;
          other.vy = v2tY + v2n_after * normalY;
        }
      }
    }

    // Apply movement
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.angularVelocity;
  }

  display() {
    if (this.assignedImage) {
      push();
      translate(this.x, this.y);
      rotate(this.angle);
      imageMode(CENTER);
      // 이미지를 현재 반지름의 2배 크기로 그립니다 (2*r = 지름)
      image(this.assignedImage, 0, 0, this.r * 2, this.r * 2); 
      pop();
    } else {
      // 이미지 로드 실패 시 대체 도형
      fill(this.color);
      ellipse(this.x, this.y, this.r * 2);
    }
  }
}

// =========================================================================
// Setup and Preload
// =========================================================================

function preload() {
  // 이미지 로드 (경로 주의: image/ 폴더 내에 있어야 함)
  try {
    centerObjectImage = loadImage('image/sight.png');
    cursorImage = loadImage('image/cursor.png');
    linkImage = loadImage('image/link.png');
    specialImage = loadImage('image/special.png');
    
    // 배경 오브젝트 이미지 로드
    for (let name of objectImageNames) {
      objectImages.push(loadImage('image/' + name));
    }
  } catch(e) {
    // 에러 로깅
    console.error("이미지 로드 실패:", e);
    // 대체 텍스트/도형 사용을 위해 이미지 변수를 null로 설정
    centerObjectImage = null; 
    cursorImage = null;
    linkImage = null;
    specialImage = null;
    objectImages = []; 
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
  imageMode(CENTER);
  noStroke();
  
  // 크기 및 비율 초기 계산
  recalculateSizes(); 
  
  // 움직이는 오브젝트 초기화
  for (let i = 0; i < numMovingObjects; i++) {
    let x = random(width);
    let y = random(height);
    let r = random(20, 50) * mainScaleFactor; // 반지름도 전체 스케일에 비례
    let img = random(objectImages);
    movingObjects.push(new MovingObject(x, y, r, img));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recalculateSizes();
  
  // 캔버스 크기 변경 후 움직이는 오브젝트 위치/크기 조정 (선택 사항)
  for (let obj of movingObjects) {
    // 크기를 재계산된 mainScaleFactor에 맞춥니다
    obj.r = constrain(obj.r * (mainScaleFactor / (obj.scaleFactor || 1)), 20 * mainScaleFactor, 50 * mainScaleFactor);
    obj.scaleFactor = mainScaleFactor;
  }
}

/**
 * 화면 크기 변경 시 모든 요소의 크기와 위치 비율을 재계산합니다.
 */
function recalculateSizes() {
  // 1. 전체 캔버스 스케일 팩터 (배경 오브젝트에 사용)
  // 화면의 가로 또는 세로 중 작은 것을 기준으로 삼아, 캔버스가 작아져도 오브젝트가 화면을 벗어나지 않게 함
  mainScaleFactor = min(width / initialCanvasWidth, height / initialCanvasHeight);

  // *******************************************************************
  // 2. 중앙 콘텐츠 스케일 비율 결정 (핵심 수정 부분)
  // *******************************************************************
  
  // 목표: 데스크톱에서 가로 폭(width)의 70%를 차지하도록 확대
  let targetWidthBased = width * 0.7; 
  // 목표: 세로 높이(height)의 80%를 차지하도록 확대 (세로가 짧을 때 대응)
  let targetHeightBased = height * 0.8; 
  
  // 중앙 콘텐츠의 목표 크기는 가로와 세로 중 더 제약이 큰 쪽을 기준으로 삼습니다.
  let desiredContentSize = min(targetWidthBased, targetHeightBased); 
  
  // 중앙 콘텐츠 크기 비율 계산: 원하는 크기 / 원래 디자인 크기 기준값(600)
  centerObjectScaleRatio = desiredContentSize / centralContentBaseSize;
  
  // 초대형 화면에서 중앙 콘텐츠가 너무 커지는 것을 방지하기 위해 최대 배율을 2.5로 제한
  centerObjectScaleRatio = min(centerObjectScaleRatio, 2.5); 
  
  // *******************************************************************
  
  // 3. 중앙 콘텐츠의 최종 표시 크기 계산
  // centerObjectImageWidth = 500 (원래 크기)
  centerObjectDisplaySize = centerObjectImageWidth * centerObjectScaleRatio;
  
  // 4. 기타 이미지 크기 계산 (중앙 콘텐츠 스케일 비율에 따라 조정)
  cursorDisplaySize = 40 * centerObjectScaleRatio;
  linkDisplaySize = 30 * centerObjectScaleRatio;
  specialDisplaySize = 30 * centerObjectScaleRatio;
}

// =========================================================================
// Draw Loop
// =========================================================================

function draw() {
  background(0); // 검은색 배경

  // 1. 움직이는 오브젝트 업데이트 및 표시
  for (let obj of movingObjects) {
    obj.update(movingObjects);
    obj.display();
  }

  // 2. 중앙 콘텐츠 표시
  push();
  // 캔버스 중앙으로 이동
  translate(width / 2, height / 2);

  // 중앙 이미지 (sight.png)
  if (centerObjectImage) {
    // 중앙 콘텐츠 스케일 비율에 따라 크기 조정
    image(centerObjectImage, 0, 0, centerObjectDisplaySize, centerObjectDisplaySize); 
  } else {
    // 이미지 로드 실패 시 대체 텍스트
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Sight & Senses (Image Fail)", 0, 0);
  }
  
  // 3. 커서 이미지 (중앙에 배치)
  // 캔버스 중앙 (0, 0) 기준 아래쪽에 배치
  let cursorOffsetY = centerObjectDisplaySize / 2 + cursorDisplaySize / 2; 
  
  if (cursorImage) {
      // 80 * centerObjectScaleRatio 만큼 위로 올려서 배치
      image(cursorImage, 0, cursorOffsetY - 80 * centerObjectScaleRatio, cursorDisplaySize, cursorDisplaySize);
  }
  
  // 4. Link/Map/Special 이미지 (중앙 이미지 위에 배치)
  let specialOffsetY = centerObjectDisplaySize / 2 - specialDisplaySize * 2.5; 
  let linkOffsetX = centerObjectDisplaySize / 2 - linkDisplaySize * 2.5; 

  if (linkImage) {
      image(linkImage, -linkOffsetX, -specialOffsetY, linkDisplaySize, linkDisplaySize); // 좌상단
  }
  
  if (specialImage) {
      image(specialImage, linkOffsetX, -specialOffsetY, specialDisplaySize, specialDisplaySize); // 우상단
  }

  pop();
}
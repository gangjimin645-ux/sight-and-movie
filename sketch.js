// --- 전역 변수 설정 ---
let balls = [];
let gravity = 0.6;
let restitution = 0.4;
let collisionIterations = 8;
const BALL_RADIUS = 70;

let stripedBallImage1;
let stripedBallImage2;
let eyesBallImage;
let allBallImages = [];
// (special.png 관련 변수 제거됨)

// ⭐ 기본 커서 이미지 변수
let defaultCursorImage; 
// ⭐ 링크 영역용 커서 이미지 변수 (link.png)
let linkCursorImage;    
// ⭐ 현재 활성화된 커서 이미지 (이 변수를 draw에서 그립니다)
let currentActiveCursorImage; 

// 원본 이미지 크기 (기준값)
const ORIGINAL_WIDTH = 1920;
const ORIGINAL_HEIGHT = 1080;
const ORIGINAL_BALL_RADIUS = 70;
// ⭐ 커서 이미지의 기본 크기
const BASE_CURSOR_SIZE = 60;

let currentCursorSize; 

let centerObjectImage; // sight.png
let centerObjectImageWidth = 500;
let centerObjectImageHeight = 500;
let secondImage; // seesunsohot.png
let secondImageWidth = 200;
let secondImageHeight = 50;
const GAP_Y = 50; // 이미지 간격 50px

// 반응형 좌표 및 크기 변수
let currentBallRadius;
let currentCenterObjectImageWidth;
let currentCenterObjectImageHeight;
let currentSecondImageWidth;
let currentSecondImageHeight;
let currentGapY;
let centerObjectX;
let centerObjectY;


function preload() {
    stripedBallImage1 = loadImage('iamge/striped_ball.png');
    stripedBallImage2 = loadImage('iamge/striped_ball2.png');
    eyesBallImage = loadImage('iamge/eyes.png');
    
    // ⭐ 기본 커서 (cursor.png) 로드
    defaultCursorImage = loadImage('iamge/cursor.png'); 
    // ⭐ 링크 커서 (link.png) 로드
    linkCursorImage = loadImage('iamge/link.png'); 

    centerObjectImage = loadImage('iamge/sight.png');
    secondImage = loadImage('iamge/seesunsohot.png');

    allBallImages.push(stripedBallImage1);
    allBallImages.push(stripedBallImage2);
    allBallImages.push(eyesBallImage);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER); // 모든 이미지의 기준점을 중심으로 설정
    noStroke();
    
    // ⭐ 시스템 커서를 숨깁니다.
    noCursor(); 

    recalculateSizes();
    // ⭐ 초기 활성화 커서 설정
    currentActiveCursorImage = defaultCursorImage; 
}

// ⭐ 추가: 스케치를 리셋하는 함수
function resetSketch() {
    balls = []; // 모든 공 배열 비우기
}


// 반응형 크기 및 좌표를 계산하는 핵심 함수
function recalculateSizes() {
    let ratio = width / ORIGINAL_WIDTH;

    // 공, 커서 등 다른 요소들은 원래 비율대로 둡니다.
    currentBallRadius = ORIGINAL_BALL_RADIUS * ratio;
    currentCursorSize = BASE_CURSOR_SIZE * ratio;
    
    // --- ⬇️ 글자 이미지를 위한 수정된 부분 (휴대폰 크기 보정) ⬇️ ---

    // 1. 'sight.png'의 최소 너비를 300px로 설정 (이 값은 조절 가능)
    let minSightWidth = 400; 
    currentCenterObjectImageWidth = max(centerObjectImageWidth * ratio, minSightWidth);
    // 너비에 맞춰 높이 비율도 동일하게 조정
    let sightScaleRatio = currentCenterObjectImageWidth / centerObjectImageWidth;
    currentCenterObjectImageHeight = centerObjectImageHeight * sightScaleRatio;

    // 2. 'seesunsohot.png'의 최소 너비를 180px로 설정 (이 값은 조절 가능)
    let minSecondImageWidth = 280;
    currentSecondImageWidth = max(secondImageWidth * ratio, minSecondImageWidth);
    // 너비에 맞춰 높이 비율도 동일하게 조정
    let secondScaleRatio = currentSecondImageWidth / secondImageWidth;
    currentSecondImageHeight = secondImageHeight * secondScaleRatio;

    // 3. 이미지 사이 갭(GAP)의 최소값 설정 (예: 20px)
    currentGapY = max(GAP_Y * ratio, 20);

    // --- ⬆️ 여기까지 수정 ⬆️ ---

    // 수직 중앙 정렬 로직 (새로운 크기 적용)
    let totalContentHeight = currentCenterObjectImageHeight + currentGapY + currentSecondImageHeight;
    let topStartingY = (height / 2) - (totalContentHeight / 2);

    centerObjectY = topStartingY + (currentCenterObjectImageHeight / 2);
    centerObjectX = width / 2;

    // 기존 공들의 크기 업데이트
    for (let b of balls) {
        b.r = currentBallRadius;
    }
}


function draw() {
    // 공 생성기 (배열이 비워지면 자동으로 다시 생성 시작)
    if (balls.length < 200 && frameCount % 5 === 0) {
        let x = random(width);
        let y = random(-300, -50);
        balls.push(new Ball(x, y, currentBallRadius));
    }

    background(0);

    let secondImageCenterX = centerObjectX;
    let secondImageCenterY = centerObjectY + (currentCenterObjectImageHeight / 2) + currentGapY + (currentSecondImageHeight / 2);

    // seesunsohot.png의 경계 계산
    let leftEdge = secondImageCenterX - (currentSecondImageWidth / 2);
    let rightEdge = secondImageCenterX + (currentSecondImageWidth / 2);
    let topEdge = secondImageCenterY - (currentSecondImageHeight / 2);
    let bottomEdge = secondImageCenterY + (currentSecondImageHeight / 2);

    // ⭐ 마우스가 seesunsohot.png 영역 위에 있는지 확인하고 커서 이미지 변경
    if (mouseX >= leftEdge && mouseX <= rightEdge &&
        mouseY >= topEdge && mouseY <= bottomEdge) {
        currentActiveCursorImage = linkCursorImage; // 손가락 모양 커서
    } else {
        currentActiveCursorImage = defaultCursorImage; // 기본 커서
    }

    // 중앙 객체 그리기
    if (centerObjectImage) {
        push();
        imageMode(CENTER);
        image(centerObjectImage, centerObjectX, centerObjectY, currentCenterObjectImageWidth, currentCenterObjectImageHeight);
        image(secondImage, secondImageCenterX, secondImageCenterY, currentSecondImageWidth, currentSecondImageHeight);
        pop();
    }

    // 물리 시뮬레이션 업데이트
    for (let b of balls) {
        b.update();
    }

    // 공끼리 충돌 처리
    for (let k = 0; k < collisionIterations; k++) {
        for (let i = 0; i < balls.length; i++) {
            let b = balls[i];
            for (let j = i + 1; j < balls.length; j++) {
                b.collide(balls[j]);
            }
        }
    }

    // 공 그리기
    for (let b of balls) {
        b.display();
    }
    
    // ⭐ 현재 활성화된 커서 이미지를 마우스 위치에 그립니다.
    if (currentActiveCursorImage) {
        image(currentActiveCursorImage, mouseX, mouseY, currentCursorSize, currentCursorSize);
    }
}

// 창 크기가 변경될 때마다 호출되는 P5.js 함수
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    recalculateSizes();
}


// ⭐ 수정: seesunsohot.png 클릭 시 인스타그램으로, 그 외에는 스케치 리셋
function mouseClicked() {
    let secondImageCenterX = centerObjectX;
    let secondImageCenterY = centerObjectY + (currentCenterObjectImageHeight / 2) + currentGapY + (currentSecondImageHeight / 2);

    let leftEdge = secondImageCenterX - (currentSecondImageWidth / 2);
    let rightEdge = secondImageCenterX + (currentSecondImageWidth / 2);
    let topEdge = secondImageCenterY - (currentSecondImageHeight / 2);
    let bottomEdge = secondImageCenterY + (currentSecondImageHeight / 2);

    if (mouseX >= leftEdge && mouseX <= rightEdge &&
        mouseY >= topEdge && mouseY <= bottomEdge) {
        
        // 1. 링크 영역 클릭 시: 인스타그램 열기
        let targetURL = "https://www.instagram.com/seesunsohot/profilecard/?igsh=MW82cHN1ZnVvZzFhMw==";
        window.open(targetURL, '_blank');
    } else {
        // 2. 그 외 모든 영역 클릭 시: 스케치 리셋
        resetSketch();
    }
}


class Ball {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = random(-0.2, 0.2);
        this.vy = 0;

        this.angle = random(TWO_PI);
        this.angularVelocity = random(-0.01, 0.01);

        // ⭐ 수정: specialImage 로직을 제거하고, allBallImages에서 무작위로 선택합니다.
        this.assignedImage = random(allBallImages);

        this.color = color(random(150, 255), random(120, 220), random(200, 255), 255);
    }

    update() {
        this.vy += gravity;
        this.x += this.vx;
        this.y += this.vy;

        this.angle += this.angularVelocity;
        this.angularVelocity *= 0.99;

        // 바닥 충돌
        if (this.y + this.r > height) {
            this.y = height - this.r;
            this.vy *= -restitution;
            this.vx *= 0.95;
            this.angularVelocity *= 0.8;

            if (abs(this.vy) < 0.1 && abs(this.vx) < 0.1) {
                this.vy = 0;
                this.vx = 0;
                this.angularVelocity = 0;
            }
        }

        // 좌우 벽 충돌
        if (this.x - this.r < 0) {
            this.x = this.r;
            this.vx *= -restitution;
            this.angularVelocity *= 0.8;
        } else if (this.x + this.r > width) {
            this.x = width - this.r;
            this.vx *= -restitution;
            this.angularVelocity *= 0.8;
        }

        // 1. sight.png와의 충돌 처리
        this.handleRectCollision(centerObjectX, centerObjectY, currentCenterObjectImageWidth, currentCenterObjectImageHeight);

        // 2. seesunsohot.png와의 충돌 처리
        let secondImageCenterX = centerObjectX;
        let secondImageCenterY = centerObjectY + (currentCenterObjectImageHeight / 2) + currentGapY + (currentSecondImageHeight / 2);
        this.handleRectCollision(secondImageCenterX, secondImageCenterY, currentSecondImageWidth, currentSecondImageHeight);
    }

    handleRectCollision(rectX, rectY, rectW, rectH) {
        let halfW = rectW / 2;
        let halfH = rectH / 2;

        let closestX = constrain(this.x, rectX - halfW, rectX + halfW);
        let closestY = constrain(this.y, rectY - halfH, rectY + halfH);

        let dx = closestX - this.x;
        let dy = closestY - this.y;
        let dist = sqrt(dx * dx + dy * dy);

        if (dist < this.r) {
            let overlap = this.r - dist + 2.5;
            let angle = atan2(dy, dx) + PI;

            this.x += overlap * cos(angle);
            this.y += overlap * sin(angle);

            let nx = cos(angle);
            let ny = sin(angle);
            let tx = -ny;
            let ty = nx;

            let normalVelocity = this.vx * nx + this.vy * ny;
            let tangentVelocityX = this.vx - normalVelocity * nx;
            let tangentVelocityY = this.vy - normalVelocity * ny;

            normalVelocity *= -restitution;

            this.vx = normalVelocity * nx + tangentVelocityX;
            this.vy = normalVelocity * ny + tangentVelocityY;

            let relativeTangentVelocity = this.vx * tx + this.vy * ty;
            let frictionFactor = 0.05;
            let impulse = relativeTangentVelocity * frictionFactor;
            this.angularVelocity -= impulse / (this.r * this.r) * 0.05;

            this.vx -= impulse * tx;
            this.vy -= impulse * ty;
        }
    }

    collide(other) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        let dist = sqrt(dx * dx + dy * dy);
        let minDist = this.r + other.r;

        if (dist < minDist) {
            let overlap = (minDist - dist + 0.05);
            let angle = atan2(dy, dx);

            let m1 = this.r * this.r;
            let m2 = other.r * other.r;
            let totalMass = m1 + m2;

            let thisMoveRatio = m2 / totalMass;
            let otherMoveRatio = m1 / totalMass;

            this.x -= (overlap * thisMoveRatio) * cos(angle);
            this.y -= (overlap * thisMoveRatio) * sin(angle);
            other.x += (overlap * otherMoveRatio) * cos(angle);
            other.y += (overlap * otherMoveRatio) * sin(angle);

            let nx = cos(angle);
            let ny = sin(angle);
            let tx = -ny;
            let ty = nx;

            let v1n = this.vx * nx + this.vy * ny;
            let v1t = this.vx * tx + this.vy * ty;
            let v2n = other.vx * nx + other.vy * ny;
            let v2t = other.vx * tx + other.vy * ty;

            let v1n_after = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2) * restitution;
            let v2n_after = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2) * restitution;

            let frictionFactor = 0.05;
            let relativeTangentVelocity = v1t - v2t;
            let impulse = relativeTangentVelocity * frictionFactor;

            this.angularVelocity -= impulse / (this.r * this.r) * 0.05;
            other.angularVelocity += impulse / (other.r * other.r) * 0.05;

            v1t -= impulse;
            v2t += impulse;

            this.vx = v1t * tx + v1n_after * nx;
            this.vy = v1t * ty + v1n_after * ny;
            other.vx = v2t * tx + v2n_after * nx;
            other.vy = v2t * ty + v2n_after * ny;
        }
    }

    display() {
        if (this.assignedImage) {
            push();
            translate(this.x, this.y);
            rotate(this.angle);
            imageMode(CENTER);
            image(this.assignedImage, 0, 0, this.r * 2, this.r * 2);
            pop();
        } else {
            fill(this.color);
            ellipse(this.x, this.y, this.r * 2);
        }
    }
}
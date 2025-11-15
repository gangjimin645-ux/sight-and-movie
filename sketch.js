// --- 전역 변수 설정 ---
let balls = [];
let gravity = 0.6;
let restitution = 0.4;
let collisionIterations = 8;

let stripedBallImage1;
let stripedBallImage2;
let eyesBallImage;
let allBallImages = [];

// ⭐ 기본 커서 이미지 변수
let defaultCursorImage; 
// ⭐ 링크 영역용 커서 이미지 변수 (link.png) - 인스타그램
let linkCursorImage;   
// ⭐ 지도 링크 영역용 커서 이미지 변수 (map.png) - 지도
let mapCursorImage; 
// ⭐⭐ 플레이 링크 영역용 커서 이미지 변수 (play.png) - 유튜브 ⭐⭐
let playCursorImage;
// ⭐ 현재 활성화된 커서 이미지 (이 변수를 draw에서 그립니다)
let currentActiveCursorImage; 

// 원본 이미지 크기 (기준값)
const ORIGINAL_WIDTH = 1920;
const ORIGINAL_HEIGHT = 1080;
const ORIGINAL_BALL_RADIUS = 70;
const MIN_BALL_RADIUS = 20; 
const BASE_CURSOR_SIZE = 60; 

const CURSOR_ASPECT_RATIO_W = 1.0; 
const CURSOR_ASPECT_RATIO_H = 1.0;

let currentCursorSize; 
let currentCursorHeight; 
let cursorAspectRatio = 1; 

let centerObjectImage; // sight.png
let centerObjectImageWidth = 500;
let centerObjectImageHeight = 500;

let timeImage; // time.png
let timeImageWidth = 350; 
let timeImageHeight = 120; 

let secondImage; // seesunsohot.png (인스타그램 링크)
let secondImageWidth = 200;
let secondImageHeight = 50;

// ⭐⭐ movie.png 추가 ⭐⭐
let movieImage; // movie.png
let movieImageWidth = 250; // 기준 너비
let movieImageHeight = 100; // 기준 높이
let currentMovieImageWidth;
let currentMovieImageHeight;

// where.png (주소 텍스트 및 지도 링크 영역)의 기준 너비를 900으로 확장
let whereImage; // where.png 
let whereImageWidth = 600; 
let whereImageHeight = 50; 

// map.png, play.png는 커서로만 사용되므로 크기 변수는 필요 없습니다.

const GAP_Y = 80; // 이미지 간격 (큰 간격)
const GAP_Y_SMALL = 100; // 이미지 간격 (작은 간격)

// 반응형 좌표 및 크기 변수
let currentBallRadius;
let currentCenterObjectImageWidth;
let currentCenterObjectImageHeight;
let currentTimeImageWidth; 
let currentTimeImageHeight;
let currentSecondImageWidth;
let currentSecondImageHeight;
let currentWhereImageWidth; 
let currentWhereImageHeight;
// map.png의 크기 변수는 사용하지 않습니다.

let currentGapY; 
let currentGapYSmall; 

let centerObjectX;
let centerObjectY;


function preload() {
    // 공 이미지
    // ⭐ 'image/'로 경로 수정
    stripedBallImage1 = loadImage('image/striped_ball.png');
    stripedBallImage2 = loadImage('image/striped_ball2.png');
    eyesBallImage = loadImage('image/eyes.png');
    
    // 커서 이미지
    // ⭐ 'image/'로 경로 수정
    defaultCursorImage = loadImage('image/cursor.png'); 
    linkCursorImage = loadImage('image/link.png'); 
    mapCursorImage = loadImage('image/map.png'); // map.png 커서 이미지 로드
    playCursorImage = loadImage('image/play.png'); // ⭐ play.png 커서 이미지 로드

    // 중앙 객체 이미지
    // ⭐ 'image/'로 경로 수정
    centerObjectImage = loadImage('image/sight.png');
    timeImage = loadImage('image/time.png'); 
    secondImage = loadImage('image/seesunsohot.png'); // 인스타그램
    whereImage = loadImage('image/where.png'); // 지도 링크 영역
    movieImage = loadImage('image/movie.png'); // ⭐ movie.png 이미지 로드

    if (defaultCursorImage && defaultCursorImage.width && defaultCursorImage.height) {
        cursorAspectRatio = defaultCursorImage.width / defaultCursorImage.height;
    }

    allBallImages.push(stripedBallImage1);
    allBallImages.push(stripedBallImage2);
    allBallImages.push(eyesBallImage);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);
    noStroke();
    
    noCursor(); 

    recalculateSizes();
    currentActiveCursorImage = defaultCursorImage; 
}

function resetSketch() {
    balls = []; 
}


function recalculateSizes() {
    let widthRatio = width / ORIGINAL_WIDTH;
    let heightRatio = height / ORIGINAL_HEIGHT;
    
    let primaryScale = min(widthRatio, heightRatio);

    currentBallRadius = max(ORIGINAL_BALL_RADIUS * primaryScale, MIN_BALL_RADIUS);
    
    let scaledBaseSize = BASE_CURSOR_SIZE * primaryScale;
    currentCursorSize = scaledBaseSize * CURSOR_ASPECT_RATIO_W; 
    currentCursorHeight = (scaledBaseSize / cursorAspectRatio) * CURSOR_ASPECT_RATIO_H;
    
    // --- ⬇️ 이미지 스케일링: primaryScale 적용 및 최소 크기 보장 ⬇️ ---

    // 1. sight.png
    let minSightWidth = 200; 
    let desiredSightWidth = centerObjectImageWidth * primaryScale;
    currentCenterObjectImageWidth = max(desiredSightWidth, minSightWidth); 
    let sightScaleRatio = currentCenterObjectImageWidth / centerObjectImageWidth;
    currentCenterObjectImageHeight = centerObjectImageHeight * sightScaleRatio;

    // 2. time.png
    let minTimeWidth = 150; 
    let desiredTimeWidth = timeImageWidth * primaryScale;
    currentTimeImageWidth = max(desiredTimeWidth, minTimeWidth); 
    let timeScaleRatio = currentTimeImageWidth / timeImageWidth;
    currentTimeImageHeight = timeImageHeight * timeScaleRatio;

    // 3. where.png 스케일링 (minWhereWidth를 400으로 높여 최소 크기 보장) 
    let minWhereWidth = 300; 
    let desiredWhereWidth = whereImageWidth * primaryScale;
    currentWhereImageWidth = max(desiredWhereWidth, minWhereWidth); 
    let whereScaleRatio = currentWhereImageWidth / whereImageWidth;
    currentWhereImageHeight = whereImageHeight * whereScaleRatio;

    // ⭐⭐ 4. movie.png 스케일링 (where와 seesunsohot 사이에 삽입) ⭐⭐
    let minMovieWidth = 200; 
    let desiredMovieWidth = movieImageWidth * primaryScale;
    currentMovieImageWidth = max(desiredMovieWidth, minMovieWidth); 
    let movieScaleRatio = currentMovieImageWidth / movieImageWidth;
    currentMovieImageHeight = movieImageHeight * movieScaleRatio;

    // 5. seesunsohot.png (맨 아래)
    let minSecondImageWidth = 100;
    let desiredSecondImageWidth = secondImageWidth * primaryScale;
    currentSecondImageWidth = max(desiredSecondImageWidth, minSecondImageWidth);
    let secondScaleRatio = currentSecondImageWidth / secondImageWidth;
    currentSecondImageHeight = secondImageHeight * secondScaleRatio;


    // 이미지 사이 갭(GAP) 스케일링
    currentGapY = max(GAP_Y * primaryScale, 20); 
    currentGapYSmall = max(GAP_Y_SMALL * primaryScale, 10); 

    // --- ⬆️ 이미지 스케일링 완료 ⬆️ ---

    // ⭐⭐ 수직 중앙 정렬 로직 (순서: sight -> time -> where -> movie -> seesunsohot) ⭐⭐
    // 총 콘텐츠 높이: sight + gap + time + gap + where + gap_small + movie + gap_small + seesunsohot
    let totalContentHeight = currentCenterObjectImageHeight + currentGapY + 
                             currentTimeImageHeight + currentGapY + 
                             currentWhereImageHeight + currentGapYSmall + 
                             currentMovieImageHeight + currentGapYSmall + // ⭐ movie.png 추가
                             currentSecondImageHeight;

    let topStartingY = (height / 2) - (totalContentHeight / 2);

    centerObjectY = topStartingY + (currentCenterObjectImageHeight / 2);
    centerObjectX = width / 2;

    for (let b of balls) {
        b.r = currentBallRadius; 
    }
}


function draw() {
    if (balls.length < 100 && frameCount % 5 === 0) {
        let x = random(width);
        let y = random(-300, -50);
        balls.push(new Ball(x, y, currentBallRadius));
    }

    background(0);
    
    // ⭐⭐ 이미지 중앙 좌표 계산 (순서: sight -> time -> where -> movie -> seesunsohot) ⭐⭐

    // 1. sight.png: centerObjectX, centerObjectY (이미 계산됨)
    
    // 2. time.png
    let timeImageCenterY = centerObjectY + (currentCenterObjectImageHeight / 2) + currentGapY + (currentTimeImageHeight / 2);
    let timeImageCenterX = centerObjectX;
    
    // 3. where.png (지도 링크 영역)
    let whereImageCenterX = centerObjectX;
    let whereImageCenterY = timeImageCenterY + (currentTimeImageHeight / 2) + currentGapY + (currentWhereImageHeight / 2);

    // ⭐⭐ 4. movie.png (새로 삽입된 영화 링크 영역) ⭐⭐
    let movieImageCenterX = centerObjectX;
    let movieImageCenterY = whereImageCenterY + (currentWhereImageHeight / 2) + currentGapYSmall + (currentMovieImageHeight / 2);

    // 5. seesunsohot.png (인스타그램 링크, 맨 아래)
    let secondImageCenterX = centerObjectX;
    let secondImageCenterY = movieImageCenterY + (currentMovieImageHeight / 2) + currentGapYSmall + (currentSecondImageHeight / 2); // ⭐ movieImageCenterY 기준으로 수정

    
    // ⭐⭐ where.png (네이버 지도)의 경계 계산 (커서/클릭 영역) ⭐⭐
    let mapLeftEdge = whereImageCenterX - (currentWhereImageWidth / 2);
    let mapRightEdge = whereImageCenterX + (currentWhereImageWidth / 2);
    let mapTopEdge = whereImageCenterY - (currentWhereImageHeight / 2);
    let mapBottomEdge = whereImageCenterY + (currentWhereImageHeight / 2);

    // ⭐⭐ movie.png (유튜브)의 경계 계산 (커서/클릭 영역) ⭐⭐
    let movieLeftEdge = movieImageCenterX - (currentMovieImageWidth / 2);
    let movieRightEdge = movieImageCenterX + (currentMovieImageWidth / 2);
    let movieTopEdge = movieImageCenterY - (currentMovieImageHeight / 2);
    let movieBottomEdge = movieImageCenterY + (currentMovieImageHeight / 2);

    // ⭐ seesunsohot.png (인스타그램)의 경계 계산 (커서/클릭 영역)
    let instaLeftEdge = secondImageCenterX - (currentSecondImageWidth / 2);
    let instaRightEdge = secondImageCenterX + (currentSecondImageWidth / 2);
    let instaTopEdge = secondImageCenterY - (currentSecondImageHeight / 2);
    let instaBottomEdge = secondImageCenterY + (currentSecondImageHeight / 2);


    // ⭐⭐ 마우스 커서 변경 로직: movie.png 위 > where.png 위 > seesunsohot.png 위 > 기본 ⭐⭐
    if (mouseX >= movieLeftEdge && mouseX <= movieRightEdge && 
        mouseY >= movieTopEdge && mouseY <= movieBottomEdge) {
        currentActiveCursorImage = playCursorImage; // ⭐ movie.png 위: play.png 커서
    } else if (mouseX >= mapLeftEdge && mouseX <= mapRightEdge && 
        mouseY >= mapTopEdge && mouseY <= mapBottomEdge) {
        currentActiveCursorImage = mapCursorImage; // where.png 위: map.png 커서
    } else if (mouseX >= instaLeftEdge && mouseX <= instaRightEdge && 
               mouseY >= instaTopEdge && mouseY <= instaBottomEdge) {
        currentActiveCursorImage = linkCursorImage; // seesunsohot.png 위: 손가락 커서
    } else {
        currentActiveCursorImage = defaultCursorImage; // 기본 커서
    }
    
    // 중앙 객체 그리기 (순서: sight -> time -> where -> movie -> seesunsohot)
    if (centerObjectImage) {
        push();
        imageMode(CENTER);
        
        // 1. sight.png
        image(centerObjectImage, centerObjectX, centerObjectY, currentCenterObjectImageWidth, currentCenterObjectImageHeight);
        
        // 2. time.png
        if (timeImage) {
            image(timeImage, timeImageCenterX, timeImageCenterY, currentTimeImageWidth, currentTimeImageHeight);
        }
        
        // 3. where.png 그리기 (지도 링크 영역)
        if (whereImage) {
            image(whereImage, whereImageCenterX, whereImageCenterY, currentWhereImageWidth, currentWhereImageHeight);
        }

        // ⭐⭐ 4. movie.png 그리기 (유튜브 링크 영역) ⭐⭐
        if (movieImage) {
            image(movieImage, movieImageCenterX, movieImageCenterY, currentMovieImageWidth, currentMovieImageHeight);
        }

        // 5. seesunsohot.png (인스타그램 링크)
        image(secondImage, secondImageCenterX, secondImageCenterY, currentSecondImageWidth, currentSecondImageHeight);
        
        pop();
    }

    // 물리 시뮬레이션 업데이트
    for (let b of balls) {
        // ⭐⭐ 충돌 처리에 새로운 이미지 위치 반영 (movieImageCenterY 추가) ⭐⭐
        b.update(timeImageCenterY, whereImageCenterY, movieImageCenterY, secondImageCenterY); 
    }

    // 공끼리 충돌 처리 (변경 없음)
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
        image(currentActiveCursorImage, mouseX, mouseY, currentCursorSize, currentCursorHeight);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    recalculateSizes();
}


function mouseClicked() {
    // ⭐⭐ 이미지 중앙 좌표 계산 (draw()와 동일) ⭐⭐
    let timeImageCenterY = centerObjectY + (currentCenterObjectImageHeight / 2) + currentGapY + (currentTimeImageHeight / 2);
    
    let whereImageCenterX = centerObjectX;
    let whereImageCenterY = timeImageCenterY + (currentTimeImageHeight / 2) + currentGapY + (currentWhereImageHeight / 2);

    // ⭐⭐ movie.png 추가 ⭐⭐
    let movieImageCenterX = centerObjectX;
    let movieImageCenterY = whereImageCenterY + (currentWhereImageHeight / 2) + currentGapYSmall + (currentMovieImageHeight / 2);

    let secondImageCenterX = centerObjectX;
    let secondImageCenterY = movieImageCenterY + (currentMovieImageHeight / 2) + currentGapYSmall + (currentSecondImageHeight / 2);
    
    // seesunsohot.png (인스타그램) 클릭 영역
    let instaLeftEdge = secondImageCenterX - (currentSecondImageWidth / 2);
    let instaRightEdge = secondImageCenterX + (currentSecondImageWidth / 2);
    let instaTopEdge = secondImageCenterY - (currentSecondImageHeight / 2);
    let instaBottomEdge = secondImageCenterY + (currentSecondImageHeight / 2);

    // where.png (네이버 지도) 클릭 영역
    let mapLeftEdge = whereImageCenterX - (currentWhereImageWidth / 2);
    let mapRightEdge = whereImageCenterX + (currentWhereImageWidth / 2);
    let mapTopEdge = whereImageCenterY - (currentWhereImageHeight / 2);
    let mapBottomEdge = whereImageCenterY + (currentWhereImageHeight / 2);

    // ⭐⭐ movie.png (유튜브) 클릭 영역 ⭐⭐
    let movieLeftEdge = movieImageCenterX - (currentMovieImageWidth / 2);
    let movieRightEdge = movieImageCenterX + (currentMovieImageWidth / 2);
    let movieTopEdge = movieImageCenterY - (currentMovieImageHeight / 2);
    let movieBottomEdge = movieImageCenterY + (currentMovieImageHeight / 2);


    if (mouseX >= movieLeftEdge && mouseX <= movieRightEdge &&
        mouseY >= movieTopEdge && mouseY <= movieBottomEdge) {
        // ⭐ movie.png 클릭 시: 유튜브 링크 클릭 시
        let targetMovieURL = "https://www.youtube.com/watch?v=K0mTHmOwppQ";
        window.open(targetMovieURL, '_blank');
    } else if (mouseX >= mapLeftEdge && mouseX <= mapRightEdge &&
               mouseY >= mapTopEdge && mouseY <= mapBottomEdge) {
        // where.png 클릭 시: 네이버 지도 링크 클릭 시
        let targetMapURL = "https://map.naver.com/p/entry/place/2019299014?placePath=/home?entry=plt&from=map&fromPanelNum=1&additionalHeight=76&timestamp=202511151944&locale=ko&svcName=map_pcv5&searchType=place&lng=126.9233137&lat=37.5479295&c=15.00,0,0,0,dh";
        window.open(targetMapURL, '_blank');
    } else if (mouseX >= instaLeftEdge && mouseX <= instaRightEdge && 
        mouseY >= instaTopEdge && mouseY <= instaBottomEdge) {
        // seesunsohot.png 클릭 시: 인스타그램 링크 클릭 시
        let targetURL = "https://www.instagram.com/seesunsohot/profilecard/?igsh=MW82cHN1ZnVvZzFhMw==";
        window.open(targetURL, '_blank');
    }
    else {
        // 그 외 모든 영역 클릭 시: 스케치 리셋
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

        this.assignedImage = random(allBallImages);

        this.color = color(random(150, 255), random(120, 220), random(200, 255), 255);
    }

    // ⭐⭐⭐ update 함수에 이미지 중앙 Y 좌표를 인수로 전달하여 충돌 처리 (movieY 추가) ⭐⭐⭐
    update(timeY, whereY, movieY, secondY) {
        this.vy += gravity;
        this.x += this.vx;
        this.y += this.vy;

        this.angle += this.angularVelocity;
        this.angularVelocity *= 0.99;

        // 바닥 및 벽 충돌 처리 (변경 없음)
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

        // 2. time.png와의 충돌 처리
        this.handleRectCollision(centerObjectX, timeY, currentTimeImageWidth, currentTimeImageHeight);

        // 3. where.png와의 충돌 처리
        this.handleRectCollision(centerObjectX, whereY, currentWhereImageWidth, currentWhereImageHeight);

        // ⭐⭐ 4. movie.png와의 충돌 처리 ⭐⭐
        this.handleRectCollision(centerObjectX, movieY, currentMovieImageWidth, currentMovieImageHeight);

        // 5. seesunsohot.png와의 충돌 처리 (맨 아래) 
        this.handleRectCollision(centerObjectX, secondY, currentSecondImageWidth, currentSecondImageHeight);
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
<script setup lang="ts">
import { ref, onMounted } from "vue";

// 图片资源
const IMAGES = {
  bg: "/images/bg.png",
  bird: "/images/bird.gif",
  birdStatic: "/images/bird-static.png",
  gameOver: "/images/gameover-bg.png",
  gameOverB: "/images/gameover-b-img.jpg",
  music: "/music/bg-music.mp3",
};

// 管道图片数组
const PIPE_IMAGES = [
  {
    name: "野蔷薇",
    url: "/images/pipe/yqw.png",
    realurl: "/images/realphotos/yqw.jpg",
    position: "趵突泉校区",
  },
  {
    name: "大岛樱",
    url: "/images/pipe/ddy.png",
    realurl: "/images/realphotos/ddy.jpg",
    position: "兴隆山校区",
  },
  {
    name: "紫丁香",
    url: "/images/pipe/zdx.png",
    realurl: "/images/realphotos/zdx.JPG",
    position: "兴隆山校区",
  },
  {
    name: "玉兰",
    url: "/images/pipe/yl.png",
    realurl: "/images/realphotos/yl.jpg",
    position: "中心校区",
  },
  {
    name: "海棠",
    url: "/images/pipe/ht.png",
    realurl: "/images/realphotos/ht.jpg",
    position: "兴隆山校区",
  },
  {
    name: "鸢尾",
    url: "/images/pipe/yw.png",
    realurl: "/images/realphotos/yw.jpg",
    position: "趵突泉校区",
  },
  {
    name: "美人梅",
    url: "/images/pipe/mrm.png",
    realurl: "/images/realphotos/mrm.jpg",
    position: "趵突泉校区",
  },
  {
    name: "山樱花",
    url: "/images/pipe/syh.png",
    realurl: "/images/realphotos/syh.jpg",
    position: "兴隆山校区",
  },
];

const CAMPUS = [
  {
    name: "中心校区",
    url: "/images/campus/zx.jpg",
  },
  {
    name: "兴隆山",
    url: "/images/campus/xls.jpg",
  },
  {
    name: "趵突泉",
    url: "/images/campus/btq.jpg",
  },
  {
    name: "千佛山",
    url: "/images/campus/qfs.jpg",
  },
  {
    name: "软件园",
    url: "/images/campus/rjy.jpg",
  },
  {
    name: "洪家楼",
    url: "/images/campus/hjl.jpg",
  },
];
// 校区数组
const campuses = [
  { name: "中心校区", url: "/images/campus/zx.jpg", range: [0, 270] },
  { name: "兴隆山校区", url: "/images/campus/xls.jpg", range: [271, 720] },
  { name: "趵突泉校区", url: "/images/campus/btq.jpg", range: [721, 1200] },
  { name: "千佛山校区", url: "/images/campus/qfs.jpg", range: [1201, 1800] },
  { name: "软件园校区", url: "/images/campus/rjy.jpg", range: [1801, 2300] },
  { name: "洪家楼校区", url: "/images/campus/hjl.jpg", range: [2301, 2700] },
];

// 根据 bgDis 判断当前校区
const getCurrentCampus = () => {
  const absoluteBgDis = Math.abs(bgDis.value); // 取绝对值
  for (const campus of campuses) {
    if (absoluteBgDis % 3000 >= campus.range[0] && absoluteBgDis <= campus.range[1]) {
      return campus;
    }
  }
  return campuses[0]; // 如果不在任何范围内，返回第一个校区
};
// 游戏状态
const bgDis = ref(0);
const speed = ref(0);
const isDown = ref(true);
const score = ref(0);
const gameRunning = ref(false);
const gameOverFlag = ref<{
  name: string;
  url: string;
  realurl: string;
  position: string;
} | null>(null);
const bestScore = localStorage.getItem("best") || "无";
const videoPlaying = ref(false);
// 开始界面的随机移动
const randomTop = ref(0);
const randomLeft = ref(50);
const canRetry = ref(false);
// 蝴蝶水平位置
const segment = ref(0);

setInterval(() => {
  randomTop.value = Math.floor(Math.random() * 50); // Update randomTop every second
}, 1000);

// 蝴蝶位置
const birdTop = ref(25); // 25vh
const pipes = ref<
  {
    height: number;
    left: number;
    img: { name: string; url: string; realurl: string; position: string };
  }[]
>([]);
const space = 100;
const gap = 23; // vh单位，保持比例一致
let count = 0;
let timer: ReturnType<typeof setInterval> | null = null;

// 开始游戏
const startGame = () => {
  gameRunning.value = true;
  birdTop.value = 25;
  score.value = 0;
  speed.value = 0;
  isDown.value = true;
  pipes.value = [];
  gameOverFlag.value = null;
  canRetry.value = false;
  // bgDis.value = 0;

  timer = setInterval(() => {
    bgMove();
    birdMove();
    pipeMove();
    checkCollision();
  }, 30);
};

// 结束游戏
const gameOver = (message: string) => {
  gameRunning.value = false;
  setTimeout(() => {
    canRetry.value = true;
  }, 2000);
  if (timer) clearInterval(timer);
  if (localStorage.best === undefined || +localStorage.best < score.value) {
    localStorage.best = score.value;
  }
};

// 蝴蝶移动
const birdMove = () => {
  if (birdTop.value < 0 || birdTop.value > 90) {
    segment.value = Math.floor(Math.abs(bgDis.value) / 450) + 1;
    console.log(bgDis.value);
    
    gameOver("触底了！");
    return;
  }
  speed.value += isDown.value ? 0.4 : 0.7;
  speed.value = Math.min(speed.value, 8);
  if (!isDown.value && speed.value >= 0) {
    isDown.value = true;
  }
  birdTop.value += speed.value * 0.3;
};

// 跳跃
const jump = () => {
  if (!gameRunning.value) return;
  isDown.value = false;
  speed.value = -8;
};

// 管道移动和生成
const pipeMove = () => {
  count++;
  if (count === space) {
    count = 0;
    const pipeHeight = Math.floor(Math.random() * 30) + 20; // 20-50vh
    const randomPipe =
      PIPE_IMAGES[Math.floor(Math.random() * PIPE_IMAGES.length)]; // 随机管道
    pipes.value.push({ height: pipeHeight, left: 100, img: randomPipe }); // 100vw
  }
  pipes.value = pipes.value.map((pipe) => ({ ...pipe, left: pipe.left - 1 }));
  pipes.value = pipes.value.filter((pipe) => pipe.left > -20);
};

// 碰撞检测和计分函数
const checkCollision = () => {
  for (const pipe of pipes.value) {
    if (pipe.left < 6 && pipe.left + 5 > 2) {
      if (birdTop.value < pipe.height || birdTop.value > pipe.height + gap) {
        gameOverFlag.value = pipe.img;
        gameOver(`撞上了 ${pipe.img.name}`);
        return;
      }
    }
    if (pipe.left == -15) {
      score.value++;
    }
  }
};

// 背景移动
const bgMove = () => {
  bgDis.value -= 1;
};

// 图片下载
const saveImg = () => {
  const img = document.getElementById("flower") as HTMLImageElement;
  const name = img.getAttribute("name");
  const link = document.createElement("a");
  link.href = img.src;
  link.download = name + ".jpg";
  link.click(); // 触发点击事件，下载图片
};

// 音乐播放
const playMusic = () => {
  const audio = document.getElementById("bg-music") as HTMLAudioElement;
  console.log(videoPlaying.value);

  if (audio && audio.paused) {
    audio.play();
    videoPlaying.value = !videoPlaying.value;
  } else if (audio) {
    audio.pause();
    videoPlaying.value = !videoPlaying.value;
  }
};

// 分享功能
const shareInfo = () => {
  const shareData = {
    title: "Flappy Bird",
    text:
      "我在趣味游戏《山大春日飞行》中挑战自我，获得了 " +
      bestScore +
      " 分！🎮\n快来试试你的实力吧👇👇\nhttps://flappybird.0linetekcenter.tech/",
    url: window.location.href,
  };
  navigator.clipboard
    .writeText(shareData.text)
    .then(() => {
      const toast = document.createElement("div");
      toast.textContent = "分享信息已复制！";
      toast.style.position = "fixed";
      toast.style.top = "10px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      toast.style.color = "white";
      toast.style.padding = "10px 20px";
      toast.style.borderRadius = "5px";
      toast.style.zIndex = "1000";
      document.body.appendChild(toast);

      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
    })
    .catch((err) => {
      console.error("复制失败: ", err);
    });
  // navigator.share(shareData).catch((error) => {
  //   console.error("Error sharing:", error);
  // });
};
onMounted(() => {
  bgDis.value = 0;
  document.addEventListener("keydown", jump);
  document.addEventListener("click", jump);
  //初始化音乐按钮
  const audio = document.getElementById("bg-music") as HTMLAudioElement;
  if (audio && audio.paused) {
    videoPlaying.value = false;
    console.log("音乐未播放");
    console.log(videoPlaying.value);
  }
  //预加载静态资源
  const imageElements = Object.values(IMAGES).filter(
    (url) =>
      url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".gif")
  );
  imageElements.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
  PIPE_IMAGES.forEach((pip) => {
    const img = new Image();
    img.src = pip.realurl;
  });
  campuses.forEach((campus) => {
    const img = new Image();
    img.src = campus.url;
  });
});
</script>
<template>
  <div
    class="relative w-screen h-screen overflow-hidden bg-cover"
    :style="{
      backgroundImage: `url(${IMAGES.bg})`,
      backgroundPositionX: bgDis + 'px',
    }"
  >
    <!-- 规则介绍 -->
    <!-- <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="white"
      class="bi bi-share absolute right-22 top-2 cursor-pointer z-10"
      viewBox="0 0 16 16"

    >
      <path
        d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
      />
      <path
        d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"
      />
    </svg> -->
    <!-- 分享按钮 -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="white"
      class="bi bi-share absolute right-12 top-2 cursor-pointer z-10"
      viewBox="0 0 16 16"
      @click="shareInfo"
    >
      <path
        d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
      />
    </svg>

    <!-- 音乐 -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="white"
      class="bi bi-pause-circle absolute right-2 top-2 cursor-pointer z-10"
      viewBox="0 0 16 16"
      @click="playMusic"
      v-if="videoPlaying"
    >
      <path
        d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
      />
      <path
        d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5z"
      />
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="white"
      class="bi bi-play-circle absolute right-2 top-2 cursor-pointer z-10"
      viewBox="0 0 16 16"
      @click="playMusic"
      v-else
    >
      <path
        d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
      />
      <path
        d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"
      />
    </svg>

    <audio id="bg-music" :src="IMAGES.music" loop preload="auto"></audio>
    <!-- 开始界面 -->
    <div
      v-if="!gameRunning"
      class="absolute w-full h-full flex flex-col items-center bg-[url('/images/bg(1).png')] bg-cover bg-no-repeat bg-center"
    >
      <img src="/images/onlinelogo.png" alt="OnlineIcon" class="absolute w-30 left-1 top-0" />
      <img src="/images/title.png" alt="title" class="w-2/3 md:w-1/2 mt-30 mb-10 " />
      <transition name="smooth-move">
        <img
          :src="IMAGES.bird"
          alt="蝴蝶"
          class="transition-transform ease-linear h-30 left-1/2  box"
        />
      </transition>
      <button
        @click="startGame"
        class="mt-15 px-6 py-2 bg-[#e86101] border-2 rounded shadow cursor-pointer"
      >
        <!-- <img :src="IMAGES.startBtn" alt="Start" /> -->
        <p
          style="font-family: 'ChillBitmap'; -webkit-text-stroke: 1px black"
          class="text-white text-2xl font-mibold"
        >
          开始游戏
        </p>
      </button>
      <div class="absolute bottom-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white animate-fadeover" style="font-family: 'ChillBitmap'; -webkit-text-stroke: 1px black">
        <p>点击屏幕</p>
        <p>控制蝴蝶“躲避”花柱</p>
      </div>
    </div>

    <!-- 游戏中 -->
    <div v-else>
      <!-- 计分 -->
      <div
        class="absolute top-4 left-1/2 transform -translate-x-1/2 flex h-12 w-1/2 flex-col bg-cover bg-no-repeat bg-center justify-center items-center"
      >
        <p
          style="font-family: 'ChillBitmap'"
          class="text-white text-2xl font-mibold"
        >
          当前得分：{{ score }}
        </p>
        <p
          style="font-family: 'ChillBitmap'"
          class="text-white text-2xl font-mibold"
        >
          最高得分：{{ bestScore }}
        </p>
        <!-- <img v-for="digit in score.toString().split('')" :key="digit" :src="IMAGES.digits(+digit)" class="h-10" /> -->
      </div>

      <!-- 蝴蝶 -->
      <div
        class="absolute left-[5vw] w-[70px] h-[70px] md:w-[10vw] md:h-[12vh] bg-cover bg-no-repeat transition-transform -translate-y-1/2 bg-center"
        :class="isDown ? 'animate-birddown' : 'animate-birdup'"
        :style="{ backgroundImage: `url(${IMAGES.bird})`, top: birdTop + 'vh' }"
      ></div>

      <!-- 管道 -->
      <div
        v-for="(pipe, index) in pipes"
        :key="index"
        class="absolute w-[20vw] bg-cover"
        :style="{ left: pipe.left + 'vw' }"
      >
        <!-- 上管道（翻转） -->
        <div
          class="bg-no-repeat bg-cover w-full bg-center absolute"
          :style="{
            backgroundImage: `url(${pipe.img.url})`,
            height: '60vh',
            transform: `translateY(${pipe.height - 60}vh) scaleY(-1)`,
          }"
        ></div>

        <!-- 下管道 -->
        <div
          class="bg-no-repeat bg-cover w-full bg-center absolute"
          :style="{
            backgroundImage: `url(${pipe.img.url})`,
            height: '60vh',
            transform: `translateY(${pipe.height + gap}vh)`,
          }"
        ></div>
      </div>
    </div>

    <!-- 结束界面 -->
    <div
      class="absolute w-full h-screen bg-black opacity-50 animate-fadein"
      v-if="!gameRunning && score > 0"
    ></div>
    <div
      v-if="!gameRunning && score > 0 && gameOverFlag"
      class="absolute top-1/5 w-full flex flex-col items-center animate-scalein"
    >
      <div
        class="bg-contain bg-no-repeat bg-center w-full h-[60vh] flex flex-col items-center justify-center"
        :style="{ backgroundImage: `url(${IMAGES.gameOver})` }"
      >
        <img
          :src="gameOverFlag?.realurl"
          alt="realimg"
          class="mt-1 z-10 h-1/3 rounded-md border-4 border-[#543847]"
          id="flower"
          :name="gameOverFlag.name"
        />
        <div
          class="text-white text-2xl mt-4 z-10"
          style="font-family: 'ChillBitmap'"
        >
          得分: {{ score }}
        </div>
        <div
          class="text-white text-2xl mt-4 z-10"
          style="font-family: 'ChillBitmap'"
        >
          不小心撞在: {{ gameOverFlag?.name }}
        </div>
        <div
          class="text-white text-2xl mt-4 z-10"
          style="font-family: 'ChillBitmap'"
        >
          拍摄地点: {{ gameOverFlag?.position }}
        </div>
        <div class="z-10">
          <button
            @click="saveImg"
            class="z-10 mt-6 mr-6 px-6 py-2 bg-white rounded shadow border-2 text-[16px] cursor-pointer"
            style="font-family: 'ChillBitmap'"
          >
            保存
          </button>
          <button
            :disabled="!canRetry"
            @click="startGame"
            class="z-10 mt-6 px-6 py-2 bg-white rounded shadow border-2 text-[16px] cursor-pointer"
            style="font-family: 'ChillBitmap'"
          >
            重试
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="!gameRunning && !gameOverFlag && score > 0"
      class="absolute top-1/5 w-full flex flex-col items-center animate-scalein"
    >
      <div
        class="bg-contain bg-no-repeat bg-center w-full h-[60vh] flex flex-col items-center justify-center"
        :style="{ backgroundImage: `url(${IMAGES.gameOver})` }"
      >
        <img
          :src="getCurrentCampus().url"
          alt="realimg"
          class="mt-1 z-10 h-1/3 rounded-md border-4 border-[#543847]"
          id="flower"
          :name="getCurrentCampus().name"
        />
        <div
          class="text-white text-2xl mt-4 z-10"
          style="font-family: 'ChillBitmap'"
        >
          <!-- 您坠落在了{{ CAMPUS[segment].name }} -->
          您坠落在了{{ getCurrentCampus().name }}
        </div>
        <div class="z-10 mt-10">
          <button
            @click="saveImg"
            class="z-10 mt-6 mr-6 px-6 py-2 bg-white rounded shadow border-2 text-[16px] cursor-pointer"
            style="font-family: 'ChillBitmap'"
          >
            保存
          </button>

          <button
            @click="startGame"
            class="z-10 mt-6 px-6 py-2 bg-white rounded shadow border-2 text-[16px] cursor-pointer"
            style="font-family: 'ChillBitmap'"
            :disabled="!canRetry"
          >
            重试
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes birddown {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(20deg);
  }
}

@keyframes birdup {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(-20deg);
  }
}

.animate-birddown {
  animation: birddown 0.1s linear infinite;
}

.animate-birdup {
  animation: birdup 0.1s linear infinite;
}
@keyframes fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 0.7;
  }
}
@keyframes scalein {
  0% {
    opacity: 0;
    scale: 0.7;
  }
  100% {
    opacity: 1;
    scale: 1;
  }
}
@keyframes fadeover {
  0%,100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.animate-fadein {
  animation: fade 0.5s forwards;
}
.animate-scalein {
  animation: scalein 0.5s forwards;
}
.animate-fadeover {
  animation: fadeover 2s infinite;
}
</style>

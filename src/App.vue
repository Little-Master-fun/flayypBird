<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { sendScore, verifyDataHash } from '@/utils/crypto'

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
    name: "海棠",
    url: "/images/pipe/ht.png",
    realurl: "/images/realphotos/ht-1.jpg",
    position: "千佛山校区",
  },
  {
    name: "海棠",
    url: "/images/pipe/ht.png",
    realurl: "/images/realphotos/ht-2.jpg",
    position: "洪家楼校区",
  },
  {
    name: "海棠",
    url: "/images/pipe/ht.png",
    realurl: "/images/realphotos/ht-3.jpg",
    position: "洪家楼校区",
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
    position: "软件园校区",
  },
  {
    name: "山樱花",
    url: "/images/pipe/syh.png",
    realurl: "/images/realphotos/syh-1.jpg",
    position: "洪家楼校区",
  },
  {
    name: "樱花",
    url: "/images/pipe/syh.png",
    realurl: "/images/realphotos/yh-1.jpg",
    position: "软件园校区",
  },
  {
    name: "樱花",
    url: "/images/pipe/syh.png",
    realurl: "/images/realphotos/yh-2.jpg",
    position: "软件园校区",
  },
  {
    name: "樱花",
    url: "/images/pipe/syh.png",
    realurl: "/images/realphotos/yh-3.jpg",
    position: "软件园校区",
  },
  {
    name: "郁金香",
    url: "/images/pipe/yjx.png",
    realurl: "/images/realphotos/yjx.jpg",
    position: "威海校区",
  },
  {
    name: "迎春",
    url: "/images/pipe/yc.png",
    realurl: "/images/realphotos/yc.jpg",
    position: "青岛校区",
  },
];

// 校区数组
const campuses = [
  { name: "中心校区", url: ["/images/campus/zx.jpg"], range: [0, 9.12] },
  { name: "洪家楼校区", url: ["/images/campus/hjl.jpg"], range: [9.13, 20.60] },
  { name: "兴隆山校区", url: ["/images/campus/xls.jpg"], range: [20.61, 34.20] },
  { name: "趵突泉校区", url: ["/images/campus/btq.jpg"], range: [34.21, 50.00] },
  { name: "千佛山校区", url: ["/images/campus/qfs.jpg"], range: [50.01, 68.34] },
  { name: "软件园校区", url: ["/images/campus/rjy.jpg"], range: [68.35, 84.00] },
  {
    name: "威海校区",
    url: ["/images/campus/wh-1.jpg"],
    range: [84.01, 90.65],
  },
  {
    name: "青岛校区",
    url: [
      "/images/campus/qd-1.jpg"
      // "/images/campus/wh-2.jpg",
      // "/images/campus/wh-3.jpg",
    ],
    range: [90.65, 100]
  },
];



const calculateBackgroundWidth = () => {
  const screenHeight = window.innerHeight; // 获取设备屏幕的高
  const aspectRatio = 2250 / 500; // 背景图片的宽高比
  const backgroundWidth = screenHeight * aspectRatio; // 根据屏幕高度计算背景图片的宽度
  return backgroundWidth;
};

const bgWidth = calculateBackgroundWidth();

const getRandomIndex = <T>(arr: T[]): T | undefined => {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
};
const rank = ref<
  Array<{
    rank: number;
    name: string;
    score: number;
  }>
>([]);

// 根据 bgDis 判断当前校区
const getCurrentCampus = () => {

  const modDis = Math.abs(bgDis.value) % bgWidth; // 统一模值，用于循环滚动匹配
  for (const campus of campuses) {
    if (modDis / bgWidth * 100 >= campus.range[0] && modDis / bgWidth * 100 <= campus.range[1]) {
      console.log(modDis / bgWidth * 100);
      
      return campus;
    }
  }
  return campuses[0]; // fallback
};
// 游戏状态
const bgDis = ref(0);
const speed = ref(0);
const isDown = ref(true);
const score = ref(0);
const gameRunning = ref(false);
const rankShow = ref(false);
const gameOverFlag = ref<{
  name: string;
  url: string;
  realurl: string;
  position: string;
} | null>(null);
const bestScore = ref(localStorage.getItem("bestScore") || "无");
const videoPlaying = ref(false);
// 开始界面的随机移动
const randomTop = ref(0);
const randomLeft = ref(50);
const canRetry = ref(false);
// 蝴蝶水平位置
const segment = ref(0);
const userRank = ref<{
  rank: number;
  name: string;
  id: string;
  score: number;
  session: string;
} | null>(null);
const prizes = ["帆布包", "手机支架"];
const userPrize = ref<string | null>(null);
const rankStatus = ref(true);
const board = ref(true);
// 排行榜状态
axios
  .get("/api//b3a5f6426379443ebf9322a0a3040215/leaderboard_status")
  .then((response) => {
    rankStatus.value = response.data;
  });
axios.get("api/player").then((response) => {
  userRank.value = response.data;
});

const getUserRank = async () => {
  // const res = (await axios.get("api/player")).data;
  // console.log(await verifyDataHash(res.data, res.hash));
  
  
  // if (await verifyDataHash(res.data, res.hash)) {
  //   userRank.value = res.data.data;
  //   console.log("finish");
    
  // }
  userRank.value = (await axios.get("api/player")).data.data;
  
};

const getPrize = async() => {
  getUserRank();
  if (userRank.value && userRank.value.rank <= 5) {
    userPrize.value = prizes[0];
  } else if (userRank.value && userRank.value.rank <= 30) {
    userPrize.value = prizes[1];
  } else {
    userPrize.value = null;
  }
};



setInterval(() => {
  randomTop.value = Math.floor(Math.random() * 50); 
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
const space = ref(100);
const gap = ref(23); // vh单位，保持比例一致
let count = 0;
let timer: ReturnType<typeof setInterval> | null = null;

// 开始游戏
const startGame = () => {
  gameRunning.value = true;
  space.value = 100;
  gap.value = 23;
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
// 显示排行榜
const showRank = async () => {
  rank.value = (await axios.get("api/leaderboard")).data.data;  
  getUserRank();
  
  // userRank.value = (await axios.get("https://flappybird.0linetekcenter.tech/api/player")).data;
  // rank.value = (await (axios.get("https://flappybird.0linetekcenter.tech/api/leaderboard"))).data;
  rankShow.value = true;
};

// 结束游戏
const gameOver = async(message: string) => {
  gameRunning.value = false;
  setTimeout(() => {
    canRetry.value = true;
  }, 2000);
  if (timer) clearInterval(timer);

  //localStorage.bestScore === undefined || localStorage.bestScore < score.value
  if (localStorage.bestScore === undefined || localStorage.bestScore < score.value) {
    localStorage.bestScore = score.value;
    bestScore.value = score.value.toString();
    // 更新session
    await getUserRank();
    
    const data = {
      score: Number(bestScore.value),
      session: userRank.value?.session || '',
    };    
    sendScore(data)
      .then((response) => {
        console.log("分数上传成功", response);
      })
      .catch((error) => {
        console.error("分数上传失败", error);
      });
  }
};




// 蝴蝶移动
const birdMove = () => {
  if (birdTop.value < 0 || birdTop.value > 90) {
    segment.value = Math.floor(Math.abs(bgDis.value) / 450) + 1;
    const modDis = Math.abs(bgDis.value) % bgWidth; // 统一模值，用于循环滚动匹配
    console.log(modDis / bgWidth * 100);

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
  if (count === space.value) {
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
      if (
        birdTop.value < pipe.height ||
        birdTop.value > pipe.height + gap.value
      ) {
        gameOverFlag.value = pipe.img;
        gameOver(`撞上了 ${pipe.img.name}`);
        return;
      }
    }
    if (pipe.left == -15) {
      score.value++;
      if (score.value % 5 === 0) {
        // 每5分增加一次管道速度
        space.value = Math.max(56, space.value - 5);
        console.log(space.value);

        // console.log("管道速度增加");
        gap.value = Math.max(20.5, gap.value - 0.2);
      }
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
  const score = localStorage.getItem("bestScore") || 0;
  const shareData = {
    title: "Flappy Bird",
    text:
      "我在趣味游戏《山大春日飞行》中挑战自我，获得了 " +
      score +
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

window.onload = () => {
  // 预加载静态资源
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
    img.src = pip.url;
  });
  PIPE_IMAGES.forEach((pip) => {
    const img = new Image();
    img.src = pip.realurl;
  });
  campuses.forEach((campus) => {
    const img = new Image();
    campus.url.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  });
};

onMounted(() => {
  bgDis.value = 0;
  document.addEventListener("keydown", jump);
  document.addEventListener("click", jump);
  //初始化音乐按钮
  const audio = document.getElementById("bg-music") as HTMLAudioElement;
  setTimeout(() => {
    if (audio && audio.paused) {
      playMusic();
    }
  }, 1000);
  getPrize();
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
      v-if="!videoPlaying"
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

    <audio
      id="bg-music"
      :src="IMAGES.music"
      loop
      autoplay
      preload="auto"
    ></audio>
    <!-- 排行榜 -->
    <div
      class="bg- w-full h-screen flex flex-col items-center animate-fadein-r"
      v-if="rankShow"
    >
      <!-- 返回箭头 -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="white"
        class="bi bi-arrow-left absolute left-2 top-2 cursor-pointer z-20"
        viewBox="0 0 16 16"
        @click="rankShow = false"
      >
        <path
          fill-rule="evenodd"
          d="M11.3 1.3a1 1 0 0 1 0 1.4L5.4 8l5.9 5.3a1 1 0 0 1-1.4 1.4l-7-6.3a1 1 0 0 1 0-1.4l7-6.3a1 1 0 0 1 1.4 0z"
        />
      </svg>
      <img src="/images/campus.png" alt="奖杯" class="w-2/3 md:w-1/2 mb-10" />
      <div
        class="overflow-y-auto h-[60vh] w-[80vw] bg-[#F4E7D5] rounded-lg"
        style="font-family: 'ChillBitmap'"
      >
        <div class="w-full h-[52vh] overflow-y-auto relative">
          <table class="w-full text-center">
            <thead>
              <tr>
                <th class="p-2">排名</th>
                <th class="p-2">姓名</th>
                <th class="p-2">分数</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in rank"
                :key="index"
                :class="{ 'bg-[#e8cdab]': item.rank === userRank?.rank }"
              >
                <td class="p-2">{{ index + 1 }}</td>
                <td class="p-2">{{ item.name }}</td>
                <td class="p-2">{{ item.score }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td></td>
                <td class="pt-2">当前只展示前30名哦~</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="bg-[#e8cdab] h-[8vh] flex items-center justify-around">
          <p>{{ userRank && userRank.rank !== null ? userRank.rank : "无" }}</p>
          <p>{{ userRank?.name }}</p>
          <p>{{ userRank?.score }}</p>
        </div>
      </div>
    </div>

    <!-- 开始界面 -->
    <div
      v-if="!gameRunning"
      class="absolute w-full h-full flex flex-col bg-bottom items-center bg-[url('/images/bg_1.png')] bg-cover bg-no-repeat "
    >
      <img
        src="/images/onlinelogo.png"
        alt="OnlineIcon"
        class="absolute w-30 left-1 top-0"
      />
      <img
        src="/images/title.png"
        alt="title"
        class="w-2/3 md:w-1/2 mt-30 mb-10"
      />
      <transition name="smooth-move">
        <img
          :src="IMAGES.bird"
          alt="蝴蝶"
          class="transition-transform ease-linear h-30 left-1/2 box"
        />
      </transition>
      <button
        @click="startGame"
        class="mt-10 px-6 py-2 bg-[#e86101] border-2 rounded shadow cursor-pointer w-[150px]"
      >
        <!-- <img :src="IMAGES.startBtn" alt="Start" /> -->
        <p
          style="font-family: 'ChillBitmap'; -webkit-text-stroke: 1px black"
          class="text-white text-2xl font-mibold"
        >
          开始游戏
        </p>
      </button>
      <button
        @click="showRank"
        class="mt-5 px-6 py-2 bg-[#e86101] border-2 rounded shadow cursor-pointer w-[150px] "
      >
        <!-- <img :src="IMAGES.startBtn" alt="Start" /> -->
        <p
          style="font-family: 'ChillBitmap'; -webkit-text-stroke: 1px black"
          class="text-white text-2xl font-mibold"
        >
          排行榜
        </p>
      </button>
      <div
        class="absolute bottom-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white animate-fadeover"
        style="font-family: 'ChillBitmap'; -webkit-text-stroke: 1px black"
      >
        <p>点击屏幕</p>
        <p>控制蝴蝶“躲避”花柱</p>
      </div>
    </div>
    <!-- 游戏中 -->
    <div v-else>
      <!-- 计分 -->
      <div
      class="absolute w-full h-full flex flex-col items-center bg-bottom bg-no-repeat bg-contain sm:bg-contain"      >
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
    >
      <!-- 返回箭头 -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="white"
        class="bi bi-arrow-left absolute left-2 top-2 cursor-pointer z-20"
        viewBox="0 0 16 16"
        @click="score = 0"
      >
        <path
          fill-rule="evenodd"
          d="M11.3 1.3a1 1 0 0 1 0 1.4L5.4 8l5.9 5.3a1 1 0 0 1-1.4 1.4l-7-6.3a1 1 0 0 1 0-1.4l7-6.3a1 1 0 0 1 1.4 0z"
        />
      </svg>
    </div>
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
          :src="getRandomIndex(getCurrentCampus().url)"
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
          您降落在了{{ getCurrentCampus().name }}
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
    <div
      class="absolute w-full h-screen bg-black opacity-50 animate-fadein"
      v-if="userPrize && !rankStatus && board"
    >
      <!-- 返回箭头 -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="white"
        class="bi bi-arrow-left absolute left-2 top-2 cursor-pointer z-20"
        viewBox="0 0 16 16"
        @click="board = false"
      >
        <path
          fill-rule="evenodd"
          d="M11.3 1.3a1 1 0 0 1 0 1.4L5.4 8l5.9 5.3a1 1 0 0 1-1.4 1.4l-7-6.3a1 1 0 0 1 0-1.4l7-6.3a1 1 0 0 1 1.4 0z"
        />
      </svg>
    </div>

    <div
      class="absolute top-1/5 w-full flex flex-col items-center animate-scalein"
      v-if="userPrize && !rankStatus && board"
    >
      <div
        class="bg-contain bg-no-repeat bg-center w-full h-[60vh] flex flex-col items-center justify-center"
        :style="{ backgroundImage: `url(${IMAGES.gameOver})` }"
      >
        <div
          class="text-white text-2xl mt-4 z-10 break-words w-[65vw] overflow-y-auto h-[50vh]"
          style="font-family: 'ChillBitmap'"
        >
          <!-- 您坠落在了{{ CAMPUS[segment].name }} -->
          <p class="mb-3">恭喜你获得{{ userPrize }}</p>
          <p class="mb-3">请在领奖时出示排行榜截图</p>
          <p class="mb-3">
            领取地点：中心校区八号楼负一山东大学学生工作数智赋能中心前台
          </p>
          <p class="mb-3">领奖时间：4月26日-4月29日（早八晚十除午休时间段）</p>
          <p class="mb-3">
            如需邮寄请将排行榜截图与收货人信息于4月28日晚十点前发送至sddxxszx@163.com
          </p>
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
@keyframes fadein {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
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
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.animate-fadein {
  animation: fade 0.5s forwards;
}
.animate-fadein-r {
  animation: fadein 0.5s forwards;
}
.animate-scalein {
  animation: scalein 0.5s forwards;
}
.animate-fadeover {
  animation: fadeover 2s infinite;
}
</style>

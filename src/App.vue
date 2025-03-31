<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 图片资源
const IMAGES = {
  bg: '/images/bg.png',
  bird: '/images/bird.gif',
  birdStatic: '/images/bird-static.png',
  head: '/img/head.png',
  gameOver: '/images/gameover-bg.png',
  gameOverB: '/images/gameover-b-img.jpg',
  music: '/music/bg-music.mp3',
}

// 管道图片数组
const PIPE_IMAGES = [
  {
    name: '野蔷薇',
    url: '/images/pipe/yqw.png',
    realurl: '/images/realphotos/yqw.jpg',
    position: '趵突泉',
  },
  {
    name: '大岛樱',
    url: '/images/pipe/ddy.png',
    realurl: '/images/realphotos/ddy.jpg',
    position: '兴隆山',
  },
  {
    name: '紫丁香',
    url: '/images/pipe/zdx.png',
    realurl: '/images/realphotos/zdx.JPG',
    position: '兴隆山',
  },
  {
    name: '玉兰',
    url: '/images/pipe/yl.png',
    realurl: '/images/realphotos/yl.jpg',
    position: '中心校区',
  },
  {
    name: '海棠',
    url: '/images/pipe/ht.png',
    realurl: '/images/realphotos/ht.jpg',
    position: '兴隆山',
  },
  {
    name: '鸢尾',
    url: '/images/pipe/yw.png',
    realurl: '/images/realphotos/yw.jpg',
    position: '趵突泉',
  },
  {
    name: '美人梅',
    url: '/images/pipe/mrm.png',
    realurl: '/images/realphotos/mrm.jpg',
    position: '趵突泉',
  },
  {
    name: '山樱花',
    url: '/images/pipe/syh.png',
    realurl: '/images/realphotos/syh.jpg',
    position: '兴隆山',
  },
]

// 游戏状态
const bgDis = ref(0)
const speed = ref(0)
const isDown = ref(true)
const score = ref(0)
const gameRunning = ref(false)
const gameOverFlag = ref<{ name: string; url: string; realurl: string; position: string } | null>(
  null,
)
const bestScore = localStorage.getItem('best') || '无'

// 开始界面的随机移动
const randomTop = ref(Math.floor(Math.random() * 50))
const randomLeft = ref(Math.floor(Math.random() * 50) + 25)

setInterval(() => {
  randomTop.value = Math.floor(Math.random() * 50) // Update randomTop every second
  randomLeft.value = Math.floor(Math.random() * 100) + 0 // Update randomLeft every second
}, 1000)

// 小鸟位置
const birdTop = ref(25) // 25vh
const pipes = ref<
  {
    height: number
    left: number
    img: { name: string; url: string; realurl: string; position: string }
  }[]
>([])
const space = 100
const gap = 20 // vh单位，保持比例一致
let count = 0
let timer: ReturnType<typeof setInterval> | null = null

// 开始游戏
const startGame = () => {
  gameRunning.value = true
  birdTop.value = 25
  score.value = 0
  speed.value = 0
  isDown.value = true
  pipes.value = []
  gameOverFlag.value = null

  timer = setInterval(() => {
    bgMove()
    birdMove()
    pipeMove()
    checkCollision()
  }, 30)
}

// 结束游戏
const gameOver = (message: string) => {
  gameRunning.value = false
  console.log(`💀 游戏结束: ${message}`)
  if (timer) clearInterval(timer)
  if (localStorage.best === undefined || +localStorage.best < score.value) {
    localStorage.best = score.value
  }
}

// 蝴蝶移动
const birdMove = () => {
  if (birdTop.value < 0 || birdTop.value > 90) {
    gameOver('小鸟触底了！')
    return
  }
  speed.value += isDown.value ? 0.4 : 0.7
  speed.value = Math.min(speed.value, 8)
  if (!isDown.value && speed.value >= 0) {
    isDown.value = true
  }
  birdTop.value += speed.value * 0.3
}

// 跳跃
const jump = () => {
  if (!gameRunning.value) return
  isDown.value = false
  speed.value = -8
}

// 管道移动和生成
const pipeMove = () => {
  count++
  if (count === space) {
    count = 0
    const pipeHeight = Math.floor(Math.random() * 30) + 20 // 20-50vh
    const randomPipe = PIPE_IMAGES[Math.floor(Math.random() * PIPE_IMAGES.length)] // **随机管道**
    pipes.value.push({ height: pipeHeight, left: 100, img: randomPipe }) // 100vw
  }
  pipes.value = pipes.value.map((pipe) => ({ ...pipe, left: pipe.left - 1 }))
  pipes.value = pipes.value.filter((pipe) => pipe.left > -20)
}

// 碰撞检测和计分函数
const checkCollision = () => {
  for (const pipe of pipes.value) {
    if (pipe.left < 6 && pipe.left + 5 > 2) {
      if (birdTop.value < pipe.height || birdTop.value > pipe.height + gap) {
        gameOverFlag.value = pipe.img
        console.log(gameOverFlag.value)
        gameOver(`撞上了 ${pipe.img.name}`)
        return
      }
    }
    if (pipe.left == -15) {
      score.value++
    }
  }
}

// 背景移动
const bgMove = () => {
  bgDis.value -= 1
}

// 图片下载
const saveImg = () => {
  const img = document.getElementById('flower') as HTMLImageElement
  const name = img.getAttribute('name')
  const link = document.createElement('a') // 创建一个 <a> 标签
  link.href = img.src // 设置图片的 URL 为 <a> 标签的 href
  link.download = name + '.jpg' // 设置下载的文件名
  link.click() // 触发点击事件，下载图片
}

// 音乐播放
const playMusic = () => {
  const audio = document.getElementById('bg-music') as HTMLAudioElement
  if (audio && audio.paused) {
    audio.play()
  } else if (audio) {
    audio.pause()
  }
}

onMounted(() => {
  document.addEventListener('keydown', jump)
  document.addEventListener('click', jump)
})
</script>

<template>
  <div
    class="relative w-screen h-screen overflow-hidden bg-cover"
    :style="{ backgroundImage: `url(${IMAGES.bg})`, backgroundPositionX: bgDis + 'px' }"
  >
    <!-- 音乐 -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="white"
      class="bi bi-play-circle absolute right-2 top-2 cursor-pointer z-10"
      viewBox="0 0 16 16"
      @click="playMusic"
    >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
      <path
        d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"
      />
    </svg>
    <audio id="bg-music" :src="IMAGES.music" autoplay loop preload="auto"></audio>
    <!-- 开始界面 -->
    <div
      v-if="!gameRunning"
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      <transition name="smooth-move">
        <img
          :src="IMAGES.bird"
          alt="胡得"
          class="absolute transition-transform ease-linear h-30"
          :style="{
            top: randomTop + 'vh',
            left: randomLeft + 'vw',
            transform: `rotate(${randomLeft > 50 ? 15 : -15}deg)`,
          }"
          style="transition: 3s"
        />
      </transition>
      <div
        class="w-[40vw] h-[15vh] bg-contain"
        :style="{ backgroundImage: `url(${IMAGES.head})` }"
      ></div>
      <button @click="startGame" class="mt-6 px-6 py-2 bg-[#e86101] border-2 rounded shadow">
        <!-- <img :src="IMAGES.startBtn" alt="Start" /> -->
        <p
          style="font-family: 'ChillBitmap'; -webkit-text-stroke: 1px black"
          class="text-white text-2xl font-mibold"
        >
          开始游戏
        </p>
      </button>
    </div>

    <!-- 游戏中 -->
    <div v-else>
      <!-- 计分 -->
      <div
        class="absolute top-4 left-1/2 transform -translate-x-1/2 flex h-12 w-1/2 flex-col bg-cover bg-no-repeat bg-center justify-center items-center"
      >
        <p style="font-family: 'ChillBitmap'" class="text-white text-2xl font-mibold">
          当前得分：{{ score }}
        </p>
        <p style="font-family: 'ChillBitmap'" class="text-white text-2xl font-mibold">
          最高得分：{{ bestScore }}
        </p>
        <!-- <img v-for="digit in score.toString().split('')" :key="digit" :src="IMAGES.digits(+digit)" class="h-10" /> -->
      </div>

      <!-- 蝴蝶 -->
      <div
        class="absolute left-[5vw] w-[5vw] h-[5vh] bg-cover bg-no-repeat transition-transform"
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
            transform: `translateY(${pipe.height - 60}vh)`,
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
      v-if="!gameRunning && score > 0 && gameOverFlag"
      class="absolute top-1/5 w-full flex flex-col items-center"
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
        <div class="text-white text-2xl mt-4 z-10" style="font-family: 'ChillBitmap'">
          得分: {{ score }}
        </div>
        <div class="text-white text-2xl mt-4 z-10" style="font-family: 'ChillBitmap'">
          不小心撞在: {{ gameOverFlag?.name }}
        </div>
        <div class="text-white text-2xl mt-4 z-10" style="font-family: 'ChillBitmap'">
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
            @click="startGame"
            class="z-10 mt-6 px-6 py-2 bg-white rounded shadow border-2 text-[16px] cursor-pointer"
            style="font-family: 'ChillBitmap'"
          >
            重试
          </button>
        </div>
      </div>
      <!-- <img :src="IMAGES.gameOver" alt="Game Over" class="absolute h-[50vh] bg-cover" /> -->
    </div>
    <div
      v-if="!gameRunning && !gameOverFlag && score > 0"
      class="absolute top-1/5 w-full flex flex-col items-center"
    >
      <div
        class="bg-contain bg-no-repeat bg-center w-full h-[60vh] flex flex-col items-center justify-center "
        :style="{ backgroundImage: `url(${IMAGES.gameOver})` }"
      >
        <img
          :src="IMAGES.gameOverB"
          alt="realimg"
          class="mt-1 z-10 h-1/3 rounded-md border-4 border-[#543847]"
        />
        <div class="text-white text-2xl mt-4 z-10" style="font-family: 'ChillBitmap'">
          不小心触底啦！！
        </div>
        <div class="z-10">
          <button
            @click="startGame"
            class="z-10 mt-6 px-6 py-2 bg-white rounded shadow border-2 text-[16px] cursor-pointer"
            style="font-family: 'ChillBitmap'"
          >
            重试
          </button>
        </div>
      </div>
      <!-- <img :src="IMAGES.gameOver" alt="Game Over" class="absolute h-[50vh] bg-cover" /> -->
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
</style>

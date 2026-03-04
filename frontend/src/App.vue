<template>
  <div style="max-width: 920px; margin: 32px auto; font-family: system-ui;">
    <h1 style="margin-bottom: 8px;">Mini Streaming (Step1)</h1>
    <p style="margin-top: 0; color: #666;">
      MP4をHTTPで配信して、Vueのvideoタグで再生する最小構成
    </p>

    <div style="display: flex; gap: 16px; align-items: flex-start; margin-top: 16px;">
      <div style="min-width: 240px;">
        <h3 style="margin: 0 0 8px;">Videos</h3>

        <div v-if="loading">loading...</div>
        <div v-else-if="error" style="color: #c00;">{{ error }}</div>

        <ul v-else style="padding-left: 16px; margin: 0;">
          <li v-for="v in videos" :key="v.id" style="margin-bottom: 8px;">
            <button
              @click="select(v)"
              :style="{
                cursor: 'pointer',
                padding: '8px 10px',
                borderRadius: '10px',
                border: selected?.id === v.id ? '2px solid #111' : '1px solid #ccc',
                background: selected?.id === v.id ? '#f2f2f2' : '#fff'
              }"
            >
              ▶ {{ v.title }}
            </button>
          </li>
        </ul>
      </div>

      <div style="flex: 1;">
        <h3 style="margin: 0 0 8px;">Player</h3>

        <div v-if="!selected" style="color:#666;">左から動画を選んでね</div>

        <div v-else>
          <div style="margin-bottom: 8px; color: #666;">
            Now playing: <b>{{ selected.title }}</b>
          </div>

          <video
            :src="videoUrl(selected.url)"
            controls
            playsinline
            style="width: 100%; border-radius: 16px; border: 1px solid #ddd; background: #000;"
          ></video>

          <div style="margin-top: 8px; font-size: 12px; color:#666;">
            src: {{ videoUrl(selected.url) }}
          </div>
          <div style="margin-top: 8px; font-size: 12px; color:#666;">
            {{ selected.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const videos = ref([]);
const selected = ref(null);
const loading = ref(false);
const error = ref("");

function videoUrl(path) {
  // backend の /static を、フロントからは /api 経由で叩く（proxyでbackendへ）
  // → ブラウザ的には同一オリジン扱いになって楽
  return `/api${path}`;
}

function select(v) {
  selected.value = v;
}

onMounted(async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetch("/api/videos");
    if (!res.ok) throw new Error(`failed: ${res.status}`);
    videos.value = await res.json();
  } catch (e) {
    error.value = e?.message ?? "unknown error";
  } finally {
    loading.value = false;
  }
});
</script>
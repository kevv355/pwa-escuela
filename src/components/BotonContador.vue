<script setup>
import { ref } from 'vue'
const contador = ref(0)
</script>
<template>
  <div id="app">
    <button @click="contador++">Click me please :3</button>
    Haz dado esta cantidad de clicks {{ contador }} al boton.
    {{ message }}
  </div>
</template>

<style scoped>
#app {
  text-align: center;
  margin-top: 50px;
  font-family: Arial, sans-serif;
}

button {
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background-color: #42b883;
  color: white;
}

button:hover {
  background-color: #369b6d;
}

p {
  font-size: 18px;
  margin-top: 20px;
}
</style>

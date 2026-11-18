
<script setup>
import { ref, computed, watch } from 'vue'

defineProps({
  titulo: String
})

// VARIABLES PARA LAS TAREAS
const nuevaTarea = ref('')
const tareas = ref([])
const filtro = ref('todas')
const CLAVE_TAREAS = 'misTareas'
const tareaEditando = ref(null)
const textoEditado = ref('')

// VARIABLES DE LA API DE TAREAS
const tareasExistentes = ref([])
const cargando = ref(false)
const error = ref('')

// VARIABLES DEL BUSCADOR DE MÚSICA JAMENDO
const mostrarReproductor = ref(true)
const busquedaMusica = ref('')
const canciones = ref([])
const cancion = ref(null)
const cargandoCancion = ref(false)
const errorCancion = ref('')
const CLIENT_ID = 'TU_CLIENT_ID_DE_JAMENDO'

// GUARDAR AUTOMÁTICAMENTE LAS TAREAS
watch(tareas, (nuevasTareas) => {
  localStorage.setItem(CLAVE_TAREAS, JSON.stringify(nuevasTareas))
}, {
  deep: true
})

// IMPORTAR TAREAS DE LA API
function importarTareas() {
  const tareasConvertidas = tareasExistentes.value.map(tarea => ({
    id: crypto.randomUUID(),
    titulo: tarea.title,
    completada: tarea.completed
  }))

  tareas.value.push(...tareasConvertidas)
}

// GUARDAR TAREAS
function guardarTareas() {
  localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas.value))
}

// CARGAR TAREAS
function cargarTareas() {
  const datosGuardados = localStorage.getItem(CLAVE_TAREAS)

  if (datosGuardados) {
    try {
      tareas.value = JSON.parse(datosGuardados)
    } catch (err) {
      console.error('Error al cargar las tareas:', err)
      tareas.value = []
    }
  }
}

// CARGAR AL INICIAR
cargarTareas()

// EDITAR TAREA
function editarTarea(tarea) {
  tareaEditando.value = tarea.id
  textoEditado.value = tarea.titulo
}

// GUARDAR EDICIÓN
function guardarEdicion(tarea) {
  const nuevoTitulo = textoEditado.value.trim()

  if (!nuevoTitulo) return

  tarea.titulo = nuevoTitulo
  guardarTareas()

  tareaEditando.value = null
  textoEditado.value = ''
}

// CANCELAR EDICIÓN
function cancelarEdicion() {
  tareaEditando.value = null
  textoEditado.value = ''
}

// FILTRAR TAREAS
const tareasFiltradas = computed(() => {
  if (filtro.value === 'pendientes') {
    return tareas.value.filter(t => !t.completada)
  }

  if (filtro.value === 'completada') {
    return tareas.value.filter(t => t.completada)
  }

  return tareas.value
})

// CONTADORES
const tareasPendientes = computed(() => {
  return tareas.value.filter(t => !t.completada).length
})

const tareasCompletadas = computed(() => {
  return tareas.value.filter(t => t.completada).length
})

// AGREGAR TAREA
function agregarTarea() {
  const titulo = nuevaTarea.value.trim()

  if (!titulo) return

  tareas.value.push({
    id: crypto.randomUUID(),
    titulo,
    completada: false
  })

  nuevaTarea.value = ''
  guardarTareas()
}

// CAMBIAR ESTADO
function cambiarEstado(id) {
  const tarea = tareas.value.find(t => t.id === id)

  if (tarea) {
    tarea.completada = !tarea.completada
    guardarTareas()
  }
}

// ELIMINAR TAREA
function eliminarTarea(id) {
  tareas.value = tareas.value.filter(t => t.id !== id)

  if (tareaEditando.value === id) {
    cancelarEdicion()
  }

  guardarTareas()
}

// ELIMINAR TODAS LAS TAREAS
function eliminarTodas() {
  if (tareas.value.length === 0) return

  const confirmar = confirm(
    '¿Estás seguro de que quieres borrar todas las tareas?'
  )

  if (!confirmar) return

  tareas.value = []
  tareaEditando.value = null
  textoEditado.value = ''

  guardarTareas()
}

// CONSULTAR API DE TAREAS
async function obtenerDatos() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await fetch(
      'https://jsonplaceholder.typicode.com/todos?_limit=5'
    )

    if (!respuesta.ok) {
      throw new Error('Error al consultar la API')
    }

    const datos = await respuesta.json()

    tareasExistentes.value = datos

    console.table(datos)

  } catch (err) {
    error.value = 'No fue posible recuperar las tareas'
    console.error(err)

  } finally {
    cargando.value = false
  }
}

// BUSCAR CANCIONES EN JAMENDO
async function obtenerCancion() {
  const termino = busquedaMusica.value.trim()

  if (!termino) {
    errorCancion.value = 'Escribe el nombre de una canción o artista'
    return
  }

  cargandoCancion.value = true
  errorCancion.value = ''
  canciones.value = []
  cancion.value = null

  try {
    // COLOCA AQUÍ TU CLIENT ID DE JAMENDO
    const CLIENT_ID = '9f77b7b3'

    const parametros = new URLSearchParams({
      client_id: CLIENT_ID,
      format: 'json',
      search: termino,
      limit: '20',
      audioformat: 'mp32',
      imagesize: '200'
    })

    const respuesta = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?${parametros}`
    )

    if (!respuesta.ok) {
      throw new Error('Error al consultar Jamendo')
    }

    const datos = await respuesta.json()

    if (datos.headers.status !== 'success') {
      throw new Error('No se pudieron obtener las canciones')
    }

    canciones.value = (datos.results || []).filter(
      item => item.audio
    )

    if (canciones.value.length === 0) {
      errorCancion.value =
        'No se encontraron canciones. Intenta con otra búsqueda.'
    }

    console.log('Canciones encontradas:', canciones.value)

  } catch (err) {
    errorCancion.value =
      'No fue posible buscar música. Intenta nuevamente.'

    console.error('Error de música:', err)

  } finally {
    cargandoCancion.value = false
  }
}

// SELECCIONAR CANCIÓN
function seleccionarCancion(item) {
  cancion.value = item
  errorCancion.value = ''
}

// DETECTAR ERRORES DEL REPRODUCTOR
function errorReproduccion() {
  errorCancion.value =
    'No se pudo reproducir esta canción. Intenta con otra.'
}
</script>

<template>
  <div class="mx-auto mt-10 max-w-md rounded-xl bg-white p-6 shadow-lg">

    <!-- FILTROS -->
    <div class="mb-6 flex gap-2">

      <button
        v-for="opcion in [
          { valor: 'todas', texto: 'Todas' },
          { valor: 'pendientes', texto: 'Pendientes' },
          { valor: 'completada', texto: 'Completadas' }
        ]"
        :key="opcion.valor"
        type="button"
        @click="filtro = opcion.valor"
        :class="[
          'w-full rounded-lg px-2 py-2 text-sm transition duration-200',
          filtro === opcion.valor
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-md shadow-emerald-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ opcion.texto }}
      </button>

    </div>

    <!-- TÍTULO -->
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-bold text-emerald-600">
        Mis tareas
      </h2>

      <p class="text-sm text-gray-500">
        ¿Qué haremos hoy?
      </p>
    </div>

    <!-- AGREGAR TAREA -->
    <form
      @submit.prevent="agregarTarea"
      class="mb-5 flex gap-2"
    >

      <input
        v-model="nuevaTarea"
        type="text"
        placeholder="Ingresa una tarea..."
        class="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      <button
        type="submit"
        class="shrink-0 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-600 active:scale-95"
      >
        + Agregar
      </button>

    </form>

    <!-- MENSAJE CUANDO NO HAY TAREAS -->
    <p
      v-if="tareasFiltradas.length === 0"
      class="py-4 text-center text-sm text-gray-400"
    >
      {{
        tareas.length === 0
          ? 'No hay tareas registradas'
          : filtro === 'pendientes'
            ? 'No hay tareas pendientes'
            : 'No hay tareas completadas'
      }}
    </p>

    <!-- LISTA DE TAREAS -->
    <ul class="space-y-3">

      <li
        v-for="tarea in tareasFiltradas"
        :key="tarea.id"
        class="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition hover:bg-gray-100"
      >

        <button
          type="button"
          @click="cambiarEstado(tarea.id)"
          :class="[
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-110',
            tarea.completada
              ? 'border-green-500 bg-green-500'
              : 'border-red-500 bg-red-500'
          ]"
          :aria-label="tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'"
        >

          <svg
            v-if="tarea.completada"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="3"
            class="h-3 w-3"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>

        </button>

        <input
          v-if="tareaEditando === tarea.id"
          v-model="textoEditado"
          type="text"
          class="min-w-0 flex-1 rounded-md border border-blue-300 px-2 py-1 text-sm"
          @keyup.enter="guardarEdicion(tarea)"
          @keyup.esc="cancelarEdicion"
          autofocus
        />

        <span
          v-else
          class="min-w-0 flex-1 break-words text-sm"
          :class="tarea.completada
            ? 'text-gray-400 line-through'
            : 'text-gray-700'"
        >
          {{ tarea.titulo }}
        </span>

        <button
          v-if="tareaEditando !== tarea.id"
          type="button"
          @click="editarTarea(tarea)"
          class="shrink-0 rounded-md px-2 py-1 text-blue-600 hover:bg-blue-100"
        >
          ✎
        </button>

        <button
          v-if="tareaEditando !== tarea.id"
          type="button"
          @click="eliminarTarea(tarea.id)"
          class="shrink-0 rounded-md px-2 py-1 font-bold text-red-500 hover:bg-red-100"
        >
          X
        </button>

        <button
          v-if="tareaEditando === tarea.id"
          type="button"
          @click="guardarEdicion(tarea)"
          class="shrink-0 rounded-md px-2 py-1 font-bold text-emerald-600 hover:bg-emerald-100"
        >
          ✓
        </button>

        <button
          v-if="tareaEditando === tarea.id"
          type="button"
          @click="cancelarEdicion"
          class="shrink-0 rounded-md px-2 py-1 font-bold text-red-500 hover:bg-red-100"
        >
          ✕
        </button>

      </li>

    </ul>

    <!-- CONTADORES -->
    <div class="mt-5 space-y-2 border-t border-gray-200 pt-4">

      <p class="text-sm text-gray-500">
        Tareas registradas:
        <strong class="text-gray-800">
          {{ tareas.length }}
        </strong>
      </p>

      <div class="flex justify-between text-sm">

        <p class="text-red-500">
          Pendientes:
          <strong>{{ tareasPendientes }}</strong>
        </p>

        <p class="text-emerald-600">
          Completadas:
          <strong>{{ tareasCompletadas }}</strong>
        </p>

      </div>

    </div>

    <!-- TAREAS DE LA API -->
    <div class="mt-6 border-t border-gray-200 pt-4">

      <h2 class="mb-3 text-lg font-bold text-gray-800">
        Tareas existentes
      </h2>

      <p
        v-if="error"
        class="mb-2 text-sm text-red-500"
      >
        {{ error }}
      </p>

      <ul class="space-y-2">

        <li
          v-for="tarea in tareasExistentes"
          :key="tarea.id"
          class="rounded-lg bg-gray-50 p-2 text-sm text-gray-700"
        >

          {{ tarea.title }}

          <span
            v-if="tarea.completed"
            class="ml-2 text-emerald-600"
          >
            Completada
          </span>

          <span
            v-else
            class="ml-2 text-red-500"
          >
            Pendiente
          </span>

        </li>

      </ul>

      <!-- CONSULTAR API -->
      <button
        type="button"
        class="mt-4 w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-emerald-600 disabled:opacity-50"
        @click="obtenerDatos"
        :disabled="cargando"
      >
        {{ cargando ? 'Consultando la API...' : 'Consultar API' }}
      </button>

      <!-- IMPORTAR TAREAS -->
      <button
        type="button"
        class="mt-2 w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
        @click="importarTareas"
        :disabled="tareasExistentes.length === 0"
      >
        Importar tareas de la API
      </button>

    </div>

    <!-- BUSCADOR DE MÚSICA JAMENDO -->
    <section
      v-if="mostrarReproductor"
      class="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-5"
    >

      <div class="mb-4 text-center">

        <h2 class="text-xl font-bold text-emerald-700">
          Buscador de música
        </h2>

        <p class="text-sm text-gray-500">
          Busca tus canciones favoritas con Jamendo
        </p>

      </div>

      <!-- CAMPO DE BÚSQUEDA -->
      <form
        @submit.prevent="obtenerCancion"
        class="flex gap-2"
      >

        <input
          v-model="busquedaMusica"
          type="text"
          placeholder="Canción, artista o género..."
          class="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <button
          type="submit"
          :disabled="cargandoCancion"
          class="shrink-0 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 font-semibold text-white shadow-md transition hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50"
        >
          {{
            cargandoCancion
              ? 'Buscando...'
              : 'Buscar'
          }}
        </button>

      </form>

      <!-- ERROR DE MÚSICA -->
      <p
        v-if="errorCancion"
        class="mt-3 text-center text-sm text-red-500"
      >
        {{ errorCancion }}
      </p>

      <!-- RESULTADOS DE BÚSQUEDA -->
      <div
        v-if="canciones.length > 0"
        class="mt-5 space-y-3"
      >

        <h3 class="font-bold text-gray-700">
          Resultados encontrados
        </h3>

        <div
          v-for="item in canciones"
          :key="item.id"
          class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
        >

          <img
            :src="item.image"
            :alt="item.name"
            class="h-14 w-14 shrink-0 rounded-lg object-cover"
          />

          <div class="min-w-0 flex-1">

            <p class="truncate text-sm font-bold text-gray-800">
              {{ item.name }}
            </p>

            <p class="truncate text-xs text-gray-500">
              {{ item.artist_name }}
            </p>

            <p class="truncate text-xs text-emerald-600">
              {{ item.album_name || 'Sencillo' }}
            </p>

          </div>

          <button
            type="button"
            @click="seleccionarCancion(item)"
            class="shrink-0 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            aria-label="Reproducir canción"
          >
            ▶
          </button>

        </div>

      </div>

      <!-- REPRODUCTOR DE LA CANCIÓN SELECCIONADA -->
      <div
        v-if="cancion"
        class="mt-6 rounded-xl border border-emerald-200 bg-white p-4 text-center"
      >

        <img
          :src="cancion.image"
          :alt="cancion.name"
          class="mx-auto mb-3 h-40 w-40 rounded-xl object-cover shadow-md"
        />

        <h3 class="font-bold text-gray-800">
          {{ cancion.name }}
        </h3>

        <p class="mt-1 text-sm text-gray-500">
          {{ cancion.artist_name }}
        </p>

        <audio
          :key="cancion.id"
          controls
          autoplay
          preload="none"
          :src="cancion.audio"
          class="mt-4 w-full"
          @error="errorReproduccion"
        >
          Tu navegador no soporta audio.
        </audio>

        <a
          :href="cancion.shareurl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:underline"
        >
          Ver canción en Jamendo
        </a>

      </div>

    </section>

    <!-- BORRAR TODAS -->
    <button
      type="button"
      @click="eliminarTodas"
      :disabled="tareas.length === 0"
      class="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Borrar todas las tareas
    </button>

  </div>
</template>

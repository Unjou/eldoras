import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const firebaseConfig = {
  apiKey: "AIzaSyAmLHc_R4_Pcn0weiyXuVXlgeeKJ-I147E",
  authDomain: "eldoras-49c75.firebaseapp.com",
  databaseURL: "https://eldoras-49c75-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "eldoras-49c75",
  storageBucket: "eldoras-49c75.appspot.com",
  messagingSenderId: "968987748322",
  appId: "1:968987748322:web:07fddbe4c4d42be8fa7bbb",
  measurementId: "G-5ZT0732RZE",
}
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const postsRef = ref(database, "posts")

// Cloudinary configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxzx2yyqy/upload"
const CLOUDINARY_UPLOAD_PRESET = "jtpmf8uu"
const CLOUDINARY_FOLDER = "snbp_stories"

document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader")
  const modal = document.getElementById("modal")
  const modalContent = document.getElementById("modal-content")
  const emojiPickerContainer = document.getElementById("emoji-picker-container")
  const previewSection = document.getElementById("preview-halloffame")
  const hofSection = document.querySelector(".hof-container")
  const emptyState = previewSection ? previewSection.querySelector(".empty-state") : null
  const timelineSection = document.querySelector(".timeline")
  const form = document.getElementById("contribution-form")
  const searchBar = document.getElementById("search-bar")
  const navLinks = document.querySelectorAll("nav a")
  const isMobile = window.innerWidth < 768

  // Aktifkan link navigasi yang aktif
  const currentPage = window.location.pathname.split("/").pop()
  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href")
    if (linkPage === currentPage || (currentPage === "" && linkPage === "index.html")) {
      link.classList.add("active-nav")
    }
  })

  // Menampilkan preloader
  preloader.classList.remove("hidden")

  // Hanya tampilkan animasi pada kunjungan pertama
  const isFirstVisit = !sessionStorage.getItem("visited")
  if (isFirstVisit) {
    sessionStorage.setItem("visited", "true")
    document.body.classList.add("animate-fadeIn")
    setTimeout(() => {
      document.body.classList.remove("animate-fadeIn")
    }, 1000)
  }

  // Sembunyikan preloader setelah 1.5 detik
  setTimeout(() => {
    preloader.classList.add("hidden")
  }, 1500)

  // Tambahkan animasi transisi saat navigasi
  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const href = link.getAttribute("href")
      preloader.classList.remove("hidden")
      setTimeout(() => (window.location.href = href), 1000)
    })
  })

  // Animasi pergantian kata untuk Hall of Fame
  if (document.getElementById("highlight-hof")) {
    const wordsHof = ["Fame", "Legends", "Stars"]
    let indexHof = 0

    const highlightHof = document.getElementById("highlight-hof")
    const highlightInnerHof = document.getElementById("highlight-inner-hof")
    let currentSpanHof = document.getElementById("current-word-hof")

    // Inisialisasi lebar
    const initialWidth = currentSpanHof.offsetWidth + 20
    highlightHof.style.width = initialWidth + "px"

    function changeWordHof() {
      const oldSpan = currentSpanHof
      const nextWord = wordsHof[(indexHof + 1) % wordsHof.length]

      const newSpan = document.createElement("span")
      newSpan.className = "word"
      newSpan.textContent = nextWord
      newSpan.style.color = "white"

      highlightInnerHof.appendChild(newSpan)
      const newWidth = newSpan.offsetWidth + 20
      highlightHof.style.width = newWidth + "px"

      oldSpan.classList.remove("show")
      oldSpan.classList.add("exit")

      setTimeout(() => {
        newSpan.classList.add("show")
        currentSpanHof = newSpan

        setTimeout(() => {
          if (highlightInnerHof.contains(oldSpan)) {
            highlightInnerHof.removeChild(oldSpan)
          }
        }, 800)
      }, 200)

      indexHof = (indexHof + 1) % wordsHof.length
    }

    setInterval(changeWordHof, 4000)
  }

  // Animasi pergantian kata untuk Beranda
  if (document.getElementById("highlight-beranda")) {
    const wordsBeranda = ["Fame", "Legends", "Stars"]
    let indexBeranda = 0

    const highlightBeranda = document.getElementById("highlight-beranda")
    const highlightInnerBeranda = document.getElementById("highlight-inner-beranda")
    let currentSpanBeranda = document.getElementById("current-word-beranda")

    // Inisialisasi lebar
    const initialWidth = currentSpanBeranda.offsetWidth + 20
    highlightBeranda.style.width = initialWidth + "px"

    function changeWordBeranda() {
      const oldSpan = currentSpanBeranda
      const nextWord = wordsBeranda[(indexBeranda + 1) % wordsBeranda.length]

      const newSpan = document.createElement("span")
      newSpan.className = "word"
      newSpan.textContent = nextWord
      newSpan.style.color = "white"

      highlightInnerBeranda.appendChild(newSpan)
      const newWidth = newSpan.offsetWidth + 20
      highlightBeranda.style.width = newWidth + "px"

      oldSpan.classList.remove("show")
      oldSpan.classList.add("exit")

      setTimeout(() => {
        newSpan.classList.add("show")
        currentSpanBeranda = newSpan

        setTimeout(() => {
          if (highlightInnerBeranda.contains(oldSpan)) {
            highlightInnerBeranda.removeChild(oldSpan)
          }
        }, 800)
      }, 200)

      indexBeranda = (indexBeranda + 1) % wordsBeranda.length
    }

    setInterval(changeWordBeranda, 4000)
  }

  let posts = []
  const loggedInUserEmail = localStorage.getItem("loggedInUserEmail") || ""

  onValue(postsRef, (snapshot) => {
    posts = []
    snapshot.forEach((childSnapshot) => {
      const post = childSnapshot.val()
      post.id = childSnapshot.key
      posts.push(post)
    })

    if (previewSection) {
      const previewContainer = previewSection.querySelector(".preview-container")
      if (posts.length === 0) emptyState.style.display = "block"
      else {
        emptyState.style.display = "none"
        renderPosts(previewContainer, posts, 3)
      }
    }

    if (hofSection) {
      const emptyStateHof = hofSection.parentElement.querySelector(".empty-state")
      if (posts.length === 0) emptyStateHof.style.display = "block"
      else {
        emptyStateHof.style.display = "none"
        renderPosts(hofSection, posts)
      }

      if (searchBar) {
        searchBar.addEventListener("input", (e) => {
          const query = e.target.value.toLowerCase()
          const filteredPosts = posts.filter(
            (post) =>
              post.name.toLowerCase().includes(query) ||
              post.university.toLowerCase().includes(query) ||
              post.major.toLowerCase().includes(query),
          )
          if (filteredPosts.length === 0) {
            emptyStateHof.style.display = "block"
            hofSection.innerHTML = ""
          } else {
            emptyStateHof.style.display = "none"
            renderPosts(hofSection, filteredPosts)
          }
        })
      }
    }
  })

  // Fungsi untuk upload ke Cloudinary
  async function uploadToCloudinary(file, folder = CLOUDINARY_FOLDER) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
    formData.append("folder", folder)

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.secure_url
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error)
      throw error
    }
  }

  // Fungsi untuk menghapus dari Cloudinary
  async function deleteFromCloudinary(publicId) {
    if (!publicId) return

    try {
      // Ekstrak public_id dari URL
      const urlParts = publicId.split("/")
      const fileName = urlParts[urlParts.length - 1].split(".")[0]
      const folderPath = urlParts.slice(urlParts.indexOf(CLOUDINARY_FOLDER)).join("/")
      const actualPublicId = folderPath.split(".")[0]

      // Gunakan endpoint destroy Cloudinary
      const response = await fetch("/delete-cloudinary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_id: actualPublicId }),
      })

      if (!response.ok) {
        console.warn("File tidak ditemukan atau sudah dihapus")
      }
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error)
    }
  }

  if (form) {
    const imageInput = form.querySelector("#image")
    const imagePreview = form.querySelector("#image-preview")
    const documentInput = form.querySelector("#document")
    const documentPreview = form.querySelector("#document-preview")

    // Preview gambar saat dipilih
    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          // Batasi ukuran file 5MB
          alert("Ukuran file gambar tidak boleh lebih dari 5MB!")
          imageInput.value = ""
          imagePreview.innerHTML = "Ukuran file terlalu besar, pilih ulang."
          return
        }
        const reader = new FileReader()
        reader.onload = (e) =>
          (imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="w-24 h-24 rounded-full object-cover mt-2">`)
        reader.readAsDataURL(file)
      } else {
        imagePreview.innerHTML = "Belum ada foto yang dipilih."
      }
    })

    // Preview dokumen saat dipilih
    if (documentInput) {
      documentInput.addEventListener("change", (e) => {
        const file = e.target.files[0]
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            // Batasi ukuran file 10MB
            alert("Ukuran dokumen tidak boleh lebih dari 10MB!")
            documentInput.value = ""
            documentPreview.innerHTML = "Ukuran file terlalu besar, pilih ulang."
            return
          }
          documentPreview.innerHTML = `<div class="flex items-center mt-2">
            <i class="fas fa-file-alt text-yellow-500 mr-2"></i>
            <span>${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>`
        } else {
          documentPreview.innerHTML = "Belum ada dokumen yang dipilih."
        }
      })
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      const imageFile = imageInput.files[0]
      const documentFile = documentInput ? documentInput.files[0] : null

      if (!imageFile) {
        alert("Silakan pilih foto profil!")
        return
      }

      if (documentInput && !documentFile) {
        alert("Silakan pilih dokumen cerita lengkap!")
        return
      }

      preloader.classList.remove("hidden")

      try {
        // Upload gambar ke Cloudinary
        const imageUrl = await uploadToCloudinary(imageFile, `${CLOUDINARY_FOLDER}/images`)

        // Upload dokumen ke Cloudinary jika ada
        let documentUrl = ""
        if (documentFile) {
          documentUrl = await uploadToCloudinary(documentFile, `${CLOUDINARY_FOLDER}/documents`)
        }

        const newPost = {
          id: Date.now().toString(),
          name: form.name.value,
          email: form.email.value,
          university: form.university.value,
          major: form.major.value,
          story: form.story.value,
          tips: form.tips.value,
          teacher_message: form.teacher_message.value,
          video1: form.video1.value.replace("view", "preview"),
          video2: form.video2.value.replace("view", "preview"),
          image: imageUrl,
          documentUrl: documentUrl,
          reactions: [],
          timeline: [
            {
              date: new Date().toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
              event: "Mengirim Cerita",
              description: `Mengirim cerita perjalanan SNBP ke ${form.university.value}.`,
              image: imageUrl,
            },
          ],
        }

        push(postsRef, newPost)
          .then(() => {
            localStorage.setItem("loggedInUserEmail", form.email.value)
            preloader.classList.add("hidden")
            window.location.href = "hall-of-fame.html"
          })
          .catch((error) => {
            console.error("Error saving to Firebase:", error)
            preloader.classList.add("hidden")
            alert("Terjadi kesalahan saat menyimpan data. Coba lagi!")
          })
      } catch (error) {
        console.error("Error during upload:", error)
        preloader.classList.add("hidden")
        alert("Terjadi kesalahan saat mengunggah file. Coba lagi!")
      }
    })
  }

  // Dummy timeline data (replace with actual data source)
  const timelineData = [
    {
      date: "Okt 2023",
      title: "Awal Perjuangan",
      description: "Mulai mencari informasi tentang jalur SNBP dan universitas impian.",
      image:
        "https://images.unsplash.com/photo-1517245386804-bb43f63c02ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    },
    {
      date: "Des 2023",
      title: "Penyusunan Strategi",
      description: "Berkonsultasi dengan guru BK dan alumni untuk menyusun strategi pemilihan jurusan.",
      image:
        "https://images.unsplash.com/photo-1509062522526-e594283732e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    },
    {
      date: "Feb 2024",
      title: "Pendaftaran SNBP",
      description: "Melakukan pendaftaran SNBP dengan hati-hati dan teliti.",
      image:
        "https://images.unsplash.com/photo-1542744166-e35939358c6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    },
    {
      date: "Mar 2024",
      title: "Pengumuman Hasil",
      description: "Deg-degan menunggu pengumuman hasil SNBP.",
      image:
        "https://images.unsplash.com/photo-1587613865763-5b93b953c144?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    },
    {
      date: "Apr 2024",
      title: "Lolos SNBP!",
      description: "Alhamdulillah, lolos SNBP di universitas impian!",
      image:
        "https://images.unsplash.com/photo-1544731612-de7f59b696c8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    },
  ]

  // Perbaikan fungsi untuk timeline
  function renderTimelineData() {
    if (timelineSection) {
      timelineSection.innerHTML = ""
      timelineData.forEach((event, index) => {
        const timelineItem = document.createElement("div")
        timelineItem.className = "timeline-item"

        // Alternating left and right items
        if (index % 2 === 0) {
          timelineItem.classList.add("timeline-left")
        } else {
          timelineItem.classList.add("timeline-right")
        }

        timelineItem.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
          <img src="${event.image}" alt="Timeline Image" class="timeline-image">
          <h3 class="text-xl md:text-2xl font-bold">${event.date}</h3>
          <p class="text-lg md:text-xl font-semibold">${event.title}</p>
          <p class="text-gray-400 md:text-lg">${event.description}</p>
        </div>
        <div class="timeline-dot"></div>
      `
        timelineSection.appendChild(timelineItem)
      })
    }
  }

  // Perbaikan fungsi renderPosts untuk memastikan postingan terlihat
  function renderPosts(container, entries, limit = null) {
    container.innerHTML = ""

    // Filter postingan yang valid (bukan undefined)
    const validEntries = entries.filter(
      (entry) =>
        entry &&
        entry.name &&
        entry.name !== "undefined" &&
        entry.university &&
        entry.university !== "undefined" &&
        entry.major &&
        entry.major !== "undefined",
    )

    const postsToRender = limit ? validEntries.slice(0, limit) : validEntries

    if (postsToRender.length === 0) {
      console.log("Tidak ada postingan untuk ditampilkan")
      return
    }

    console.log(`Menampilkan ${postsToRender.length} postingan`)

    postsToRender.forEach((entry, index) => {
      const card = document.createElement("div")
      card.className = "profile-card bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer post"
      card.dataset.postId = entry.id

      // Hitung reaksi dengan format yang benar
      const reactionCounts = {}
      if (Array.isArray(entry.reactions)) {
        entry.reactions.forEach((reaction) => {
          if (typeof reaction === "string") {
            // Format lama
            reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1
          } else if (reaction && reaction.emoji) {
            // Format baru (object)
            reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1
          }
        })
      }

      const reactionDisplay = Object.entries(reactionCounts)
        .map(([emoji, count]) => `<span data-emoji="${emoji}">${emoji} ${count}</span>`)
        .join("")

      card.innerHTML = `
      <div class="card-border"></div>
      <img src="${entry.image}" alt="${entry.name}" class="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-4">
      <h3 class="text-xl md:text-2xl font-bold text-center text-yellow-500">${entry.name}</h3>
      <div class="text-white text-center text-sm md:text-base">
        <span class="institution"><i class="fas fa-university text-yellow-500 mr-1"></i>${entry.university}</span>
        <span class="major"><i class="fas fa-graduation-cap text-yellow-500 mr-1"></i>${entry.major}</span>
      </div>
      <div class="reaction-container">
        <div class="reaction-display">${reactionDisplay}</div>
      </div>
    `

      // Handle long press for emoji picker
      let longPressTimer
      let isLongPress = false
      const longPressDuration = 500

      const startLongPress = (e) => {
        e.preventDefault()
        isLongPress = false
        longPressTimer = setTimeout(() => {
          isLongPress = true

          // Posisikan emoji picker di tengah layar
          emojiPickerContainer.style.display = "block"
          emojiPickerContainer.style.top = "50%"
          emojiPickerContainer.style.left = "50%"
          emojiPickerContainer.style.transform = "translate(-50%, -50%)"
          emojiPickerContainer.classList.add("active")

          // Tambahkan indikator long press
          const longPressIndicator = document.createElement("div")
          longPressIndicator.className = "long-press-indicator"
          longPressIndicator.innerHTML = `<i class="fas fa-smile text-yellow-500"></i> Pilih emoji`
          card.appendChild(longPressIndicator)

          setTimeout(() => {
            if (card.contains(longPressIndicator)) {
              card.removeChild(longPressIndicator)
            }
          }, 2000)

          // Store the current post for emoji reaction
          emojiPickerContainer.dataset.postId = entry.id
        }, longPressDuration)
      }

      const cancelLongPress = () => {
        clearTimeout(longPressTimer)
      }

      card.addEventListener("mousedown", startLongPress)
      card.addEventListener("touchstart", startLongPress, { passive: false })
      card.addEventListener("mouseup", cancelLongPress)
      card.addEventListener("mouseleave", cancelLongPress)
      card.addEventListener("touchend", cancelLongPress)
      card.addEventListener("touchcancel", cancelLongPress)

      // Handle click to open modal
      card.addEventListener("click", (e) => {
        if (!isLongPress) {
          console.log("Membuka modal untuk:", entry.name)
          openModal(entry, index)
        }
      })

      container.appendChild(card)
    })
  }

  // Perbaikan emoji picker
  const emojiPicker = emojiPickerContainer ? emojiPickerContainer.querySelector("emoji-picker") : null
  if (emojiPicker) {
    emojiPicker.addEventListener("emoji-click", (e) => {
      const selectedEmoji = e.detail.unicode
      const postId = emojiPickerContainer.dataset.postId

      if (selectedEmoji && postId) {
        const post = posts.find((p) => p.id === postId)
        if (post) {
          // Cek apakah user sudah pernah memberikan reaksi
          const userEmail = localStorage.getItem("loggedInUserEmail") || "anonymous"

          // Inisialisasi array reactions jika belum ada
          if (!Array.isArray(post.reactions)) {
            post.reactions = []
          }

          // Hapus reaksi sebelumnya dari user yang sama
          post.reactions = post.reactions.filter((reaction) => {
            if (typeof reaction === "string") {
              // Format lama, tidak bisa difilter berdasarkan user
              return true
            } else {
              // Format baru (object)
              return reaction.email !== userEmail
            }
          })

          // Tambahkan reaksi baru
          post.reactions.push({ email: userEmail, emoji: selectedEmoji })

          const postRef = ref(database, `posts/${postId}`)
          update(postRef, { reactions: post.reactions })
        }
      }

      emojiPickerContainer.classList.remove("active")
      emojiPickerContainer.style.display = "none"
    })
  }

  // Close emoji picker when clicking outside
  document.addEventListener("click", (e) => {
    if (emojiPickerContainer && !emojiPickerContainer.contains(e.target) && !e.target.closest(".post")) {
      emojiPickerContainer.classList.remove("active")
    }
  })

  function renderModalTab(entry, tabId, isOwner) {
    let content = ""
    if (tabId === "story") {
      content = `
        <div class="story-content">
          <p class="editable">${entry.story}</p>
          ${
            entry.documentUrl
              ? `
            <div class="document-download mt-4">
              <a href="${entry.documentUrl}" target="_blank" download class="flex items-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded">
                <i class="fas fa-file-download mr-2"></i>
                Unduh Dokumen Cerita Lengkap
              </a>
            </div>
          `
              : ""
          }
        </div>
      `
    } else if (tabId === "tips") content = `<p class="editable">${entry.tips}</p>`
    else if (tabId === "teacher_message") content = `<p class="editable">${entry.teacher_message}</p>`
    else if (tabId === "videos")
      content = `
      <div class="video-container">
        <iframe src="${entry.video1}" allowfullscreen></iframe>
        <iframe src="${entry.video2}" allowfullscreen></iframe>
      </div>
    `
    return `
      <div class="modal-tab-content ${tabId === "story" ? "" : "hidden"}" id="${tabId}">
        ${content}
      </div>
    `
  }

  function openModal(entry, index) {
    const isOwner = entry.email === loggedInUserEmail
    const isMobile = window.innerWidth < 768

    modalContent.innerHTML = `
    <div class="modal-header">
      <div class="modal-close">
        <i class="fas fa-times"></i>
      </div>
      <div class="modal-actions">
        <button class="edit-btn" title="Edit">✏️</button>
        <button class="delete-btn" title="Hapus">🗑️</button>
      </div>
    </div>
    <div class="profile-header">
      <img src="${entry.image}" alt="${entry.name}">
      <h3>${entry.name}</h3>
      <div class="profile-info">
        <p><i class="fas fa-university text-yellow-500 mr-1"></i> ${entry.university}</p>
        <p><i class="fas fa-graduation-cap text-yellow-500 mr-1"></i> ${entry.major}</p>
      </div>
    </div>
    <div class="modal-nav">
      <div class="modal-tabs">
        <div class="modal-tab active" data-tab="story">
          ${isMobile ? '<i class="fas fa-book"></i>' : '<i class="fas fa-book"></i> Cerita'}
        </div>
        <div class="modal-tab" data-tab="tips">
          ${isMobile ? '<i class="fas fa-lightbulb"></i>' : '<i class="fas fa-lightbulb"></i> Tips'}
        </div>
        <div class="modal-tab" data-tab="teacher_message">
          ${isMobile ? '<i class="fas fa-chalkboard-teacher"></i>' : '<i class="fas fa-chalkboard-teacher"></i> Guru'}
        </div>
        <div class="modal-tab" data-tab="videos">
          ${isMobile ? '<i class="fas fa-video"></i>' : '<i class="fas fa-video"></i> Video'}
        </div>
      </div>
    </div>
    <div class="modal-tab-container">
      ${renderModalTab(entry, "story", isOwner)}
      ${renderModalTab(entry, "tips", isOwner)}
      ${renderModalTab(entry, "teacher_message", isOwner)}
      ${renderModalTab(entry, "videos", isOwner)}
    </div>
  `

    // Tambahkan tombol save di luar konten modal
    if (isOwner) {
      const saveBtn = document.createElement("button")
      saveBtn.className = "save-btn hidden"
      saveBtn.title = "Simpan"
      saveBtn.innerHTML = "💾"
      modalContent.appendChild(saveBtn)
    }

    // Pastikan modal terlihat
    modal.style.display = "flex"
    modal.classList.remove("hidden")

    // Gunakan setTimeout untuk memastikan perubahan display diterapkan sebelum menambahkan kelas active
    setTimeout(() => {
      modal.classList.add("active")
    }, 10)

    const tabs = modalContent.querySelectorAll(".modal-tab")
    const tabContents = modalContent.querySelectorAll(".modal-tab-content")
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"))
        tab.classList.add("active")
        tabContents.forEach((content) => content.classList.add("hidden"))
        modalContent.querySelector(`#${tab.dataset.tab}`).classList.remove("hidden")
      })
    })

    const closeButton = modalContent.querySelector(".modal-close")
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        modal.classList.remove("active")
        setTimeout(() => {
          modal.classList.add("hidden")
          modal.style.display = "none"
        }, 500)
      })
    }

    if (isOwner) {
      const editBtn = modalContent.querySelector(".edit-btn")
      const deleteBtn = modalContent.querySelector(".delete-btn")
      const saveBtn = modalContent.querySelector(".save-btn")
      const editableFields = modalContent.querySelectorAll(".editable")

      // Sembunyikan tombol edit dan delete jika bukan pemilik
      if (!isOwner) {
        modalContent.querySelector(".modal-actions").style.display = "none"
      }

      editBtn.addEventListener("click", () => {
        editableFields.forEach((field) => (field.contentEditable = true))
        saveBtn.classList.remove("hidden")
      })

      saveBtn.addEventListener("click", () => {
        editableFields.forEach((field) => (field.contentEditable = false))
        entry.story = modalContent.querySelector("#story p.editable")?.textContent || entry.story
        entry.tips = modalContent.querySelector("#tips p.editable")?.textContent || entry.tips
        entry.teacher_message =
          modalContent.querySelector("#teacher_message p.editable")?.textContent || entry.teacher_message
        const postRef = ref(database, `posts/${entry.id}`)
        update(postRef, {
          story: entry.story,
          tips: entry.tips,
          teacher_message: entry.teacher_message,
        })
        saveBtn.classList.add("hidden")
      })

      deleteBtn.addEventListener("click", async () => {
        if (confirm("Apakah Anda yakin ingin menghapus postingan ini?")) {
          try {
            // Hapus dokumen dari Cloudinary jika ada
            if (entry.documentUrl) {
              await deleteFromCloudinary(entry.documentUrl)
            }

            // Hapus gambar dari Cloudinary
            if (entry.image) {
              await deleteFromCloudinary(entry.image)
            }

            // Hapus data dari database
            const postRef = ref(database, `posts/${entry.id}`)
            await remove(postRef)

            modal.classList.remove("active")
            setTimeout(() => {
              modal.classList.add("hidden")
              modal.style.display = "none"
            }, 500)
          } catch (error) {
            console.error("Error saat menghapus postingan:", error)
            alert("Terjadi kesalahan saat menghapus postingan. Coba lagi!")
          }
        }
      })
    } else {
      // Sembunyikan tombol edit dan delete jika bukan pemilik
      modalContent.querySelector(".modal-actions").style.display = "none"
    }
  }

  // Close modal when clicking outside content
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active")
      setTimeout(() => {
        modal.classList.add("hidden")
      }, 500)
    }
  })

  // Scroll reveal for profile cards
  const cards = document.querySelectorAll(".profile-card")
  const observerOptions = {
    root: null,
    threshold: 0.1,
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal")
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  cards.forEach((card) => observer.observe(card))

  // Perbaikan fungsi createStars untuk Hall of Fame
  function createStars() {
    const starContainer = document.querySelector(".star-decoration")
    if (!starContainer) return

    const starCount = 100
    starContainer.innerHTML = ""

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div")
      const size = i % 5 === 0 ? "star-large" : i % 3 === 0 ? "star-medium" : "star-small"
      star.className = `star ${size}`
      star.style.top = `${Math.random() * 100}%`
      star.style.left = `${Math.random() * 100}%`
      star.style.animationDelay = `${Math.random() * 5}s`
      starContainer.appendChild(star)
    }
  }

  // Check if screen size changes to update modal tabs
  window.addEventListener("resize", () => {
    const isMobileNow = window.innerWidth < 768
    if (isMobileNow !== isMobile && modal.classList.contains("active")) {
      // Refresh modal to update tab display
      const currentEntry = posts.find((p) => p.id === modalContent.querySelector(".profile-card")?.dataset.postId)
      if (currentEntry) {
        openModal(currentEntry, 0)
      }
    }
  })

  // Tambahkan pemanggilan fungsi renderTimelineData
  renderTimelineData()

  // Pastikan createStars dipanggil untuk Hall of Fame
  if (hofSection) {
    createStars()
  }
})

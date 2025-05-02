document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  const previewSection = document.getElementById('preview-halloffame');
  const hofSection = document.querySelector('.hof-container');
  const emptyState = previewSection ? previewSection.querySelector('.empty-state') : null;
  const timelineSection = document.querySelector('.timeline');
  const form = document.getElementById('contribution-form');
  const searchBar = document.getElementById('search-bar');

  setTimeout(() => preloader.classList.add('hidden'), 1500);

  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      preloader.classList.remove('hidden');
      setTimeout(() => window.location.href = href, 1000);
    });
  });

  let posts = JSON.parse(localStorage.getItem('posts')) || [];
  const loggedInUserEmail = localStorage.getItem('loggedInUserEmail') || '';

  if (form) {
    const imageInput = form.querySelector('#image');
    const imagePreview = form.querySelector('#image-preview');
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="w-24 h-24 rounded-full object-cover mt-2">`;
        reader.readAsDataURL(file);
      } else {
        imagePreview.innerHTML = 'Belum ada foto yang dipilih.';
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const imageFile = imageInput.files[0];
      if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPost = {
            id: Date.now(),
            name: form.name.value,
            email: form.email.value,
            university: form.university.value,
            major: form.major.value,
            story: form.story.value,
            tips: form.tips.value,
            teacher_message: form.teacher_message.value,
            video1: form.video1.value.replace('view', 'preview'),
            video2: form.video2.value.replace('view', 'preview'),
            image: e.target.result,
            reactions: [],
            timeline: [
              { date: new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }), event: 'Mengirim Cerita', description: `Mengirim cerita perjalanan SNBP ke ${form.university.value}.`, image: e.target.result }
            ]
          };
          posts.push(newPost);
          localStorage.setItem('posts', JSON.stringify(posts));
          localStorage.setItem('loggedInUserEmail', form.email.value);
          window.location.href = 'hall-of-fame.html';
        };
        reader.readAsDataURL(imageFile);
      }
    });
  }

  function renderPosts(container, entries, limit = null) {
    container.innerHTML = '';
    const postsToRender = limit ? entries.slice(0, limit) : entries;

    postsToRender.forEach((entry, index) => {
      const card = document.createElement('div');
      card.className = 'profile-card bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer';
      
      const reactionCounts = Array.isArray(entry.reactions) ? entry.reactions.reduce((acc, emoji) => {
        if (emoji) acc[emoji] = (acc[emoji] || 0) + 1;
        return acc;
      }, {}) : {};
      
      const reactionDisplay = Object.entries(reactionCounts)
        .map(([emoji, count]) => `<span data-emoji="${emoji}">${emoji} ${count}</span>`)
        .join('');

      card.innerHTML = `
        <img src="${entry.image}"(dest) alt="${entry.name}" class="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-4">
        <h3 class="text-xl md:text-2xl font-bold text-center">${entry.name}</h3>
        <p class="text-gray-400 text-center text-sm md:text-base">${entry.university} - ${entry.major}</p>
        <div class="reaction-container">
          <div class="reaction-display">${reactionDisplay}</div>
        </div>
      `;
      
      let emojiPicker = document.createElement('emoji-picker');
      card.appendChild(emojiPicker);

      let longPressTimer, isLongPress = false;
      const longPressDuration = 500;

      const startLongPress = (e) => {
        e.stopPropagation();
        isLongPress = false;
        longPressTimer = setTimeout(() => {
          isLongPress = true;
          document.querySelectorAll('emoji-picker.visible').forEach(picker => picker.classList.remove('visible'));
          emojiPicker.classList.add('visible');
        }, longPressDuration);
      };

      const cancelLongPress = (e) => {
        e.stopPropagation();
        clearTimeout(longPressTimer);
      };

      card.addEventListener('mousedown', startLongPress);
      card.addEventListener('mouseup', cancelLongPress);
      card.addEventListener('mouseleave', cancelLongPress);
      card.addEventListener('touchstart', startLongPress);
      card.addEventListener('touchend', cancelLongPress);
      card.addEventListener('touchcancel', cancelLongPress);

      emojiPicker.addEventListener('emoji-click', (e) => {
        e.stopPropagation();
        const selectedEmoji = e.detail.unicode;
        if (selectedEmoji) {
          entry.reactions = [selectedEmoji];
          posts[index] = entry;
          localStorage.setItem('posts', JSON.stringify(posts));
          
          const updatedReactionCounts = Array.isArray(entry.reactions) ? entry.reactions.reduce((acc, emoji) => {
            if (emoji) acc[emoji] = (acc[emoji] || 0) + 1;
            return acc;
          }, {}) : {};
          const updatedReactionDisplay = Object.entries(updatedReactionCounts)
            .map(([emoji, count]) => `<span data-emoji="${emoji}">${emoji} ${count}</span>`)
            .join('');
          const reactionDisplayDiv = card.querySelector('.reaction-display');
          reactionDisplayDiv.innerHTML = updatedReactionDisplay;
          
          reactionDisplayDiv.querySelectorAll('span').forEach(span => {
            span.addEventListener('click', (e) => {
              e.stopPropagation();
              const emojiToRemove = span.dataset.emoji;
              entry.reactions = entry.reactions.filter(emoji => emoji !== emojiToRemove);
              posts[index] = entry;
              localStorage.setItem('posts', JSON.stringify(posts));
              
              const updatedCounts = Array.isArray(entry.reactions) ? entry.reactions.reduce((acc, emoji) => {
                if (emoji) acc[emoji] = (acc[emoji] || 0) + 1;
                return acc;
              }, {}) : {};
              const updatedDisplay = Object.entries(updatedCounts)
                .map(([emoji, count]) => `<span data-emoji="${emoji}">${emoji} ${count}</span>`)
                .join('');
              reactionDisplayDiv.innerHTML = updatedDisplay;
            });
          });
          
          emojiPicker.classList.remove('visible');
        }
      });

      card.querySelectorAll('.reaction-display span').forEach(span => {
        span.addEventListener('click', (e) => {
          e.stopPropagation();
          const emojiToRemove = span.dataset.emoji;
          entry.reactions = entry.reactions.filter(emoji => emoji !== emojiToRemove);
          posts[index] = entry;
          localStorage.setItem('posts', JSON.stringify(posts));
          
          const updatedReactionCounts = Array.isArray(entry.reactions) ? entry.reactions.reduce((acc, emoji) => {
            if (emoji) acc[emoji] = (acc[emoji] || 0) + 1;
            return acc;
          }, {}) : {};
          const updatedReactionDisplay = Object.entries(updatedReactionCounts)
            .map(([emoji, count]) => `<span data-emoji="${emoji}">${emoji} ${count}</span>`)
            .join('');
          card.querySelector('.reaction-display').innerHTML = updatedReactionDisplay;
        });
      });

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const isClickInsideEmojiPicker = e.target.closest('emoji-picker');
        if (!isClickInsideEmojiPicker && !isLongPress) {
          modal.classList.add('hidden');
          modalContent.innerHTML = '';
          openModal(entry, index);
        }
      });

      container.appendChild(card);
    });
  }

  if (previewSection) {
    const previewContainer = previewSection.querySelector('.preview-container');
    if (posts.length === 0) emptyState.style.display = 'block';
    else {
      emptyState.style.display = 'none';
      renderPosts(previewContainer, posts, 3);
    }
  }

  if (hofSection) {
    const emptyStateHof = hofSection.parentElement.querySelector('.empty-state');
    if (posts.length === 0) emptyStateHof.style.display = 'block';
    else {
      emptyStateHof.style.display = 'none';
      renderPosts(hofSection, posts);
    }

    if (searchBar) {
      searchBar.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredPosts = posts.filter(post => 
          post.name.toLowerCase().includes(query) ||
          post.university.toLowerCase().includes(query) ||
          post.major.toLowerCase().includes(query)
        );
        if (filteredPosts.length === 0) {
          emptyStateHof.style.display = 'block';
          hofSection.innerHTML = '';
        } else {
          emptyStateHof.style.display = 'none';
          renderPosts(hofSection, filteredPosts);
        }
      });
    }
  }

  const timelineData = [
    { image: "https://images.pexels.com/photos/4778621/pexels-photo-4778621.jpeg", title: "Pendaftaran Program", date: "Januari 2025", description: "Pembukaan pendaftaran program beasiswa untuk mahasiswa berprestasi dari seluruh Indonesia." },
    { image: "https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg", title: "Seleksi Administrasi", date: "Februari 2025", description: "Proses seleksi berkas dan administrasi untuk memilih kandidat yang memenuhi syarat." },
    { image: "https://images.pexels.com/photos/4778664/pexels-photo-4778664.jpeg", title: "Wawancara", date: "Maret 2025", description: "Tahap wawancara dengan para kandidat terpilih untuk mengenal lebih dalam potensi mereka." },
    { image: "https://images.pexels.com/photos/5428163/pexels-photo-5428163.jpeg", title: "Pengumuman Penerima", date: "April 2025", description: "Pengumuman resmi penerima beasiswa yang akan memulai perjalanan mereka." }
  ];

  if (timelineSection) {
    timelineSection.innerHTML = '';
    timelineData.forEach((event) => {
      const timelineItem = document.createElement('div');
      timelineItem.className = 'timeline-item';
      timelineItem.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
          <img src="${event.image}" alt="Timeline Image">
          <h3 class="text-xl md:text-2xl font-bold">${event.date}</h3>
          <p class="text-lg md:text-xl font-semibold">${event.title}</p>
          <p class="text-gray-400 md:text-lg">${event.description}</p>
        </div>
        <div class="timeline-dot"></div>
      `;
      timelineSection.appendChild(timelineItem);
    });
  }

  function renderModalTab(entry, tabId, isOwner) {
    let content = '';
    if (tabId === 'story') content = `<p class="editable">${entry.story}</p>`;
    else if (tabId === 'tips') content = `<p class="editable">${entry.tips}</p>`;
    else if (tabId === 'teacher_message') content = `<p class="editable">${entry.teacher_message}</p>`;
    else if (tabId === 'videos') content = `
      <div class="video-container">
        <iframe src="${entry.video1}" allowfullscreen></iframe>
        <iframe src="${entry.video2}" allowfullscreen></iframe>
      </div>
    `;
    return `
      <div class="modal-tab-content ${tabId === 'story' ? '' : 'hidden'}" id="${tabId}">
        ${content}
      </div>
    `;
  }

  function openModal(entry, index) {
    const isOwner = entry.email === loggedInUserEmail;
    modalContent.innerHTML = `
      <div class="modal-close">
        <i class="fas fa-times text-white"></i>
      </div>
      ${isOwner ? `
        <div class="modal-actions">
          <button class="edit-btn" title="Edit">✏️</button>
          <button class="delete-btn" title="Hapus">🗑️</button>
        </div>
        <button class="save-btn hidden" title="Simpan">💾</button>
      ` : ''}
      <div class="profile-header">
        <img src="${entry.image}" alt="${entry.name}">
        <h3>${entry.name}</h3>
        <div class="profile-info">
          <p>${entry.university}</p>
          <p>${entry.major}</p>
        </div>
      </div>
      <div class="modal-nav">
        <div class="modal-tabs">
          <div class="modal-tab active" data-tab="story" title="Cerita SNBP">📖</div>
          <div class="modal-tab" data-tab="tips" title="Tips & Saran">💡</div>
          <div class="modal-tab" data-tab="teacher_message" title="Pesan Guru">👩‍🏫</div>
          <div class="modal-tab" data-tab="videos" title="Dokumentasi Video">🎥</div>
        </div>
      </div>
      <div class="modal-tab-container">
        ${renderModalTab(entry, 'story', isOwner)}
        ${renderModalTab(entry, 'tips', isOwner)}
        ${renderModalTab(entry, 'teacher_message', isOwner)}
        ${renderModalTab(entry, 'videos', isOwner)}
      </div>
    `;
    modal.classList.remove('hidden');

    const tabs = modalContent.querySelectorAll('.modal-tab');
    const tabContents = modalContent.querySelectorAll('.modal-tab-content');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        tabContents.forEach(content => content.classList.add('hidden'));
        modalContent.querySelector(`#${tab.dataset.tab}`).classList.remove('hidden');
      });
    });

    const closeButton = modalContent.querySelector('.modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        modal.classList.add('hidden');
      });
    }

    if (isOwner) {
      const editBtn = modalContent.querySelector('.edit-btn');
      const deleteBtn = modalContent.querySelector('.delete-btn');
      const saveBtn = modalContent.querySelector('.save-btn');
      const editableFields = modalContent.querySelectorAll('.editable');

      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editableFields.forEach(field => field.contentEditable = true);
        saveBtn.classList.remove('hidden');
      });

      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editableFields.forEach(field => field.contentEditable = false);
        entry.story = modalContent.querySelector('#story p.editable')?.textContent || entry.story;
        entry.tips = modalContent.querySelector('#tips p.editable')?.textContent || entry.tips;
        entry.teacher_message = modalContent.querySelector('#teacher_message p.editable')?.textContent || entry.teacher_message;
        posts[index] = entry;
        localStorage.setItem('posts', JSON.stringify(posts));
        saveBtn.classList.add('hidden');
      });

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Apakah Anda yakin ingin menghapus postingan ini?')) {
          posts.splice(index, 1);
          localStorage.setItem('posts', JSON.stringify(posts));
          modal.classList.add('hidden');
          window.location.reload();
        }
      });
    }
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
});
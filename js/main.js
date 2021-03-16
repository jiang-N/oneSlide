const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)
const isMain = str => (/^#{1,2}(?!#)/).test(str)
const isSub = str => (/^#{3}(?!#)/).test((str))
const TPL = `
# 私は全団地で一番強い人です。

## 学校をさぼる

## 学校は威龍です

## すごい威力

### はだしの勇猛

### 辛いものは食べません

### 至るところで足をほじくる

## ありがとうございます。
`

const convert = raw => {
  let arr = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(s => s !== '').map(s => s.trim())

  let html = ''
  for (let i = 0; i < arr.length; i++) {
    if (arr[i + 1] !== undefined) {
      if (isMain(arr[i]) && isMain(arr[i + 1])) {
        html += `
<section data-markdown>
  <textarea data-template>
    ${arr[i]}
  </textarea>
        </section>
          `
      } else if (isMain(arr[i]) && isSub(arr[i + 1])) {
        html += `
<section>
<section data-markdown>
  <textarea data-template>
    ${arr[i]}
  </textarea>
        </section>
          `
      } else if (isSub(arr[i]) && isSub(arr[i + 1])) {
        html += `
<section data-markdown>
  <textarea data-template>
    ${arr[i]}
  </textarea>
        </section>
          `
      } else if (isSub(arr[i]) && isMain(arr[i + 1])) {
        html += `
<section data-markdown>
  <textarea data-template>
    ${arr[i]}
  </textarea>
        </section>
        </section>
          `
      }
    } else {
      if ((isMain(arr[i]))) {
        html += `
<section data-markdown>
  <textarea data-template>
    ${arr[i]}
  </textarea>
        </section>
          `
      } else if (isSub(arr[i])) {
        html += `
<section data-markdown>
  <textarea data-template>
    ${arr[i]}
  </textarea>
        </section>
        </section>
          `
      }
    }
  }
  return html
}

const Menu = {
  init() {
    console.log('Menu init...')
    this.$settingIcon = $('.control .icon-setting')
    this.$menu = $('.menu')
    this.$closeIcon = $('.menu .icon-close')
    this.$$tabs = $$('.menu .tab')
    this.$$contents = $$('.menu .content')

    this.bind()
  },

  bind() {
    this.$settingIcon.onclick = () => {
      this.$menu.classList.add('open')
    }
    this.$closeIcon.onclick = () => {
      this.$menu.classList.remove('open')
    }
    this.$$tabs.forEach($tab => $tab.onclick = () => {
      this.$$tabs.forEach($node => $node.classList.remove('active'))
      $tab.classList.add('active')
      let index = [...this.$$tabs].indexOf($tab)
      this.$$contents.forEach($node => $node.classList.remove('active'))
      this.$$contents[index].classList.add('active')
    })
    let lightTheme = ['beige', 'serif', 'simple', 'sky', 'solarized', 'white']
    if (lightTheme.indexOf(localStorage.theme) >= 0) {
      this.$settingIcon.classList.add('icon-light-mode')
    }
  },
}

const ImgUploader = {
  init() {
    console.log('ImgUploader init...')
    this.$fileInput = $('#img-uploader')
    this.$textarea = $('.editor textarea')

    AV.init({
      appId: 'buMNiOHSXYCQXpL9wrUCrHOU-gzGzoHsz',
      appKey: 'WbBmosIoM1kFSD51AtoTWu2r',
      serverURL: 'https://bumniohs.lc-cn-n1-shared.com'
    })

    this.bind()
  },
  bind() {
    let self = this
    this.$fileInput.onchange = function () {
      if (this.files.length > 0) {
        let localFile = this.files[0]
        if (localFile.size / 1048576 > 2) {
          alert('文件不能超过2M')
          return
        }
        self.insertText(`![上传中，进度0%]()`)
        let avFile = new AV.File(encodeURI(localFile.name), localFile)
        avFile.save({
          keepFileName: true,
          onprogress(progress) {
            self.insertText(`![上传中，进度${progress.percent}%]()`)
          }
        }).then(file => {
          let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/400)`
          self.insertText(text)
        }).catch(err => console.log(err))
      }
    }
  },
  insertText(text = '') {
    let $textarea = this.$textarea
    let start = $textarea.selectionStart
    let end = $textarea.selectionEnd
    let oldText = $textarea.value

    $textarea.value = `${oldText.substring(0, start)}${text} ${oldText.substring(end)}`
    $textarea.focus()
    $textarea.setSelectionRange(start, start + text.length)
  }
}

const Editor = {
  init() {
    console.log('Editor init...')
    this.$editInput = $('.editor textarea')
    this.$saveBtn = $('.editor .button-save')
    this.$slideContainer = $('.slides')
    this.markdown = localStorage.markdown || TPL

    this.bind()
    this.start()
  },
  bind() {
    this.$saveBtn.onclick = () => {
      localStorage.markdown = this.$editInput.value
      location.reload()
    }
  },
  start() {
    this.$editInput.value = this.markdown
    this.$slideContainer.innerHTML = convert(this.markdown)
    Reveal.initialize({
      controls: true,
      progress: true,
      center: localStorage.align !== 'left-top',
      hash: true,
      transition: localStorage.transition || 'slide',

      // Learn about plugins: https://revealjs.com/plugins/
      plugins: [RevealZoom, RevealNotes, RevealSearch, RevealMarkdown, RevealHighlight]
    })
  }
}

const Theme = {
  init() {
    console.log('Theme init...')
    this.$$figures = $$('.theme figure')
    this.$transition = $('.theme .transition')
    this.$align = $('.theme .align')
    this.$reveal = $('.reveal')

    this.bind()
    this.loadTheme()
  },
  bind() {
    this.$$figures.forEach($figure => $figure.onclick = () => {
      this.$$figures.forEach($item => $item.classList.remove('selected'))
      $figure.classList.add('selected')
      this.setTheme($figure.dataset.theme)
    })

    this.$transition.onchange = function () {
      localStorage.transition = this.value
      location.reload()
    }

    this.$align.onchange = function () {
      localStorage.align = this.value
      location.reload()
    }
  },
  setTheme(theme) {
    console.log(theme)

    localStorage.theme = theme
    location.reload()
  },
  loadTheme() {
    let theme = localStorage.theme || 'black'
    let $link = document.createElement('link')
    $link.rel = 'stylesheet'
    $link.href = `dist/theme/${theme}.css`
    document.head.appendChild($link)

    Array.from(this.$$figures).find($figure => $figure.dataset.theme === theme).classList.add('selected')
    this.$transition.value = localStorage.transition || 'slide'

    this.$align.value = localStorage.align || 'center'
    this.$reveal.classList.add(this.$align.value)
  }
}

const Print = {
  init() {
    console.log('Print init...')
    this.$download = $('.download')
    this.bind()
    this.start()
  },
  bind() {
    this.$download.addEventListener('click', () => {
      let href = location.href
      let $link = document.createElement('a')
      $link.setAttribute('target', '_blank')
      $link.setAttribute('href', location.pathname + '?print-pdf')
      $link.click()
    })
  },
  start() {
    let link = document.createElement('link')
    link.rel = 'stylesheet'
    if (window.location.search.match(/print-pdf/gi)) {
      link.href = 'css/print/pdf.css'
      window.print()
    } else {
      link.href = 'css/print/paper.css'
    }
    document.head.appendChild(link)
  }
}

const App = {
  init() {
    [...arguments].forEach(Module => Module.init())
  }
}
App.init(Menu, ImgUploader, Editor, Theme, Print)
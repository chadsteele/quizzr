import "tailwindcss/tailwind.css"
import "solid-js"
import { createSignal, Show, For } from "solid-js"
import tokenizer from "sbd"
import lorem from "./loremipsum"

document.title = "qzi.cool"


function App () {
  const [text, setText] = createSignal('')
  const [list, setList] = createSignal([])
  let keywords = new Set()

  function parse (str) {
    setText((str.length && str) || document.getElementById("textarea").value)
    keywords = new Set(text().match(/__[^_]+__/g).map(s => { return s.replaceAll('__', '') }))
    var list = tokenizer.sentences(text())

    list = list.map(item => {
      // check for answer
      let ans = false
      if (item.includes('__')) {
        ans = item.split('__')[1]
      } else {
        // prefer keywords
        for (const keyword of keywords) {
          if (item.includes(keyword)) {
            ans = keyword
            break
          }
        }
        if (!ans) { // default to the longest word in the sentence
          const words = item.match(/\w+/g).sort((a, b) => { return b.length - a.length })
          ans = words[0]
          keywords.add(ans)
        }
      }
      return {
        text: item,
        ans: ans
      }
    })
    setList(list)
  }

  function formatQA (item) {
    var text = item.text.replaceAll('__', '')
    const ans = item.ans
    const segments = text.split(ans)

    return (<For each={segments}>
      {(segment, i) => {
        return <span>{segment}
          {(i() < segments.length - 1) && <input placeholder={ans} class="input input-bordered" />}
        </span>
      }}
    </For>)
  }

  parse(lorem)

  return (
    <div class="container mx-auto m-5 prose" data-theme="light">

      <h1><img src="./src/assets/logo.png" style={{ height: '2rem', display: 'inline' }} /> {document.title}</h1>

      <textarea id="textarea" value={text()}
        class="textarea-bordered textarea min-w-full"
        placeholder="Cut'n Paste your document here"></textarea>
      <a class="btn btn-primary" onClick={parse}>Parse</a>
      <div >
        <For each={list()}>{(item) => {
          return <div style={"margin-top: 3rem"} >
            {formatQA(item)}<br />
          </div>
        }}
        </For>
      </div >

    </div >
  )
}

export default App;


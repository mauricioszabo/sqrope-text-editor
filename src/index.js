const createSQRope = require('../../sqrope/src/index')

function editorKeyDown(editor) {
  return (evt) => {
    const {ctrlKey, altKey, shiftKey, code} = evt
    console.log("CODE", code)
    switch(code) {
    case("Backspace"):
      if(ctrlKey) editor.deleteToBeginningOfWord()
      else editor.backspace()
      break;
    case("Enter"):
      editor.insertNewline()
      break;
    case("ArrowUp"):
      editor.moveUp()
      break;
    case("ArrowDown"):
      editor.moveDown()
      break;
    case("ArrowLeft"):
      if(ctrlKey) editor.moveToBeginningOfWord()
      else editor.moveLeft()
      break;
    case("ArrowRight"):
      if(ctrlKey) editor.moveToBeginningOfNextWord()
      else editor.moveRight()
      break;
    }
  }
}

function createEditor(data) {
  const div = document.createElement('atom-text-editor')
  data.getText().then(txt => div.innerText = txt)
  return div
}

async function main() {
  let data = await createSQRope({db: ":memory:", rowChunkChars: 30})
  await data.loadString("Hello\nWorld!\n\nThis is an example")
  const editor = createEditor(data)
  const pane = document.querySelector('atom-pane')
  editor.onkeydown = editorKeyDown(editor)
  pane.appendChild(editor)
}
main()

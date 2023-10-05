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

function createEditor(rope) {
  const div = document.createElement('atom-text-editor')
  div.style['flex-direction'] = 'column'
  // Hard-limiting 10 rows and 80 cols (0-based)
  const firstRow = 0, firstCol = 0, lastRow = 9, lastCol = 79
  let idsRendered = new Set()

  const populateEditor = async () => {
    let currentRange = {
      start: {row: -1, column: firstCol},
      end: {row: -1, column: lastCol}
    }
    let lastRopeRange = {range: {start: {row: 0}, end: {row: 0}}}
    for(let i = firstRow; i <= lastRow; i++) {
      currentRange.start.row = i
      currentRange.end.row = i
      console.log("RENDERING ROW", i)
      if(!contains(lastRopeRange.range, currentRange)) {
        console.log("Doesn't contain?", i)
        lastRopeRange = await queryRopeAndAddToEditor(rope, currentRange, div, idsRendered)
        // lastRopeRange = await data.getNodesInRange(currentRange)
      }
    }
  }
  populateEditor()
  // rope.getText().then(txt => div.innerText = txt)
  return div
}

async function queryRopeAndAddToEditor(rope, range, editorElement, idsRendered) {
  const ropeRange = await rope.getNodesInRange(range)
  console.log("Found rope", ropeRange)
  let currentRow = ropeRange.range.start.row
  ropeRange.records.forEach(node => {
    if(idsRendered.has(node.id)) return
    node.text.split("\n").forEach((text, subRow) => {
      if(subRow !== 0) currentRow++
      console.log("Rendering fragment", JSON.stringify(text), "of id", node.id)
      const rowDiv = queryOrCreateLine(currentRow, editorElement)
      const span = document.createElement('span')
      span.classList.add('fragment')
      span.setAttribute('data-rope-id', node.id)
      span.innerText = text
      rowDiv.appendChild(span)
      idsRendered.add(node.id)
    })
  })
  return ropeRange
}

function queryOrCreateLine(row, editorElement) {
  let rowDiv = document.querySelector(`div.line[data-screen-row='${row}']`)
  if(!rowDiv) {
    rowDiv = document.createElement('div')
    rowDiv.classList.add('line')
    rowDiv.setAttribute('data-screen-row', row)
    editorElement.appendChild(rowDiv)
  }
  return rowDiv
}

// If range1 contains range2
function contains(range1, range2) {
  global.range1 = range1
  global.range2 = range2
  const rowsInRange = (range1.start.row <= range2.start.row && range2.end.row <= range1.end.row)
  if(!rowsInRange) return false

  const sameStartRow = range1.start.row === range2.start.row
  let startColInRange = sameStartRow ? range1.start.column <= range2.start.column : true

  const sameEndRow = range1.end.row === range2.end.row
  let endColInRange = sameEndRow ? range2.end.column <= range1.end.column : true
  return startColInRange && endColInRange
}

async function main() {
  let data = await createSQRope({db: ":memory:", rowChunkChars: 30})
  const text = `Hello
World!
This is an example

With 11 lines
Because we currently can't
  actually find the number of lines
  we have on the rope structure

So we're going to hardcoded that
Sorry about that :D
`
  await data.loadString(text)
  const editor = createEditor(data)
  const pane = document.querySelector('atom-pane')
  editor.onkeydown = editorKeyDown(editor)
  pane.appendChild(editor)
}
main()

$('#filePicker').on('change', handleTocFile)
$('#savFilePicker').on('change', handleSavFile)
$('#saveSav').on('click', handleDone)

const containerSwitch = (show) => {
  $(`.step`).filter(show).addClass('show').removeClass('hide').end().not(show).addClass('hide').removeClass('show')
}

function handleTocFile() {
  const fileList = this.files
  if (fileList.length !== 1) return
  const fileObj = fileList[0]
  
  const reader = new FileReader()
  reader.readAsText(fileObj, "UTF-8")
  reader.onload = handleTocJSON
}

function handleTocJSON(e) {
  try {
    const json = JSON.parse(e.target.result)
    let saveGamesContainer = $('#saveFiles')

    json.saveGames.forEach((saveGame, i) => {
      saveGamesContainer.append(`<button class="selectSave" save="${i}">${saveGame.playerName} - Day ${saveGame.gameDay}</button>`)
    })

    $('.selectSave').on('click', evt => {
      let saveSelection = $(evt.currentTarget).attr('save')
      let saveFile = json.saveGames[saveSelection]
      handleSaveSelection(saveFile)
    })

    containerSwitch('.step2')
  } catch (err) {
    alert('Unable to parse save file! Ensure you have selected the ooblets_toc.sav file.')
  }
}

function handleSaveSelection (saveFile) {
  console.log(saveFile)
  $('.saveFileNumberReplace').text(saveFile.latestSave)
  $('.saveFileNameReplace').text(saveFile.gameName)
  window.playerName = saveFile.playerName
  window.latestSave = saveFile.latestSave
  containerSwitch('.step3')
}

function handleSavFile() {
  const fileList = this.files
  if (fileList.length !== 1) return
  const fileObj = fileList[0]
  
  const reader = new FileReader()
  reader.readAsText(fileObj, "UTF-8")
  reader.onload = handleSavJSON
}

function handleSavJSON(e) {
  try {
    const json = JSON.parse(e.target.result)
    doSaveCollection(json)
  } catch (err) {
    alert('Unable to parse save file!')
  }
}

function doSaveCollection(json) {
  // TODO: REMOVE ME
  console.log(json)
  window.saveFile = json

  const gameManager = window.saveFile.listOfGameManager[1]
  const invManager = json.listOfInventoryManager.filter(inv => inv.playerName === window.playerName)[0]
  const metaManager = window.saveFile.listOfMetaManager[1]

  $('#gummies').val(invManager.money)
  $('#wishies').val(invManager.sparklePoints.amt)
  $('#level').val(invManager.playerLevel)
  $('#wateringCanLevel').val(invManager.wateringCanLevel)
  $('#name').val(invManager.playerName)

  $('#weather').val(gameManager.todayDayTag)
  $('#timeOfDayInTicks').val(gameManager.timeOfDayInTicks)

  $('#x').val(metaManager.lastKnownPosition.x)
  $('#y').val(metaManager.lastKnownPosition.y)
  $('#z').val(metaManager.lastKnownPosition.z)

  // Switch it up!
  containerSwitch('.step4')
}

function download(data, filename, type) {
  let file = new Blob([data], {type: type})
  let a = document.createElement("a")
  let url = URL.createObjectURL(file)
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(function() {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
  }, 0)
}

function handleDone() {
  const gameManager = window.saveFile.listOfGameManager[1]
  const invManager = window.saveFile.listOfInventoryManager.filter(inv => inv.playerName === window.playerName)[0]
  const metaManager = window.saveFile.listOfMetaManager[1]

  let empty = $('.saveEditor input').filter(function () {
    return $(this).val().length < 1;
  })
  if (empty[0]) return alert('No fields may be empty!')

  invManager.money = $('#gummies').val()
  invManager.sparklePoints.amt = $('#wishies').val()
  invManager.playerLevel = $('#level').val()
  invManager.wateringCanLevel = $('#wateringCanLevel').val()
  invManager.playerName = $('#name').val()

  gameManager.todayDayTag = $('#weather').val()
  gameManager.timeOfDayInTicks = $('#timeOfDayInTicks').val()

  metaManager.lastKnownPosition.x = $('#x').val()
  metaManager.lastKnownPosition.x = $('#y').val()
  metaManager.lastKnownPosition.x = $('#z').val()

  containerSwitch('.step5')
}

$('.download').on('click', () => {
  download(JSON.stringify(window.saveFile), `${window.latestSave}.sav`, 'application/json')
})

$('img[alt]').each(function () {
  $(this).attr('title', $(this).attr('alt'))
})
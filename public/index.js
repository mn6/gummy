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
    console.log(err)
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
    console.log(err)
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
  const oobletStats = window.saveFile.listOfOobletStats

  $('#gummies').val(invManager.money)
  $('#wishies').val(invManager.sparklePoints.amt)
  $('#level').val(invManager.playerLevel)
  $('#wateringCanLevel').val(invManager.wateringCanLevel)

  $('#weather').val(gameManager.todayDayTag)
  $('#timeOfDayInTicks').val(gameManager.timeOfDayInTicks)

  $('#x').val(metaManager.lastKnownPosition.x)
  $('#y').val(metaManager.lastKnownPosition.y)
  $('#z').val(metaManager.lastKnownPosition.z)
  $('#lastKnownScene').val(metaManager.lastKnownScene)

  oobletStats.forEach(ooblet => {
    if (ooblet.name.length < 1) return
    if (!~[1, 6, 7].indexOf(ooblet.status)) return

    let oobletDOM = $(`
      <tr class="ooblet" species="${ooblet.name}" nickName="${ooblet.nickName}" xp="${ooblet.XP}" level="${ooblet.level}" status="${ooblet.status}" rarity="${ooblet.rarity}">
        <td class="species"><img src="./img/Sprite/${ooblet.name.split('_')[0]}_common.png" /> ${ooblet.name.split('_')[0]}</td>
        <td class="nickName">
          <input type="text" style="width: 100% !important;">
        </td>
        <td class="level">
          <input type="text" style="width: 100% !important;">
        </td>
        <td class="rarity">
          <select class="oobletRarity" style="width: 100% !important;">
            <option value="0">Common</option>
            <option value="1">Uncommon</option>
            <option value="2">Gleamy</option>
          </select>
        </td>
        <td class="status">
          <select class="oobletStatus" style="width: 100% !important;">
            <option value="1">Following</option>
            <option value="6" disabled>In Farm</option>
            <option value="7">At Home</option>
          </select>
        </td>
      </tr>
    `)

    oobletDOM.find('.nickName input').val(ooblet.nickName)
    oobletDOM.find('.level input').val(ooblet.level)
    oobletDOM.find(`.oobletRarity [value="${ooblet.rarity}"]`)[0].selected = true
    oobletDOM.find(`.oobletStatus [value="${ooblet.status}"]`)[0].selected = true
    if (ooblet.status == 6) oobletDOM.find('.oobletStatus').attr('disabled', 'true').find('[disabled]').removeAttr('disabled')

    $('.ooblets table tbody').append(oobletDOM)
  })

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
  try {
    const gameManager = window.saveFile.listOfGameManager[1]
    const invManager = window.saveFile.listOfInventoryManager.filter(inv => inv.playerName === window.playerName)[0]
    const metaManager = window.saveFile.listOfMetaManager[1]
    const oobletStats = window.saveFile.listOfOobletStats
  
    let empty = $('.saveEditor input').filter(function () {
      return $(this).val().length < 1;
    })
    if (empty[0]) return alert('No fields may be empty!')
  
    invManager.money = +$('#gummies').val()
    invManager.sparklePoints.amt = +$('#wishies').val()
    invManager.playerLevel = +$('#level').val()
    invManager.wateringCanLevel = +$('#wateringCanLevel').val()
  
    gameManager.todayDayTag = $('#weather').val()
    gameManager.timeOfDayInTicks = +$('#timeOfDayInTicks').val()
  
    metaManager.lastKnownPosition.x = +$('#x').val()
    metaManager.lastKnownPosition.y = +$('#y').val()
    metaManager.lastKnownPosition.z = +$('#z').val()
    metaManager.lastKnownScene = +$('#lastKnownScene').val()
  
    // Ooblets
    $('.ooblet').each(function () {
      let thisLevel = $(this).find('.level input').val()
      let thisRarity = $(this).find('.rarity select').val()
      let thisNickName = $(this).find('.nickName input').val()
      let thisStatus = $(this).find('.status select').val()

      let filteredOoblet = oobletStats.filter(ooblet => ooblet.nickName == $(this).attr('nickName') && ooblet.level == $(this).attr('level') && ooblet.XP == $(this).attr('xp') && ooblet.status == $(this).attr('status') && ooblet.rarity == $(this).attr('rarity') && ooblet.name == $(this).attr('species'))[0]

      if (filteredOoblet.level == thisLevel && filteredOoblet.rarity == thisRarity && filteredOoblet.nickName == thisNickName && filteredOoblet.status == thisStatus) return

      // Has been changed, save this
      filteredOoblet.level = thisLevel
      filteredOoblet.rarity = thisRarity
      filteredOoblet.nickName = thisNickName
      filteredOoblet.status = thisStatus

      let index = oobletStats.findIndex(ooblet => ooblet.nickName == $(this).attr('nickName') && ooblet.level == $(this).attr('level') && ooblet.XP == $(this).attr('xp') && ooblet.status == $(this).attr('status') && ooblet.rarity == $(this).attr('rarity') && ooblet.name == $(this).attr('species'))
      window.saveFile.listOfOobletStats[index] = filteredOoblet
    })

    containerSwitch('.step5')
  } catch (err) {
    console.log(err)
    alert('Error with inputs provided!')
  }
}

$('.download').on('click', () => {
  download(JSON.stringify(window.saveFile), `${window.latestSave}.sav`, 'application/json')
})

$('img[alt]').each(function () {
  $(this).attr('title', $(this).attr('alt'))
})

$('.positionPreset').on('click', function () {
  $('#x').val($(this).attr('x'))
  $('#y').val($(this).attr('y'))
  $('#z').val($(this).attr('z'))
  $('#lastKnownScene').val($(this).attr('scene'))
})